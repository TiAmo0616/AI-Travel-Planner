import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.models.domain import ItineraryRequest
from app.api.deps import current_user                    # 仅验签
from app.services.openai_service import generate_itinerary
from app.services.iflytek_service import IFlyTek
from app.core.config import settings
from app.db.supabase import supabase                     # 全局客户端
import uuid

# router = APIRouter(prefix="/ai", tags=["ai"])

 
# @router.post("/generate-itinerary")
# async def ai_plan(body: ItineraryRequest, user: str = Depends(current_user)):
#     """
#     1. 调用 OpenAI 生成行程
#     2. （可选）落库到 Supabase trips.itinerary_raw
#     """
   
#     raw = await generate_itinerary(
#         body.destination,
#         body.dates,
#         body.budget,
#         body.travelers,
#         body.preferences
#     )
    
#     return {"itinerary": raw}
 
 
# @router.post("/transcribe")
# async def transcribe(audio: UploadFile = File(...)):
#     audio_bytes = await audio.read()
#     with open("temp_audio.wav", "wb") as f:
#         f.write(audio_bytes)
#     ifly = IFlyTek(settings.iflytek_app_id, settings.iflytek_api_key, settings.iflytek_api_secret, "temp_audio.wav")
#     text = await ifly.recognize()
#     print("test:"+text)
#     return {"transcription": text}

# [file name]: app/api/endpoints/ai.py (后端增强)
# [file content begin]
import json
import re
from typing import List, Dict


router = APIRouter(prefix="/ai", tags=["ai"])
@router.post("/generate-itinerary")
async def ai_plan(body: ItineraryRequest, user: str = Depends(current_user)):
    """
    生成行程并返回结构化数据
    """
    try:
        # 生成行程文本
        response = await generate_itinerary(
            body.destination,
            body.dates,
            body.budget,
            body.travelers,
            body.preferences
        )
        
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            return json.loads(response)
        
        # return {
        #     "itinerary": itinerary_text
        # }
        
    except Exception as e:
        print(f"生成行程失败: {str(e)}")
        raise HTTPException(500, f"生成行程失败: {str(e)}")


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    with open("temp_audio.wav", "wb") as f:
        f.write(audio_bytes)
    ifly = IFlyTek(settings.iflytek_app_id, settings.iflytek_api_key, settings.iflytek_api_secret, "temp_audio.wav")
    text = await ifly.recognize()
    print("test:"+text)
    return {"transcription": text}

