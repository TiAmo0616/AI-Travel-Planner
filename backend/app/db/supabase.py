# app/db/supabase.py
import os
from supabase import create_client, Client
from app.core.config import settings
os.environ["SUPABASE_PY_SSL_VERIFY"] = "false"   # 关闭 SSL 校验（开发）
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)