from sqlmodel import SQLModel, create_engine
import os

DATABASE_URL = os.getenv("DB_FILE", "sqlite:///./travel.db")
engine = create_engine(DATABASE_URL, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine
    )
