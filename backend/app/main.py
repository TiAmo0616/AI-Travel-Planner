from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from sqlmodel import Session, select
from .db import engine, create_db_and_tables
from .models import Trip, Expense
from .nlu import parse_text
from .generator import generate_trip_text
import shutil
import os
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title='AI Travel Planner - Backend')
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或指定前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
create_db_and_tables()

@app.post('/api/voice/stt')
async def voice_stt(file: UploadFile = File(None), text: str = Form(None)):
    """简易 STT 接口：优先返回 text 字段；若上传音频，将保存并返回占位转写。"""
    if text:
        return {'transcript': text, 'source': 'text'}
    if file:
        tmp_dir = 'backend/tmp'
        os.makedirs(tmp_dir, exist_ok=True)
        path = os.path.join(tmp_dir, file.filename)
        with open(path, 'wb') as f:
            shutil.copyfileobj(file.file, f)
        return {'transcript': '（未配置外部 STT）', 'note': f'saved to {path}'}
    raise HTTPException(status_code=400, detail='No input provided')

@app.post('/api/nlu/parse')
def nlu_parse(payload: dict):
    text = payload.get('text') if isinstance(payload, dict) else None
    if not text:
        raise HTTPException(status_code=400, detail='text is required')
    return parse_text(text)

@app.post('/api/trips')
def create_trip(payload: dict):
    # payload can contain text or structured data
    data = payload.get('data') or {}
    if 'text' in payload:
        parsed = parse_text(payload['text'])
        data.update(parsed)
    trip = Trip(title=data.get('title') or f"Trip to {data.get('destination', '')}",
                destination=data.get('destination'),
                start_date=data.get('start_date'),
                end_date=data.get('end_date'),
                budget_total=data.get('budget'),
                days=data.get('days'),
                preferences=','.join(data.get('preferences') or []))
    with Session(engine) as sess:
        sess.add(trip)
        sess.commit()
        sess.refresh(trip)
    return trip

@app.get('/api/trips')
def list_trips():
    with Session(engine) as sess:
        trips = sess.exec(select(Trip)).all()
    return trips

@app.get('/api/trips/{trip_id}')
def get_trip(trip_id: int):
    with Session(engine) as sess:
        trip = sess.get(Trip, trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail='Trip not found')
        return trip

@app.post('/api/trips/{trip_id}/generate')
def generate(trip_id: int):
    with Session(engine) as sess:
        trip = sess.get(Trip, trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail='Trip not found')
        plan = generate_trip_text(trip)
        trip.notes = plan
        sess.add(trip)
        sess.commit()
        sess.refresh(trip)
    return {'plan': plan}

@app.post('/api/trips/{trip_id}/expenses')
def add_expense(trip_id: int, payload: dict):
    amount = payload.get('amount')
    if amount is None:
        raise HTTPException(status_code=400, detail='amount is required')
    expense = Expense(trip_id=trip_id, amount=amount, category=payload.get('category'), note=payload.get('note'))
    with Session(engine) as sess:
        sess.add(expense)
        sess.commit()
        sess.refresh(expense)
    return expense
