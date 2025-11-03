from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()

@router.post("/register")
def register_user(data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = models.User(name=data.name, email=data.email, password=data.password)
    db.add(new_user)

    
    db.commit()
    db.refresh(new_user)

    return {"message": "Registration successful", "user": new_user.name}

@router.post("/login")
def login_user(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user": user.name}

@router.post("/forgot-password")
def forgot_password(data: schemas.ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")
    return {"message": f"Password reset link sent to {data.email}"}
