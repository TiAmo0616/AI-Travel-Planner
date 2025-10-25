from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# 请求
class UserRegister(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class ItineraryRequest(BaseModel):
    destination: str
    dates: str
    budget: str
    travelers: str
    preferences: str
    


class TripIn(BaseModel):
    destination: str
    dates: str
    budget: str
    travelers:str
    preferences: str
    plan: Optional[str] = None
    summary: Optional[str] = None
    title: Optional[str] = None


# 响应
class UserOut(BaseModel):
    id: Optional[str]
    email: str

#数据库中的trip表
class TripOut(BaseModel):
    id: Optional[str] = None
    owner: str
    destination: str
    dates: str                 # 表里 text，不是 int
    budget: str
    travelers: str
    preferences: str
    plan: Optional[str] = None
    created_at: Optional[datetime] = None
    summary: Optional[str] = None
    title: Optional[str] = None


class ExpenseBase(BaseModel):
    category: str
    amount: float
    date: str
    description: Optional[str] = None
    location: Optional[str] = None
    participants: int = 1
    trip_id: Optional[str] = None

class ExpenseIn(ExpenseBase):
    pass

class ExpenseOut(ExpenseBase):
    id: str
    owner: str
    created_at: str