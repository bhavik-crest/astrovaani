# schemas.py
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import date


class BirthRequest(BaseModel):
    name: Optional[str] = Field(None, description="Full name (optional)")
    dob: date = Field(..., description="Date of birth (YYYY-MM-DD)")
    tob: str = Field(..., description="Time of birth (HH:MM or approximate)")
    pob: str = Field(..., description="Place of birth (city, country)")
    language: str = Field(default="english", pattern="^(english|hindi|gujarati)$")
    extra: Optional[Dict[str, Any]] = Field(None, description="Optional extra inputs (e.g., questions)")


class ReportResponse(BaseModel):
    id: Optional[str]
    name: Optional[str]
    dob: date
    tob: str
    pob: str
    language: str
    ai_output: Dict[str, Any]
    created_at: Optional[str]
