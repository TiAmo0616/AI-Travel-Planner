import sys
import os

# 将 backend 目录加入 sys.path，便于导入 app 包
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.generator import generate_trip_text
from app.models import Trip


def test_generate_trip_text():
    trip = Trip(destination='京都', days=3)
    plan = generate_trip_text(trip)
    assert isinstance(plan, str)
    assert len(plan) > 0
