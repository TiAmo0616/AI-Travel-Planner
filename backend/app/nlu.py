import re
from typing import Dict, Any

def parse_text(text: str) -> Dict[str, Any]:
    text = text.strip()
    res = {}
    # destination: after 去/到 or first capitalized word
    m = re.search(r'(?:去|到)\s*([\u4e00-\u9fa5A-Za-z0-9]+)', text)
    if m:
        res['destination'] = m.group(1)
    # days
    m = re.search(r'(\d+)\s*天', text)
    if m:
        res['days'] = int(m.group(1))
    # budget
    m = re.search(r'预算\s*([\d,\.]+)\s*元', text)
    if m:
        try:
            res['budget'] = float(m.group(1).replace(',', ''))
        except:
            res['budget'] = None
    # people
    m = re.search(r'(\d+)\s*人', text)
    if m:
        res['people'] = int(m.group(1))
    # preferences
    prefs = []
    if '美食' in text:
        prefs.append('美食')
    if '动漫' in text:
        prefs.append('动漫')
    if '寺庙' in text or '寺' in text:
        prefs.append('文化')
    if '带孩' in text or '带孩子' in text:
        prefs.append('亲子')
    if prefs:
        res['preferences'] = prefs
    return res
