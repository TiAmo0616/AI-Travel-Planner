from typing import Optional
from sqlmodel import SQLModel, Field

class Trip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: Optional[str]
    destination: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    budget_total: Optional[float]
    days: Optional[int]
    preferences: Optional[str]
    notes: Optional[str]

class Expense(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trip_id: int
    amount: float
    category: Optional[str]
    note: Optional[str]
    recorded_at: Optional[str]
