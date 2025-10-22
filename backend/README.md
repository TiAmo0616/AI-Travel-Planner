# Backend

后端（FastAPI）说明：

- 目录：`backend/`
- 主要职责：提供 REST API（/api/voice/stt, /api/nlu/parse, /api/trips, /api/trips/{id}/expenses 等），处理 STT、NLU、行程生成与数据持久化。
- 推荐依赖：fastapi, uvicorn, pydantic, sqlalchemy (或 databases), sqlite3, requests

快速开始（开发环境）:

1. 创建并激活虚拟环境

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. 运行开发服务器

```bash
uvicorn app.main:app --reload --port 8000
```

后续：在此目录添加 `app/` 源码、`requirements.txt`、`Dockerfile` 等。