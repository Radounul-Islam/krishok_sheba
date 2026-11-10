import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class FarmerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone_number: str = Field(min_length=6, max_length=32)
    password: str = Field(min_length=8, max_length=128)
    location: str = Field(default="", max_length=160)
    preferred_language: str = Field(default="bn", pattern="^(bn|en)$")


class FarmerLogin(BaseModel):
    phone_number: str
    password: str


class FarmerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    location: str | None = Field(default=None, max_length=160)
    preferred_language: str | None = Field(default=None, pattern="^(bn|en)$")


class FarmerRead(BaseModel):
    id: uuid.UUID
    name: str
    phone_number: str
    location: str
    preferred_language: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenRead(BaseModel):
    access_token: str
    token_type: str = "bearer"
    farmer: FarmerRead


class CropCreate(BaseModel):
    crop_type: str = Field(min_length=2, max_length=100)
    planting_date: date | None = None


class CropRead(BaseModel):
    id: uuid.UUID
    crop_type: str
    planting_date: date | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DiagnosisRead(BaseModel):
    id: uuid.UUID
    crop_id: uuid.UUID | None
    disease_name: str
    confidence: float
    severity: str
    medicine: str
    dosage: str
    advice_language: str
    created_at: datetime
    demo_result: bool = False
    cause: str | None = None
    organic_treatment: str | None = None
    prevention: str | None = None
    safety_alert: str | None = None
    pathogen: str | None = None
    is_healthy: bool = False

    model_config = ConfigDict(from_attributes=True)

