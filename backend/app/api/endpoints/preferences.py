# [file name]: preferences.py
# [file content begin]
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.api.deps import current_user
from app.db.supabase import supabase
import uuid

from app.models.domain import PreferenceIn, PreferenceOut

router = APIRouter(prefix="/preferences", tags=["preferences"])

@router.post("/save", response_model=PreferenceOut)
def create_preference(preference: PreferenceIn, user: str = Depends(current_user)):
    """创建用户偏好设置"""
    try:
        preference_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        print(preference_id, preference.dict(), user)
        payload = {
            "id": preference_id,
            "owner": user,
            **preference.dict(),
            "created_at": now,
            "updated_at": now
        }
        
        print(f"Creating preference with payload: {payload}")
        
        res = supabase.table("preferences").insert(payload).execute()
        
        if not res.data:
            print("No data returned from insert")
            raise HTTPException(500, "创建偏好设置失败")
        
        print(f"Preference created successfully: {res.data[0]}")
        return res.data[0]
        
    except Exception as e:
        print(f"Error creating preference: {str(e)}")
        raise HTTPException(500, f"创建偏好设置失败: {str(e)}")

@router.get("/", response_model=List[PreferenceOut])
def list_preferences(
    category: Optional[str] = None,
    user: str = Depends(current_user)
):
    """获取用户偏好设置列表，可按分类筛选"""
    try:
        query = supabase.table("preferences").select("*").eq("owner", user)
        
        if category:
            query = query.eq("category", category)
        
        res = query.order("updated_at", desc=True).execute()
        return res.data
        
    except Exception as e:
        print(f"Error listing preferences: {str(e)}")
        raise HTTPException(500, f"获取偏好设置失败: {str(e)}")

@router.get("/{preference_id}", response_model=PreferenceOut)
def get_preference(preference_id: str, user: str = Depends(current_user)):
    """获取单个偏好设置"""
    try:
        res = supabase.table("preferences").select("*").eq("id", preference_id).eq("owner", user).execute()
        if not res.data:
            raise HTTPException(404, "偏好设置未找到或无权限访问")
        return res.data[0]
    except Exception as e:
        raise HTTPException(500, f"获取偏好设置失败: {str(e)}")

@router.post("/{preference_id}", response_model=PreferenceOut)
def update_preference(preference_id: str, preference: PreferenceIn, user: str = Depends(current_user)):
    """更新偏好设置"""
    try:
       
        # 先检查记录是否存在且属于当前用户
        check_res = supabase.table("preferences").select("id").eq("id", preference_id).eq("owner", user).execute()
        if not check_res.data:
            raise HTTPException(404, "偏好设置未找到或无权限访问")
        
        payload = {
            **preference.dict(),
            "updated_at": datetime.now().isoformat()
        }
        
        res = supabase.table("preferences").update(payload).eq("id", preference_id).execute()
        if not res.data:
            raise HTTPException(500, "更新偏好设置失败")
        return res.data[0]
    except Exception as e:
        raise HTTPException(500, f"更新偏好设置失败: {str(e)}")

@router.delete("/{preference_id}")
def delete_preference(preference_id: str, user: str = Depends(current_user)):
    """删除偏好设置"""
    try:
        # 先检查记录是否存在且属于当前用户
        check_res = supabase.table("preferences").select("id").eq("id", preference_id).eq("owner", user).execute()
        if not check_res.data:
            raise HTTPException(404, "偏好设置未找到或无权限访问")
        
        res = supabase.table("preferences").delete().eq("id", preference_id).execute()
        return {"message": "偏好设置删除成功"}
    except Exception as e:
        raise HTTPException(500, f"删除偏好设置失败: {str(e)}")
# [file content end]