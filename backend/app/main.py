import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.config import settings
from app.db import Base, engine, get_db
from app.dependencies import get_current_farmer, get_optional_farmer
from app.models import Crop, Diagnosis, Farmer, QueryLog
from app.schemas import (
    CropCreate,
    CropRead,
    DiagnosisRead,
    FarmerCreate,
    FarmerLogin,
    FarmerRead,
    FarmerUpdate,
    TokenRead,
)
from app.security import create_access_token, hash_password, verify_password
from app.services.market import fetch_market_analytics, get_all_commodities
from app.services.pathology import classify_crop_disease
from app.services.weather import fetch_weather_advisory, get_all_districts


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="Krishok Seba API",
    description="Farmer profile, crop health, weather, and market advisory API.",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _farmer_read(farmer: Farmer) -> FarmerRead:
    return FarmerRead.model_validate(farmer)


def _log_query(db: Session, farmer: Farmer | None, query_type: str, request_data: dict, response_data: dict) -> None:
    if farmer is not None:
        db.add(QueryLog(farmer_id=farmer.id, query_type=query_type, request_data=request_data, response_data=response_data))
        db.commit()



@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "krishok-sheba-api"}


@app.post("/api/v1/auth/register", response_model=TokenRead, status_code=status.HTTP_201_CREATED)
def register(payload: FarmerCreate, db: Session = Depends(get_db)) -> TokenRead:
    farmer = Farmer(
        name=payload.name.strip(),
        phone_number=payload.phone_number.strip(),
        password_hash=hash_password(payload.password),
        location=payload.location.strip(),
        preferred_language=payload.preferred_language,
    )
    db.add(farmer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="This phone number is already registered.") from None
    db.refresh(farmer)
    return TokenRead(access_token=create_access_token(farmer.id), farmer=_farmer_read(farmer))


@app.post("/api/v1/auth/login", response_model=TokenRead)
def login(payload: FarmerLogin, db: Session = Depends(get_db)) -> TokenRead:
    farmer = db.scalar(select(Farmer).where(Farmer.phone_number == payload.phone_number.strip()))
    if farmer is None or not verify_password(payload.password, farmer.password_hash):
        raise HTTPException(status_code=401, detail="Phone number or password is incorrect.")
    return TokenRead(access_token=create_access_token(farmer.id), farmer=_farmer_read(farmer))


@app.get("/api/v1/profile", response_model=FarmerRead)
def read_profile(farmer: Farmer = Depends(get_current_farmer)) -> FarmerRead:
    return _farmer_read(farmer)


@app.patch("/api/v1/profile", response_model=FarmerRead)
def update_profile(
    payload: FarmerUpdate,
    db: Session = Depends(get_db),
    farmer: Farmer = Depends(get_current_farmer),
) -> FarmerRead:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(farmer, key, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(farmer)
    return _farmer_read(farmer)


@app.get("/api/v1/crops", response_model=list[CropRead])
def list_crops(db: Session = Depends(get_db), farmer: Farmer = Depends(get_current_farmer)) -> list[Crop]:
    return list(db.scalars(select(Crop).where(Crop.farmer_id == farmer.id).order_by(Crop.created_at.desc())))


@app.post("/api/v1/crops", response_model=CropRead, status_code=status.HTTP_201_CREATED)
def create_crop(
    payload: CropCreate,
    db: Session = Depends(get_db),
    farmer: Farmer = Depends(get_current_farmer),
) -> Crop:
    crop = Crop(farmer_id=farmer.id, crop_type=payload.crop_type.strip(), planting_date=payload.planting_date)
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop


@app.get("/api/v1/diagnoses", response_model=list[DiagnosisRead])
def diagnosis_history(db: Session = Depends(get_db), farmer: Farmer = Depends(get_current_farmer)) -> list[Diagnosis]:
    return list(db.scalars(select(Diagnosis).where(Diagnosis.farmer_id == farmer.id).order_by(Diagnosis.created_at.desc())))


@app.get("/api/v1/districts")
def list_districts() -> list[dict]:
    """Returns all supported agricultural districts in Bangladesh."""
    return get_all_districts()


@app.get("/api/v1/market/commodities")
def list_commodities() -> list[dict]:
    """Returns all tracked agricultural commodities."""
    return get_all_commodities()


@app.post("/api/v1/diagnoses", response_model=DiagnosisRead, status_code=status.HTTP_201_CREATED)
async def diagnose_leaf(
    image: UploadFile = File(...),
    crop_id: uuid.UUID | None = Form(default=None),
    crop_hint: str | None = Form(default=None),
    language: str = Form(default="bn"),
    db: Session = Depends(get_db),
    farmer: Farmer | None = Depends(get_optional_farmer),
) -> DiagnosisRead:
    if language not in {"bn", "en"}:
        raise HTTPException(status_code=422, detail="Language must be 'bn' or 'en'.")
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Upload a JPG, PNG, or WebP image.")
    contents = await image.read(settings.max_upload_size_mb * 1024 * 1024 + 1)
    if len(contents) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Image must be smaller than {settings.max_upload_size_mb} MB.")

    crop_name = crop_hint
    if crop_id is not None and farmer is not None:
        matched_crop = db.scalar(select(Crop).where(Crop.id == crop_id, Crop.farmer_id == farmer.id))
        if matched_crop:
            crop_name = matched_crop.crop_type

    # Real intelligent computer vision pathology classification & verified prescription
    result = classify_crop_disease(contents, image.content_type, crop_hint=crop_name, language=language)

    if farmer is not None:
        image_path = Path(settings.upload_dir) / f"{uuid.uuid4()}.{image.filename.rsplit('.', 1)[-1].lower() if image.filename and '.' in image.filename else 'img'}"
        image_path.parent.mkdir(parents=True, exist_ok=True)
        image_path.write_bytes(contents)

        record = Diagnosis(
            farmer_id=farmer.id,
            crop_id=crop_id,
            image_path=str(image_path),
            disease_name=str(result["disease_name"])[:160],
            confidence=float(result["confidence"]),
            severity=str(result["severity"]),
            medicine=str(result["medicine"]),
            dosage=str(result["dosage"]),
            advice_language=language,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        response = DiagnosisRead.model_validate(record)
    else:
        response = DiagnosisRead(
            id=uuid.uuid4(),
            crop_id=None,
            disease_name=str(result["disease_name"])[:160],
            confidence=float(result["confidence"]),
            severity=str(result["severity"]),
            medicine=str(result["medicine"]),
            dosage=str(result["dosage"]),
            advice_language=language,
            created_at=datetime.now(),
        )

    response.demo_result = False
    response.cause = result.get("cause")
    response.organic_treatment = result.get("organic_treatment")
    response.prevention = result.get("prevention")
    response.safety_alert = result.get("safety_alert")
    response.pathogen = result.get("pathogen")
    response.is_healthy = result.get("is_healthy", False)

    _log_query(db, farmer, "diagnosis", {"crop_hint": crop_name, "language": language}, result)
    return response


@app.get("/api/v1/weather")
def weather_advisory(
    lat: float | None = None,
    lon: float | None = None,
    district: str | None = None,
    location: str | None = None,
    language: str = "bn",
    db: Session = Depends(get_db),
    farmer: Farmer | None = Depends(get_optional_farmer),
) -> dict:
    if language not in {"bn", "en"}:
        raise HTTPException(status_code=422, detail="Language must be 'bn' or 'en'.")
    if lat is not None and not (-90 <= lat <= 90):
        lat = None
    if lon is not None and not (-180 <= lon <= 180):
        lon = None

    target_district = district or location or (farmer.location if farmer and farmer.location else None)
    result = fetch_weather_advisory(lat=lat, lon=lon, district=target_district, language=language)
    _log_query(db, farmer, "weather", {"district": target_district, "lat": lat, "lon": lon}, result)
    return result


@app.get("/api/v1/market")
def market_insight(
    crop: str = "rice",
    location: str | None = None,
    language: str = "bn",
    db: Session = Depends(get_db),
    farmer: Farmer | None = Depends(get_optional_farmer),
) -> dict:
    if language not in {"bn", "en"}:
        raise HTTPException(status_code=422, detail="Language must be 'bn' or 'en'.")

    target_location = location or (farmer.location if farmer and farmer.location else "Rajshahi")
    result = fetch_market_analytics(crop=crop, location=target_location, language=language)
    _log_query(db, farmer, "market", {"crop": crop, "location": target_location}, result)
    return result

