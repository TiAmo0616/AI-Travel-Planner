# AI 旅行规划助手 — 产品需求文档（PRD）

日期：2025-10-21

简介
本项目旨在为用户提供一个基于语音与文字输入的旅行规划 Web 应用，通过大语言模型（LLM）与规则引擎生成个性化行程，并提供预算估算、消费记录与云端同步能力。下文为面向 Web 的可执行 PRD，包含核心功能、技术栈建议、系统架构、接口与交付计划。

一、项目目标与成功标准

目标：
- 在可控时间范围内（按你节奏）完成一个可部署的 Web 应用，主要功能为：语音/文字输入 -> NLU 实体抽取 -> 自动行程生成 -> 预算与消费管理 -> 云端保存与同步。

成功衡量（示例）：
- 在 30 条测试样本中，语音识别与关键实体抽取准确率 ≥ 85%。
- 完成从语音输入到生成并保存行程的端到端流程且无阻断性错误。
- 能导出 CSV（消费记录）并在常见表格软件中打开。

二、目标用户与主要场景

目标用户：独立旅行者、家庭游客、需要快速生成并调整行程的用户。

主要场景：
- 语音或文字描述旅行需求（例如：“我想去日本，5 天，预算 1 万元，喜欢美食和动漫，带孩子”）。
- 系统生成每日行程草案，包括交通、景点、餐厅与推荐住宿。
- 旅行中通过语音记录消费，系统自动归类并更新预算状态。
- 用户在多设备间查看与编辑并同步行程。

三、核心功能（MVP 优先级）

1. 语音与文字输入（必须）
- 前端录音控件，支持语音上传与本地播放。
- 集成 STT（讯飞/Whisper/其他），返回转写文本并传入 NLU 模块。

2. NLU（必需）
- 抽取目的地、出发/结束日期、天数、预算、人数、偏好（美食/自然/亲子等）、特殊需求。
- 使用规则 + 轻量模型混合策略，优先保证解析稳定性。

3. 行程生成（必需）
- 结合解析结果、模板与 LLM（OpenAI 或自选）生成每日日程草案，包含交通、景点、餐厅与住宿建议。
- 提供每项的理由与替代选项，支持基本编辑（替换/移动活动）。

4. 预算与消费管理（必需）
- 基于目的地与天数做预算初估（交通、住宿、餐饮、门票占比示例规则）。
- 语音或文本方式记录消费，自动分类并更新剩余预算。
- 支持导出 CSV 报表。

5. 用户与数据同步（必需）
- 简易账户体系（使用 Supabase 或 Firebase Authentication）用于保存与同步行程与偏好。
- 支持本地保存（SQLite/IndexedDB）并在用户登录时同步到云端。

6. 地图与位置服务（建议集成）
- 使用高德或百度地图 Web API 展示 POI、计算距离与展示位置相关建议。

四、技术栈建议（Web）

前端：React（或 Next.js），使用现代组件库（Ant Design / Mantine）以提高开发速度。
后端：FastAPI（Python）或 Node.js（Express/Fastify），负责 NLU、LLM 调用与数据接口。
语音（STT）：优先考虑科大讯飞 Web API（中文优化），或 OpenAI Whisper（本地或云）。
地图：高德或百度地图 Web API（POI 与路径规划）。
数据库/认证：Supabase（Postgres + Auth）或 Firebase Authentication + Firestore（可选两者之一）。
LLM：OpenAI（API）优先，或后续考虑自托管模型（成本/隐私权衡）。
部署：Docker + Nginx，部署到 VPS 或云主机（例如 DigitalOcean、阿里云 ECS）。

五、系统架构（高层）

组件：
- 前端（React）：录音、对话式输入、行程展示、编辑、导出、地图交互。
- 后端 API（FastAPI/Node）：STT 封装、NLU、行程生成、数据持久化接口。
- 云数据库：Supabase/Postgres 或 Firestore。
- 第三方服务：STT（讯飞/Whisper）、地图（高德/百度）、LLM（OpenAI）。

主要数据流：
1. 前端录音或文本输入 -> 后端 STT/直接文本 -> NLU 抽取实体。
2. 行程生成器调用 LLM + 规则模板，生成行程草案 -> 返回前端。
3. 用户编辑并保存 -> 存入云数据库（或本地后同步）。
4. 消费记录通过语音或表单录入 -> 后端解析并更新预算与导出数据。

六、数据模型（简化）

- users: id, email, name, created_at
- trips: id, user_id, title, destination, start_date, end_date, budget_total, preferences(json), created_at
- day_plans: id, trip_id, day_index, activities(json)
- activities: title, type, location, start_time, end_time, notes, estimate_cost
- expenses: id, trip_id, amount, category, note, recorded_at

七、主要 API（示例）

- POST /api/voice/stt — 上传音频，返回转写文本
- POST /api/nlu/parse — 接受文本，返回结构化实体
- POST /api/trips — 创建/生成行程（接受结构化参数或原始文本）
- GET /api/trips/{id} — 获取行程详情
- PUT /api/trips/{id} — 更新行程
- POST /api/trips/{id}/expenses — 记录消费（支持 transcript 字段）
- GET /api/trips/{id}/export/csv — 导出消费记录

八、MVP 开发计划

Day 0：环境准备、仓库与分支策略、确定 STT 与 LLM 服务、写 README。
Day 1：后端骨架（FastAPI）与 SQLite 本地模型；实现 trips CRUD 接口。
Day 2：实现 STT 接口（封装讯飞/Whisper），并实现 /api/voice/stt。
Day 3：实现 NLU（规则 + 轻量 ML），并用示例文本进行验证。
Day 4：实现行程生成器（规则 + LLM prompt），并提供 /api/trips/{id}/generate。
Day 5：前端录音组件与将 STT 集成到前端，展示行程草案。
Day 6：实现消费记录接口与预算计算逻辑，支持 CSV 导出。
Day 7：实现用户登录（Supabase/Firebase 简单接入）与数据同步（基础）。
Day 8-10：功能完善（编辑/替换活动、优化提示）、手动测试、修复关键 bug。
Day 11-12：Dockerfile 与部署脚本、SSL（Let's Encrypt）配置说明、部署到 VPS 测试环境。
Day 13：集成测试与验收（30 条语音样本验证）、性能/错误修复。
Day 14：整理文档（README、部署指南）、生成演示材料并完成最终部署。

九、测试与验收

验收条件：
- 语音到行程的端到端流程可运行且无致命错误。
- 在 30 条样本中实体抽取准确率 ≥ 85%。
- CSV 导出包含消费记录且能在 Excel/Sheets 打开。

测试策略：
- 单元测试：NLU、预算计算、导出功能。
- 集成测试：API 流程（STT->NLU->生成->保存->导出）。
- 手动语音样本覆盖不同说法与简单噪声场景。

十、部署建议

- 使用 Docker 打包后端与前端静态资源，部署到 VPS。
- 使用 Nginx 反向代理并配置 HTTPS（Let's Encrypt）。
- 可选：部署 Supabase（托管）或使用 Supabase 提供的数据库服务以减少运维。

十一、后续扩展（上线后优先级）

- 第三方预订与支付集成（酒店/机票/门票）。
- 实时交通与航班推送（集成航班/交通 API）。
- 群组协作与共享行程功能。


