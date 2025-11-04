from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import auth, trips, ai,expenses,preferences

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                    "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"],  # 允许前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(ai.router)
app.include_router(expenses.router)  # 新增开销路由
app.include_router(preferences.router)  # 新增偏好设置路由
@app.get("/")
def root():
    return {"message": "AI Travel Planner API 🚀"}