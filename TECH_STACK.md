# 技术栈（建议）

前端
- React + Vite 或 Next.js
- UI：Ant Design / Mantine / Chakra UI
- 地图：高德或百度地图 Web API

后端
- FastAPI (Python) 推荐，替代：Node.js + Express/Fastify
- 数据库：SQLite（开发） -> Supabase (Postgres) 或 Firestore（生产/云同步）
- 异步任务：Celery / RQ（如需）

语音与 AI
- STT：科大讯飞 Web API（中文优），或 OpenAI Whisper（本地或云）
- LLM：OpenAI API（快速接入）或自托管模型

部署与运维
- Docker + Nginx，部署到 VPS（DigitalOcean / 阿里云 ECS / AWS EC2）
- 可选：使用 Supabase 省去大量运维（托管 Postgres + Auth）

安全与隐私
- 对敏感数据（如 tokens）使用环境变量；不要提交到仓库
- 用户语音上传需显示隐私提示并获取同意

说明：此文件为建议，最终请根据可用资源与偏好调整。