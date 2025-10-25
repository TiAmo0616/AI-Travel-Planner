from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from app.core.security import decode_supabase_token   # 改名

def current_user(token: str = Depends(HTTPBearer())) -> str:
    uid = decode_supabase_token(token.credentials)
    if not uid:
        raise HTTPException(401, "Invalid Supabase token")
    return uid          # 后续用 uid 当 owner 查询