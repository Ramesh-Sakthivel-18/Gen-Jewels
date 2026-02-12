from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# 1. Login/Register Schemas
class UserCreate(BaseModel):
    username: str
    password: str
    owner_name: str
    company_name: str
    address: str
    phone_number: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# 2. Jewelry Generation Input Schema
class DesignRequest(BaseModel):
    jewelry_type: str   
    style: str          
    material: str       
    stone: str          
    theme: str          
    size: str           
    finish: str         
    extra_text: Optional[str] = None

# 3. Output Schema (Immediate Creation Response)
class DesignResponse(BaseModel):
    image_url: str
    final_prompt: str
    status: str

# 4. History Schema (NEW: For the Gallery)
class DesignHistoryItem(BaseModel):
    id: int
    jewelry_type: str
    material: str
    stone: str
    image_path: str  # We will map this to image_url in frontend
    final_prompt: str
    created_at: datetime

    class Config:
        from_attributes = True  # Allows Pydantic to read SQLAlchemy models