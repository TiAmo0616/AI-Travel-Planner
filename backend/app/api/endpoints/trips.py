from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.models.domain import TripOut, TripIn
from app.api.deps import current_user          # 仅用于验签
from app.db.supabase import supabase           # 全局客户端

router = APIRouter(prefix="/trips", tags=["trips"])

# 可选：统一把 datetime 转成 ISO 字符串
def to_iso(dt) -> str:
    return dt.isoformat() if isinstance(dt, datetime) else dt


@router.get("/listtrips", response_model=list[TripOut])
def list_trips(user: str = Depends(current_user)):
    res = supabase.table("trips").select("*").eq("owner", user).order("created_at", desc=True).execute()
    return res.data


@router.post("/save", response_model=TripOut)
def save_trip(body: TripIn, user: str = Depends(current_user)):
    """保存本次行程（不含 AI 计划）"""
    payload = {**body.dict(), "owner": user}

    res = supabase.table("trips").insert(payload).execute()
    if not res.data:
        raise HTTPException(500, "插入失败，无返回数据")
    return res.data[0]

@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: str, user: str = Depends(current_user)):
    """按 ID 获取单个行程"""
    print(trip_id)
    res = supabase.table("trips").select("*").eq("id", trip_id).eq("owner", user).execute()
    if not res.data:
        raise HTTPException(404, "Trip not found or unauthorized")
    return res.data[0]

@router.delete("/{trip_id}", response_model=dict)
def delete_trip(trip_id: str, user: str = Depends(current_user)):
    """按 ID 删除行程"""
    res = supabase.table("trips").delete().eq("id", trip_id).eq("owner", user).execute()
    if not res.data:
        raise HTTPException(404, "Trip not found or unauthorized")
    return {"message": "Trip deleted successfully"}