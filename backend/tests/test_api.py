import io
from fastapi.testclient import TestClient
from PIL import Image
import pytest

from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "service": "krishok-sheba-api"}


def test_districts_list():
    res = client.get("/api/v1/districts")
    assert res.status_code == 200
    districts = res.json()
    assert len(districts) >= 15
    assert any(d["name_en"] == "Rajshahi" for d in districts)
    assert any(d["name_bn"] == "রাজশাহী" for d in districts)


def test_commodities_list():
    res = client.get("/api/v1/market/commodities")
    assert res.status_code == 200
    commodities = res.json()
    assert len(commodities) >= 8
    assert any(c["id"] == "rice" for c in commodities)
    assert any(c["id"] == "potato" for c in commodities)


def test_weather_endpoint_district():
    res = client.get("/api/v1/weather?district=Rajshahi&language=bn")
    assert res.status_code == 200
    data = res.json()
    assert data["district"] == "রাজশাহী"
    assert "temperature_c" in data
    assert "forecast" in data
    assert len(data["forecast"]) >= 3
    assert data["spray_status"] in {"Good", "Moderate", "Poor"}
    assert "spray_advisory" in data

    res_en = client.get("/api/v1/weather?district=Rangpur&language=en")
    assert res_en.status_code == 200
    assert res_en.json()["district"] == "Rangpur"


def test_weather_endpoint_coords():
    res = client.get("/api/v1/weather?lat=24.37&lon=88.60&language=bn")
    assert res.status_code == 200
    data = res.json()
    assert "temperature_c" in data


def test_market_endpoint():
    res = client.get("/api/v1/market?crop=rice&location=Rajshahi&language=bn")
    assert res.status_code == 200
    data = res.json()
    assert "ধান" in data["crop"]
    assert "current_price" in data
    assert "farmgate_price" in data
    assert "wholesale_price" in data
    assert "retail_price" in data
    assert "history" in data
    assert len(data["history"]) >= 20

    res_en = client.get("/api/v1/market?crop=potato&location=Bogura&language=en")
    assert res_en.status_code == 200
    assert "Potato" in res_en.json()["crop"]


def test_guest_diagnosis():
    img = Image.new("RGB", (80, 80), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    res = client.post(
        "/api/v1/diagnoses",
        files={"image": ("test_leaf.jpg", buf, "image/jpeg")},
        data={"language": "bn", "crop_hint": "rice"},
    )
    assert res.status_code == 201
    data = res.json()
    assert "disease_name" in data
    assert "confidence" in data
    assert "medicine" in data
    assert "dosage" in data
    assert data["confidence"] > 0


def test_farmer_auth_and_records():
    unique_phone = f"0171{io.BytesIO().seek(0) or id(client) % 10000000:07d}"
    
    # Register
    reg_payload = {
        "name": "Test Farmer",
        "phone_number": unique_phone,
        "password": "strongPassword123",
        "location": "Dinajpur",
        "preferred_language": "bn",
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    if reg_res.status_code == 409:
        login_res = client.post(
            "/api/v1/auth/login",
            json={"phone_number": unique_phone, "password": "strongPassword123"},
        )
        token = login_res.json()["access_token"]
    else:
        assert reg_res.status_code == 201
        token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # Profile
    prof_res = client.get("/api/v1/profile", headers=headers)
    assert prof_res.status_code == 200
    assert prof_res.json()["name"] == "Test Farmer"

    # Update profile
    patch_res = client.patch(
        "/api/v1/profile",
        headers=headers,
        json={"location": "Bogura"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["location"] == "Bogura"

    # Add crop
    crop_res = client.post(
        "/api/v1/crops",
        headers=headers,
        json={"crop_type": "Kataribhog Rice"},
    )
    assert crop_res.status_code == 201
    crop_id = crop_res.json()["id"]

    # List crops
    crops_res = client.get("/api/v1/crops", headers=headers)
    assert crops_res.status_code == 200
    assert any(c["id"] == crop_id for c in crops_res.json())

    # Diagnose for logged in farmer with crop_id
    img = Image.new("RGB", (80, 80), color=(140, 90, 40))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    diag_res = client.post(
        "/api/v1/diagnoses",
        headers=headers,
        files={"image": ("diseased_leaf.jpg", buf, "image/jpeg")},
        data={"language": "bn", "crop_id": crop_id},
    )
    assert diag_res.status_code == 201
    assert diag_res.json()["crop_id"] == crop_id

    # History
    hist_res = client.get("/api/v1/diagnoses", headers=headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1

