# backend/generator.py
import os
import json
import openai
openai.api_key = os.getenv("OPENAI_API_KEY")
openai.api_base = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
MODEL = os.getenv("MODEL_NAME", "gpt-3.5-turbo")

SYS_PROMPT = """
你是资深旅行规划师。用户给定目的地、天数、预算、人数、偏好，请严格按下面 JSON 格式返回，不要多余解释。
{
  "overview": "一句话总结",
  "daily_plan": [
    {
      "day": 1,
      "route": "上午/下午/晚上",
      "attractions": ["景点1","景点2"],
      "restaurants": ["餐厅1","餐厅2"],
      "transport": "交通建议",
      "hotel": "住宿区域或酒店"
    }
  ],
  "budget_breakdown": {
    "traffic": 1200,
    "hotel": 3000,
    "food": 2000,
    "ticket": 800,
    "shopping": 1000,
    "total": 8000
  },
  "tips": ["带孩子的注意事项","美食必吃清单"]
}
"""

def generate_trip_text(trip):
    user_prompt = f"""
目的地：{trip.destination}
天数：{trip.days}
预算：{trip.budget_total}元
人数：{trip.people or 1}人
偏好：{trip.preferences}
"""
    rsp = openai.ChatCompletion.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYS_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7,
        max_tokens=2500
    )
    content = rsp.choices[0].message.content.strip()
    # 去掉可能的 ```json 包裹
    if content.startswith("```json"):
        content = content[7:-3]
    return json.loads(content)   # 返回 dict，不再是纯文本
