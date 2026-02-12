from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from app.models import User, Company
from app.schemas import UserCreate, UserLogin, Token
from app.utils.security import get_hashed_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # 1. Create User
    new_user = User(
        username=user_data.username,
        password_hash=get_hashed_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 2. Create Company Profile
    new_company = Company(
        user_id=new_user.id,
        owner_name=user_data.owner_name,
        company_name=user_data.company_name,
        address=user_data.address,
        phone_number=user_data.phone_number
    )
    db.add(new_company)
    db.commit()

    # 3. Generate Token
    access_token = create_access_token(new_user.username)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(user.username)
    return {"access_token": access_token, "token_type": "bearer"}