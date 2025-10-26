import openai
from app.core.config import settings
openai.api_key = settings.openai_api_key
async def generate_itinerary(destination: str, duration: int, budget: int, travelers: int, preferences: str) -> dict:
    prompt = f"""
        请扮演资深旅行规划师，为用户制定一份{duration}天、预算{budget}元、{travelers}人出行的{destination}行程,包括交通、住宿、景点、餐厅等详细信息。

        用户偏好：{preferences}
 
        【输出要求】
        1. 严格按照JSON格式输出，包含以下结构：
        {{
        "title": "行程标题",
        "summary": "行程概述",
        "travelers":人数,
        "destination": "目的地",
        "total_budget": 用户预算,
        "preferences": "用户偏好",
        "preferences_labels": "根据用户偏好总结的偏好标签",
        "dates": 天数,
        "daily_itinerary": [
            {{
            "day": 1,
            "theme": "当日主题",
            "schedule": [
                {{
                "time": "09:00-11:00",
                "activity": "活动内容",
                "location": "具体地点名称",
                "address": "详细地址", # 尽量提供
                "coordinates": {{"lat": 纬度, "lng": 经度}}, # 尽量提供坐标
                "description": "活动描述",
                "cost": 费用,
                "type": "attraction/restaurant/transport/hotel" # 分类标签
                }}
            ],
            "daily_budget": 当日总预算
            }}
        ],
        
        "tips": ["实用建议1", "建议2"]
        }}

        2. 数据要求：
        - 每个地点尽量提供详细地址和坐标
        - 活动按时间顺序排列
        - 费用明细清晰
        - 地点类型准确分类

        3. 内容要求：
        - 中文输出，语言简洁专业
        - 景点、餐厅名称准确
        - 交通建议具体可行
        - 预算分配合理
        """
    client = openai.OpenAI(
            api_key=settings.openai_api_key,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )
    completion = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {'role': 'system', 'content': 'You are a helpful assistant.'},
            {'role': 'user', 'content': prompt}
        ]
    )
    return completion.choices[0].message.content


