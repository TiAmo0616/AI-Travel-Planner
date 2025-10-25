from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings     # 新增

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ------- 密码工具保留（若你还做本地注册） -------
def hash_password(pw: str) -> str:
    return pwd_ctx.hash(pw)

def verify_password(pw: str, hashed: str) -> bool:
    return pwd_ctx.verify(pw, hashed)

def create_access_token(sub: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=60*24*7))
    return jwt.encode({"exp": expire, "sub": sub}, settings.supabase_jwt_secret, algorithm="HS256")
# ------- Token 工具改为“只验不签” -------
def decode_supabase_token(token: str) -> str | None:
    """解析 Supabase AccessToken，返回用户 uuid（sub）"""
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,   # ← 用 Supabase 密钥
            algorithms=["HS256"],
            options={"verify_aud": False}   # Supabase 默认无 aud
        )
        return payload.get("sub")           # 用户 uuid
    except JWTError:
        return None