from fastapi import APIRouter, HTTPException
from app.models.domain import UserRegister, UserLogin
from app.db.supabase import supabase          # 全局客户端
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class TokenResp(BaseModel):
    access_token: str
    token_type: str = "bearer"
    message: str = "Success"


@router.post("/register", response_model=TokenResp)
def register(body: UserRegister):
    """通过 Supabase 注册，成功直接返回其 access_token"""
    
    try:
       
        res = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password
        })
        
        # sign_up 可能返回 session=None（需要邮箱验证时）
        if res.session is None:
            return TokenResp(access_token="", message="Please verify your email before logging in")
        return TokenResp(access_token=res.session.access_token)
    except Exception as e:
        # 捕获 Supabase 返回的重复邮箱等异常
        raise HTTPException(400, str(e))


@router.post("/login", response_model=TokenResp)
def login(body: UserLogin):
    """通过 Supabase 登录，返回 access_token"""
    try:
        res = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password
        })
        
        return TokenResp(access_token=res.session.access_token)
    except Exception as e:
        raise HTTPException(400, "Incorrect email or password")