# AI 旅行规划助手 — 工作计划（基于 PRD）

生成日期：2025-10-21

目的：将 `PRD.md` 中定义的功能与技术栈建议转化为可执行的开发计划，包含里程碑、每日任务、交付物与部署步骤，便于在开发周期内推进项目。

总览（建议节奏）：
- 时间范围：7 天（压缩版、一周交付）
- 目标：完成 Web MVP 并部署到 VPS/云主机或本地供访问，覆盖语音/文字输入、行程生成、预算与消费记录、保存与 CSV 导出。

里程碑（汇总）
- M0：项目启动与环境准备（Day 0）
- M1：后端与 STT/NLU（Day 1-2）
- M2：行程生成与前端基础（Day 2-4）
- M3：预算、消费与导出（Day 4-5）
- M4：测试、Docker 与部署（Day 5-6）
- M5：验收、文档与演示（Day 7）

每日详细计划（7 天版推荐）

Day 0 — 启动与准备
- 创建/确认 Git 仓库，建立 `main` 与 `dev` 分支
- 确定技术栈（FastAPI/Node + React、Supabase 或 Firebase、讯飞/Whisper、OpenAI）
- 撰写 README 初稿，列出运行与依赖

Day 1 — 后端骨架、STT 与 NLU
- 初始化后端项目（FastAPI 推荐）并连接 SQLite
- 集成 STT（讯飞 Web API 或 Whisper 简易封装），实现 `/api/voice/stt`
- 实现 NLU（规则/正则）以抽取目的地、日期、预算、人数、偏好

Day 2 — 行程生成与接口
- 设计行程模板与 LLM prompt
- 实现 `/api/trips` 创建、`/api/trips/{id}/generate` 行程生成接口
- 编写基本的生成测试用例

Day 3 — 前端录音与行程展示
- 初始化 React 项目并实现录音组件
- 将录音结果与 `/api/voice/stt` 集成并展示行程草案
- 支持基本的编辑（替换/删除活动）

Day 4 — 预算与消费记录
- 实现 `/api/trips/{id}/expenses` 接口并支持 transcript 字段
- 实现预算估算与剩余预算显示
- 支持 CSV 导出 `/api/trips/{id}/export/csv`

Day 5 — 数据持久化与用户同步（基础）
- 完成 SQLite 存储逻辑，若时间允许接入 Supabase 同步
- 增强前端交互与错误处理

Day 6 — Docker 与部署测试
- 编写 Dockerfile 并本地构建镜像
- 运行容器并进行 smoke tests；准备 nginx/HTTPS 配置

Day 7 — 验收与文档
- 使用 20-30 条语音样本进行端到端验收测试并记录准确率
- 完善 README、部署指南与演示材料


交付清单
- 后端代码（API 文档）
- 前端代码（录音、展示、导出功能）
- SQLite 数据库或 Supabase 配置文件
- Dockerfile 与部署脚本
- README 与演示材料

验收标准（7 天版）
- 端到端：语音 -> STT -> NLU -> 行程生成 -> 展示 -> 保存 -> 导出 无阻断
- NLU 在 20-30 条语音样本中关键实体识别准确率 ≥ 80%
- 部署后的服务能在 VPS/云主机通过域名或端口访问

风险与缓解措施
- STT 或 LLM API 调用失败：提供本地备选（Whisper）或降级为文本输入
- 时间不足：严格优先级控制，保证语音输入、行程生成与导出为核心交付
- 成本控制：在开发期使用免费/试用额度，限制 LLM 调用频率

下一步（可立即执行）
1. 确认是否需要我为你初始化代码仓库脚手架（后端+前端样例）。
2. 如果需要部署脚本，我可以现在为你生成 Dockerfile 与 nginx 配置并提交。

