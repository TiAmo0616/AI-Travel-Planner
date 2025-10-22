"""
多 agent 行程生成器

架构说明（简述）：
- Coordinator: 协调各 agent 的运行顺序与数据流。
- PlannerAgent: 生成每天的行程骨架（每日主题、时间段占用情况）。
- POIFetcherAgent: 根据骨架和偏好补充景点与餐厅候选项（可调用 LLM 或本地规则）。
- BudgeterAgent: 基于预算、天数、人数估算费用并输出分类预算。
- FormatterAgent: 将各 agent 的产物合并为最终的 JSON 可序列化输出。

设计目标：
- 保持 `generate_trip_text(trip)` 的函数签名不变，返回一个 Python dict（与旧版行为兼容）。
- 对外调用优先使用 OpenAI（若配置了 API key），否则使用内置回退逻辑以保证离线可用性。
- 提供详尽注释，便于后续扩展（例如接入真实 POI API）。
"""

import os
import json
from typing import Dict, Any, List, Optional
import openai

# 初始化 OpenAI 配置（如果环境变量没有配置，后续会触发回退）
openai.api_key = os.getenv("OPENAI_API_KEY")
openai.api_base = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
MODEL = os.getenv("MODEL_NAME", "gpt-3.5-turbo")


def _llm_call(system: str, user: str, temperature: float = 0.6, max_tokens: int = 1500) -> Optional[str]:
  """调用 OpenAI ChatCompletion 的一个小封装。

  返回 LLM 的原始文本内容；若未配置 API key 或调用失败则返回 None。
  """
  if not openai.api_key:
    return None
  try:
    rsp = openai.ChatCompletion.create(
      model=MODEL,
      messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
      temperature=temperature,
      max_tokens=max_tokens,
    )
    return rsp.choices[0].message.content.strip()
  except Exception:
    # 如果 LLM 请求出错（网络、配额等），返回 None 表示使用本地回退
    return None


def _safe_json_loads(s: str) -> Optional[Dict[str, Any]]:
  """尝试从字符串中解析 JSON，容错一些常见的格式化问题（例如 ```json 包裹）。"""
  if not s:
    return None
  # 去掉 ```json ``` 包裹
  if s.startswith("```json") and s.endswith("```"):
    s = s[7:-3].strip()
  if s.startswith("```") and s.endswith("```"):
    s = s[3:-3].strip()
  # 尝试直接解析
  try:
    return json.loads(s)
  except Exception:
    # 尝试抽取第一个 {...} 的子串
    start = s.find("{")
    end = s.rfind("}")
    if start != -1 and end != -1 and end > start:
      try:
        return json.loads(s[start:end+1])
      except Exception:
        return None
    return None


class PlannerAgent:
  """Planner 负责生成每日行程的骨架（每天主要安排的时间片和主题）。

  Planner 的输出结构示例：
  [
    {"day": 1, "theme": "文化与历史", "route_hint": "上午博物馆，下午城区漫步，晚上美食"},
    ...
  ]
  """

  SYSTEM = "You are a travel assistant that outputs a compact JSON skeleton for daily itinerary given destination, days and preferences."

  @staticmethod
  def plan(destination: str, days: int, preferences: str) -> List[Dict[str, Any]]:
    user = f"目的地: {destination}\n天数: {days}\n偏好: {preferences}\n请按照 JSON 数组返回每天的主题和 route_hint（不要额外解释）。示例: [{'{'}\"day\":1,\"theme\":\"美食\",\"route_hint\":\"上午/下午/晚上\"{'}'}]"
    text = _llm_call(PlannerAgent.SYSTEM, user, temperature=0.5, max_tokens=400)
    data = _safe_json_loads(text) if text else None
    if isinstance(data, list):
      return data
    # 本地回退：简单分配主题
    skeleton = []
    prefs = [p.strip() for p in (preferences or "").split(',') if p.strip()]
    for d in range(1, max(1, int(days or 1)) + 1):
      theme = prefs[(d-1) % len(prefs)] if prefs else "探索"
      skeleton.append({"day": d, "theme": theme, "route_hint": "上午/下午/晚上"})
    return skeleton


class POIFetcherAgent:
  """POIFetcher 根据每天主题提供景点与餐厅候选项。

  在真实产品中，这个 agent 应该调用地图/POI 服务（如高德、百度或Google Places），
  这里为了脱离外部依赖，优先使用 LLM 补全 POI 列表，若不可用则使用本地占位建议。
  """

  SYSTEM = "You are an assistant that, given destination, day theme, and a short hint, returns JSON with 'attractions' and 'restaurants' arrays."

  @staticmethod
  def fetch(destination: str, day_theme: str, hint: str, max_items: int = 4) -> Dict[str, List[str]]:
    user = f"目的地: {destination}\n主题: {day_theme}\n提示: {hint}\n请返回JSON对象: { {'attractions':[], 'restaurants':[]} }，每项不超过 {max_items} 个。"
    text = _llm_call(POIFetcherAgent.SYSTEM, user, temperature=0.7, max_tokens=400)
    data = _safe_json_loads(text) if text else None
    if data and isinstance(data, dict):
      return {
        'attractions': data.get('attractions') or [],
        'restaurants': data.get('restaurants') or []
      }
    # 本地回退：生成通用占位 POI
    attractions = [f"{destination}景点{idx+1}" for idx in range(max_items)]
    restaurants = [f"{destination}餐厅{idx+1}" for idx in range(max_items//2)]
    return {'attractions': attractions, 'restaurants': restaurants}


class BudgeterAgent:
  """Budgeter 负责根据总预算/天数/人数做一个分类估算，输出 dict，包括 total。

  算法：如果用户给出 budget，则按照经验比例分配（交通:15%, 住宿:40%, 餐饮:25%, 门票:10%, 购物:10%）。
  若未给出预算，则使用基于目的地和天数的粗略估算（每人每天 800 元作为基线）。
  """

  @staticmethod
  def estimate(budget_total: Optional[float], days: int, people: int) -> Dict[str, Any]:
    if budget_total and budget_total > 0:
      total = float(budget_total)
    else:
      baseline = 800.0  # 每人每天基线花费
      total = baseline * max(1, people) * max(1, int(days or 1))

    # 分配比例
    alloc = {
      'traffic': 0.15,
      'hotel': 0.40,
      'food': 0.25,
      'ticket': 0.10,
      'shopping': 0.10
    }
    breakdown = {k: round(total * v) for k, v in alloc.items()}
    breakdown['total'] = round(total)
    return breakdown


class FormatterAgent:
  """Formatter 将所有 agent 的输出合并为最终结构化行程。

  最终结构示例与原设计兼容：包含 overview, daily_plan (含 attractions/restaurants/transport/hotel), budget_breakdown, tips。
  """

  @staticmethod
  def format(destination: str, skeleton: List[Dict[str, Any]], poi_map: Dict[int, Dict[str, List[str]]], budget: Dict[str, Any], people: int) -> Dict[str, Any]:
    daily_plan = []
    for day_item in skeleton:
      day = int(day_item.get('day', 1))
      theme = day_item.get('theme', '')
      hint = day_item.get('route_hint', '')
      pois = poi_map.get(day, {'attractions': [], 'restaurants': []})
      # 简单 transport/hotel 建议占位
      transport = '优先使用公共交通或打车，视距离而定'
      hotel = f'{destination}市区或主题相关区域'
      daily_plan.append({
        'day': day,
        'theme': theme,
        'route': hint,
        'attractions': pois.get('attractions', []),
        'restaurants': pois.get('restaurants', []),
        'transport': transport,
        'hotel': hotel
      })

    overview = f"为 {people} 人在 {destination} 规划的 {len(daily_plan)} 天行程，包含景点、餐饮与预算建议。"
    tips = ["提前预定热门景点门票", "关注当地儿童友好服务（如需要）"]
    return {
      'overview': overview,
      'daily_plan': daily_plan,
      'budget_breakdown': budget,
      'tips': tips
    }


def generate_trip_text(trip) -> Dict[str, Any]:
  """外部调用入口：接受 `trip`（SQLModel 实例），返回结构化的 itinerary dict。

  实现步骤：
  1. 从 `trip` 中提取基本信息（目的地、天数、预算、人数、偏好）。
  2. 调用 PlannerAgent 生成每天骨架。
  3. 对每个 day 调用 POIFetcherAgent 补全景点与餐厅。
  4. 使用 BudgeterAgent 估算预算分类。
  5. 使用 FormatterAgent 合并并返回最终结果。

  如果 LLM 可用，Planner/POIFetcher 会尝试调用 LLM 获取更丰富的结果；否则全部使用本地回退逻辑。
  """
  # 1) 解析输入
  destination = trip.destination or '目的地'
  days = int(trip.days or 1)
  people = int(getattr(trip, 'people', 1) or 1)
  # trip.preferences 在数据库中可能是逗号分隔的字符串，也可能是 None
  preferences = trip.preferences or ''
  budget_total = getattr(trip, 'budget_total', None) or getattr(trip, 'budget', None)

  # 2) 生成天级骨架
  skeleton = PlannerAgent.plan(destination, days, preferences)

  # 3) 补充 POI
  poi_map: Dict[int, Dict[str, List[str]]] = {}
  for item in skeleton:
    day = int(item.get('day', 1))
    theme = item.get('theme', '')
    hint = item.get('route_hint', '')
    pois = POIFetcherAgent.fetch(destination, theme, hint)
    poi_map[day] = pois

  # 4) 预算估算
  budget = BudgeterAgent.estimate(budget_total=float(budget_total) if budget_total else None, days=days, people=people)

  # 5) 输出格式化
  plan = FormatterAgent.format(destination, skeleton, poi_map, budget, people)
  return plan

