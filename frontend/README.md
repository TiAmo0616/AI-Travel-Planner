# Frontend

前端（React, Create React App）说明

- 目录：`frontend/`
- 主要职责：提供用户界面，用于录音交互、展示与编辑行程、展示地图（高德/AMap）、与后端 API 通信。

关键点（基于当前代码）

- 使用 Create React App（见 `package.json` 中的 `react-scripts`），开发脚本：`npm start`。构建命令：`npm run build`。
- 源代码位于 `frontend/src/`，主要组件包括 `components/`、`pages/` 和 `services/`（`amapService.js`、`locationService.js`、`api.js` 等）。
- 前端通过 `src/api.js` 读取环境变量 `REACT_APP_API_URL` 以配置后端 baseURL。
- 地图与定位需要高德（AMap）Key；代码中使用 `REACT_APP_AMAP_KEY`(web 端) / `REACT_APP_AMAP_SECURITY_CODE`(web 端) / `REACT_APP_AMAP_API_KEY` (web 服务) 等环境变量。

快速开始（开发）

```powershell
cd frontend
npm install

# 启动开发服务器（Create React App）
npm start

# 构建生产包
npm run build

# 运行单元测试
npm test
```

环境变量

在开发时可以在 `frontend/` 下创建 `.env` 文件来传入运行时配置，例如：

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_AMAP_KEY=your_amap_key
REACT_APP_AMAP_SECURITY_CODE=your_security_code
REACT_APP_AMAP_API_KEY=your_amap_api_key
```

更改 `.env` 后需要重启开发服务器以生效。

与后端配合

- 默认前端在 `http://localhost:3000` 运行，后端默认 `http://localhost:8000`。后端的 CORS 设置允许来自 `http://localhost:3000` 的请求（见 `backend/app/main.py`）。

进一步阅读

- `frontend/src/api.js`：前端与后端通信的 axios 实例（通过 `REACT_APP_API_URL` 配置）。
- `frontend/src/services/`：地图、地理编码与位置服务实现。
