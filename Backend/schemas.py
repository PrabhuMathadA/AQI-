from pydantic import BaseModel, EmailStr

# User creation (Register)
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

# Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Forgot password
class ForgotPassword(BaseModel):
    email: EmailStr

# Response Model (optional)
class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        orm_mode = True
