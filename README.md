# AI-Travel-Planner

AI-Travel-Planner 是一个用于生成行程与旅行规划建议的全栈示例工程，包含一个基于 Python 的后端（API 服务）和一个基于 React 的前端单页应用。

## 主要功能

- 使用 AI（OpenAI 等）生成旅行计划与行程建议
- 支持偏好设置、费用管理和行程详情查看
- 后端提供 REST/HTTP API，前端提供地图与交互式 UI

## 技术栈

- 后端：Python（FastAPI 模式），依赖放在 `backend/requirements.txt`
- 前端：React（Create React App）位于 `frontend/`，使用 `npm` 管理
- 数据/第三方服务：Supabase/ OpenAI / 讯飞等 AI 服务集成

## 仓库结构（概要）

- `backend/` — 后端服务源码与测试
	- `backend/app/` — FastAPI 应用入口与路由
	- `backend/core/` — 配置与安全相关代码
	- `backend/db/` — Supabase 相关封装
	- `backend/services/` — 第三方服务封装（OpenAI、讯飞等）
	- `backend/tests/` — 后端单元/集成测试
- `frontend/` — React 前端应用

完整结构请参阅仓库根目录。

## 快速开始（开发/本地运行）

下面的命令示例以 Windows PowerShell 为例。请在运行前切换到项目根目录。

1) 启动后端（开发）

```powershell
# 进入后端目录并创建虚拟环境
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 启动 FastAPI 开发服务器（假设 app.main 中定义了 app）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2) 启动前端（开发）

```powershell
cd frontend
npm install
npm start
```

前端默认在 `http://localhost:3000`，后端 API 默认在 `http://localhost:8000`。

3) 生成前端生产包

```powershell
cd frontend
npm run build
```

## 测试

后端使用 pytest（测试位于 `backend/tests/`）：

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -q
```

（如果你在 CI 中运行，请确保已安装依赖并设置必需的环境变量）

## 环境变量与第三方密钥

项目使用 Supabase、OpenAI、讯飞等外部服务。请在本地或 CI 中设置相应的环境变量。常见位置/名称可参考 `backend/core/config.py` 与 `backend/db/supabase.py` 中的读取项。常见变量示例（根据代码实际名称设置）：

- SUPABASE_URL
- SUPABASE_KEY
- OPENAI_API_KEY
- IFLYTEK_APPID / IFLYTEK_API_KEY 等

注意：不要将密钥提交到版本库。推荐使用 `.env` 文件并通过安全的方式注入到运行环境中。

## 贡献

欢迎提交 issue 或 PR。常见贡献流程：

1. Fork 仓库并新建分支
2. 编写代码并添加/更新测试
3. 提交 PR，CI 通过后会合并

## 许可

本项目遵循仓库根目录下的 `LICENSE` 文件中的许可条款。

---

如果你希望我把 README 翻译为英文、补充部署指南或为特定平台（Docker / Docker Compose / GitHub Actions）添加示例，请告诉我你想要的目标，我可以继续完善。