import os
from .generator import generate_trip_text


def generate_with_llm(trip):
    """尝试使用 OpenAI 的 chat completion 生成行程；若不可用则回退到本地生成器。"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        return generate_trip_text(trip)
    try:
        import openai
        openai.api_key = api_key
        prompt = (
            f"请为目的地 {trip.destination or '目的地'} 规划 {trip.days or 3} 天的旅行行程，"
            f"偏好：{trip.preferences or '无'}。输出分日的简短中文说明。"
        )
        resp = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[{'role': 'user', 'content': prompt}],
            max_tokens=600,
            temperature=0.7,
        )
        text = resp.choices[0].message.content.strip()
        return text
    except Exception:
        # 回退
        return generate_trip_text(trip)
