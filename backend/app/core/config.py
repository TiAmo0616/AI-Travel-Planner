from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 基础
    app_name: str = "AI Travel Planner"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # 安全
    jwt_secret: str
    jwt_expire_minutes: int = 60 * 24 * 7   # 7 天

    # 数据库
    supabase_url: str
    supabase_key: str
    supabase_jwt_secret: str

    # OpenAI
    openai_api_key: str

    # 科大讯飞
    iflytek_app_id: str
    iflytek_api_key: str
    iflytek_api_secret: str

    class Config:
        env_file = ".env"

settings = Settings()