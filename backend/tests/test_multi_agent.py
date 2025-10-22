import os
from app.generator import generate_trip_text


class DummyTrip:
    def __init__(self, destination='日本', days=3, people=2, preferences='美食,动漫', budget_total=10000):
        self.destination = destination
        self.days = days
        self.people = people
        self.preferences = preferences
        self.budget_total = budget_total


def test_generate_offline():
    # 确保在没有 OPENAI_API_KEY 的情况下能使用本地回退逻辑
    os.environ.pop('OPENAI_API_KEY', None)
    trip = DummyTrip()
    plan = generate_trip_text(trip)
    assert isinstance(plan, dict)
    assert 'daily_plan' in plan
    assert 'budget_breakdown' in plan
    assert len(plan['daily_plan']) == trip.days
