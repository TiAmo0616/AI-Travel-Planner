# AI-Travel-Planner

简要说明：本项目包含一个 FastAPI 后端（`backend/`）和一个 React 前端（`frontend/`）。本 README 仅包含运行项目所需的最小说明：本地开发、Docker 运行与必要的环境变量。

## 前提

- Python 3.11+（用于后端）
- Node.js（用于前端）
- Docker 与 Docker Compose（可选，用于容器化运行）

## 本地开发（后端）

1. 进入后端目录并创建虚拟环境

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. 设置必需的环境变量（在 `backend/.env` 中，按 `backend/core/config.py` 中实际字段设置）

3. 启动后端服务

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端默认运行在 `http://localhost:8000`。

## 本地开发（前端）

1. 安装依赖并启动

```powershell
cd frontend
npm install
npm start
```

2. 配置环境变量（在 `frontend/.env` 中）

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_AMAP_API_KEY=your-amap-key
REACT_APP_AMAP_KEY=your-amap-key-2
REACT_APP_AMAP_SECURITY_CODE=your-security-code
```

前端默认运行在 `http://localhost:3000`。


## 一键启动（推荐）

1. 下载本仓库的 `docker-compose.yml` 文件。
2. 在同目录下创建 `.env` 文件，内容如下（请填写你自己的密钥和服务地址）：

```
# 后端环境变量
SUPABASE_URL=你的supabase地址
SUPABASE_KEY=你的supabase key
OPENAI_API_KEY=你的openai key
IFLYTEK_APP_ID=你的讯飞appid
IFLYTEK_API_KEY=你的讯飞apikey
IFLYTEK_API_SECRET=你的讯飞apisecret

# 前端环境变量
REACT_APP_API_URL=http://localhost:8000
REACT_APP_AMAP_KEY=你的高德web JS服务key
REACT_APP_AMAP_SECURITY_CODE=你的高德安全码
REACT_APP_AMAP_API_KEY=你的高德Web服务key
```

3. 在该目录下运行：

```powershell
docker compose up -d
```

4. 启动后，前端访问 http://localhost:3000 ，后端 API 访问 http://localhost:8000



## 必要环境变量

- 后端：SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY, IFLYTEK_APP_ID, IFLYTEK_API_KEY, IFLYTEK_API_SECRET
- 前端：REACT_APP_API_URL, REACT_APP_AMAP_KEY, REACT_APP_AMAP_SECURITY_CODE, REACT_APP_AMAP_API_KEY





## 联系与贡献

如需改进部署、CI 或镜像发布策略，请在 issue 中说明你的需求并提交 PR。


