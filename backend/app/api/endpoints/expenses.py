# [file name]: expenses.py
# [file content begin]
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.api.deps import current_user
from app.db.supabase import supabase
import uuid

from app.models.domain import ExpenseIn, ExpenseOut

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/", response_model=ExpenseOut)
def create_expense(expense: ExpenseIn, user: str = Depends(current_user)):
    """创建开销记录"""
    try:
        expense_id = str(uuid.uuid4())
        payload = {
            "id": expense_id,
            "owner": user,
            **expense.dict(),
            "created_at": datetime.now().isoformat()
        }
        
        print(f"Creating expense with payload: {payload}")  # 调试日志
        
        res = supabase.table("expenses").insert(payload).execute()
        
        if not res.data:
            print("No data returned from insert")  # 调试日志
            raise HTTPException(500, "创建开销记录失败")
        
        print(f"Expense created successfully: {res.data[0]}")  # 调试日志
        return res.data[0]
        
    except Exception as e:
        print(f"Error creating expense: {str(e)}")  # 调试日志
        raise HTTPException(500, f"创建开销记录失败: {str(e)}")

@router.get("/", response_model=List[ExpenseOut])
def list_expenses(
    trip_id: Optional[str] = None, 
    user: str = Depends(current_user)
):
    """获取开销记录列表，可按行程筛选"""
    try:
        query = supabase.table("expenses").select("*").eq("owner", user)
        
        if trip_id:
            query = query.eq("trip_id", trip_id)
        
        res = query.order("date", desc=True).execute()
        return res.data
        
    except Exception as e:
        print(f"Error listing expenses: {str(e)}")
        raise HTTPException(500, f"获取开销记录失败: {str(e)}")

@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(expense_id: str, user: str = Depends(current_user)):
    """获取单个开销记录"""
    try:
        res = supabase.table("expenses").select("*").eq("id", expense_id).eq("owner", user).execute()
        if not res.data:
            raise HTTPException(404, "开销记录未找到或无权限访问")
        return res.data[0]
    except Exception as e:
        raise HTTPException(500, f"获取开销记录失败: {str(e)}")

@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: str, expense: ExpenseIn, user: str = Depends(current_user)):
    """更新开销记录"""
    try:
        # 先检查记录是否存在且属于当前用户
        check_res = supabase.table("expenses").select("id").eq("id", expense_id).eq("owner", user).execute()
        if not check_res.data:
            raise HTTPException(404, "开销记录未找到或无权限访问")
        
        payload = {**expense.dict()}
        res = supabase.table("expenses").update(payload).eq("id", expense_id).execute()
        if not res.data:
            raise HTTPException(500, "更新开销记录失败")
        return res.data[0]
    except Exception as e:
        raise HTTPException(500, f"更新开销记录失败: {str(e)}")

@router.delete("/{expense_id}")
def delete_expense(expense_id: str, user: str = Depends(current_user)):
    """删除开销记录"""
    try:
        # 先检查记录是否存在且属于当前用户
        check_res = supabase.table("expenses").select("id").eq("id", expense_id).eq("owner", user).execute()
        if not check_res.data:
            raise HTTPException(404, "开销记录未找到或无权限访问")
        
        res = supabase.table("expenses").delete().eq("id", expense_id).execute()
        return {"message": "开销记录删除成功"}
    except Exception as e:
        raise HTTPException(500, f"删除开销记录失败: {str(e)}")
# [file content end]