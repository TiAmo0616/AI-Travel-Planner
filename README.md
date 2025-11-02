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

## 使用 Docker 与镜像分发（可直接下载运行）

仓库现在包含用于构建前端与后端镜像的 Dockerfile 与 `docker-compose.yml`，并提供一个用于构建并导出镜像为 tar 包的 PowerShell 脚本：`scripts/build_and_save.ps1`。

1) 从远程仓库拉取（或在本地）构建并导出镜像为 tar（示例）

```powershell
# 在仓库根目录运行（替换 yourdockeruser 为你的镜像仓库或任意标签前缀）
.\scripts\build_and_save.ps1 -RepositoryOwner yourdockeruser -Tag latest

# 结果文件： ./dist/ai-travel-backend.tar 和 ./dist/ai-travel-frontend.tar
```

2) 在目标机器上直接加载并运行镜像（如果你把 `dist/*.tar` 作为可下载文件提供）

```powershell
# 加载镜像
docker load -i ai-travel-backend.tar
docker load -i ai-travel-frontend.tar

# 运行后端
docker run -d --name ai-travel-backend -p 8000:8000 yourdockeruser/ai-travel-backend:latest

# 运行前端（镜像内使用 nginx 在 80 端口）
docker run -d --name ai-travel-frontend -p 3000:80 yourdockeruser/ai-travel-frontend:latest
```

3) 或者使用 `docker-compose` 来一起构建与启动（建议开发或本地测试）

```powershell
# 在仓库根目录
docker-compose up --build
```

4) 如果你已经把镜像发布到 Docker Hub 或 GitHub Container Registry，可以直接拉取运行：

```powershell
docker pull yourdockeruser/ai-travel-backend:latest
docker pull yourdockeruser/ai-travel-frontend:latest

docker run -d --name ai-travel-backend -p 8000:8000 yourdockeruser/ai-travel-backend:latest
docker run -d --name ai-travel-frontend -p 3000:80 yourdockeruser/ai-travel-frontend:latest
```

注：如果前端在容器中使用 nginx 提供静态文件并将 80 映射到宿主 3000（如上例），后端的 CORS 设置通常允许 `http://localhost:3000`，这与代码中 `backend/app/main.py` 的默认 CORS 设定一致。

## 自动构建与发布（GitHub Actions -> 阿里云容器镜像仓库）

项目已包含一个 GitHub Actions workflow：`.github/workflows/publish-to-acr.yml`。
它会在向 `main` 分支 push 或手动触发时：

- 使用你在仓库 Secrets 中配置的阿里云凭据登录 ACR
- 构建 `backend` 与 `frontend` 镜像
- 将镜像推送到你指定的 ACR 命名空间，并同时打上 `latest` 与 `commit-sha` 两个标签

所需在仓库 Settings -> Secrets 中设置的 Secrets（示例名称）：

- `ACR_REGISTRY` — 你的阿里云镜像仓库域名，例如 `registry.cn-hangzhou.aliyuncs.com`
- `ACR_USERNAME` — 阿里云 AccessKey ID（建议使用子账号或具备推送权限的 AccessKey）
- `ACR_PASSWORD` — 阿里云 AccessKey Secret
- `ACR_NAMESPACE` — 你的 ACR 命名空间（仓库前缀）
- `REACT_APP_API_URL` — （可选）前端构建时注入的后端 base URL，例如 `https://api.example.com`

如何使用：

1. 在 GitHub 仓库的 Settings -> Secrets 中添加上面的 Secrets。
2. Push 到 `main` 分支或在 Actions 页面手动触发 workflow。
3. 构建成功后，你可以在阿里云镜像仓库中看到 `ai-travel-backend` 与 `ai-travel-frontend` 两个镜像及其标签。

安全建议：

- 使用具有最小权限的 AccessKey。若可能，使用阿里云的 RAM 子用户来限定权限。
- 不要在仓库中直接提交任何明文凭据。

