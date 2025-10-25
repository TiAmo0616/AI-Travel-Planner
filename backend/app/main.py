from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import auth, trips, ai,expenses

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(ai.router)
app.include_router(expenses.router)  # 新增开销路由

@app.get("/")
def root():
    return {"message": "AI Travel Planner API 🚀"}