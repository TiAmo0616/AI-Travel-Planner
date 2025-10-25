import openai
from app.core.config import settings
openai.api_key = settings.openai_api_key

async def generate_itinerary(destination: str, duration: int, budget: int, travelers: int, preferences: str) -> str:
    prompt = f"""
        请扮演资深旅行规划师，为用户制定一份{duration}天、预算{budget}元、{travelers}人出行的{destination}行程。
        用户偏好：{preferences}
        要求：
        1. 按天给出详细日程（含景点、餐厅、交通建议）
        2. 给出每日预估花费
        3. 如有儿童请标注亲子友好设施
        4. 输出整洁中文，无需多余解释
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


