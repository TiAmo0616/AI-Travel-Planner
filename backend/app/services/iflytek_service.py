import asyncio
import base64
import hashlib
import hmac
import json
import time
from datetime import datetime
from wsgiref.handlers import format_date_time
from time import mktime
import websockets
from urllib.parse import urlencode

STATUS_FIRST_FRAME = 0  # 第一帧的标识
STATUS_CONTINUE_FRAME = 1  # 中间帧标识
STATUS_LAST_FRAME = 2  # 最后一帧的标识

class Ws_Param:
    def __init__(self, APPID, APIKey, APISecret, AudioFile):
        self.APPID = APPID
        self.APIKey = APIKey
        self.APISecret = APISecret
        self.AudioFile = AudioFile

    def create_url(self):
        url = 'wss://ws-api.xfyun.cn/v2/iat'
        now = datetime.now()
        date = format_date_time(mktime(now.timetuple()))

        signature_origin = "host: " + "ws-api.xfyun.cn" + "\n"
        signature_origin += "date: " + date + "\n"
        signature_origin += "GET " + "/v2/iat " + "HTTP/1.1"
        signature_sha = hmac.new(self.APISecret.encode('utf-8'), signature_origin.encode('utf-8'), digestmod=hashlib.sha256).digest()
        signature_sha = base64.b64encode(signature_sha).decode(encoding='utf-8')

        authorization_origin = "api_key=\"%s\", algorithm=\"%s\", headers=\"%s\", signature=\"%s\"" % (
            self.APIKey, "hmac-sha256", "host date request-line", signature_sha)
        authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode(encoding='utf-8')

        v = {
            "authorization": authorization,
            "date": date,
            "host": "ws-api.xfyun.cn"
        }
        url = url + '?' + urlencode(v)
        return url

class IFlyTek:
    def __init__(self, app_id, api_key, api_secret, audio_file):
        self.app_id = app_id
        self.api_key = api_key
        self.api_secret = api_secret
        self.audio_file = audio_file

    async def recognize(self):
           # 验证音频文件
        import os
        if not os.path.exists(self.audio_file):
            return f"音频文件不存在: {self.audio_file}"
        
        file_size = os.path.getsize(self.audio_file)
        if file_size == 0:
            return "音频文件为空"
        
        print(f"音频文件信息: {self.audio_file}, 大小: {file_size} 字节")
        
        ws_param = Ws_Param(self.app_id, self.api_key, self.api_secret, self.audio_file)
        url = ws_param.create_url()
        async with websockets.connect(url) as ws:
            await self._send_audio(ws)
            result = await self._receive_result(ws)
            return result

    async def _send_audio(self, ws):
        frame_size = 8000  # 每帧 8000 字节
        interval = 0.04  # 每帧间隔 40ms
        status = STATUS_FIRST_FRAME

        with open(self.audio_file, "rb") as fp:
            while True:
                buf = fp.read(frame_size)
                if not buf:
                    status = STATUS_LAST_FRAME

                if status == STATUS_FIRST_FRAME:
                    d = {
                        "common": {"app_id": self.app_id},
                        "business": {"domain": "iat", "language": "zh_cn", "accent": "mandarin"},
                        "data": {"status": 0, "format": "audio/L16;rate=16000", "audio": base64.b64encode(buf).decode('utf-8'), "encoding": "raw"}
                    }
                    await ws.send(json.dumps(d))
                    status = STATUS_CONTINUE_FRAME
                elif status == STATUS_CONTINUE_FRAME:
                    d = {"data": {"status": 1, "format": "audio/L16;rate=16000", "audio": base64.b64encode(buf).decode('utf-8'), "encoding": "raw"}}
                    await ws.send(json.dumps(d))
                elif status == STATUS_LAST_FRAME:
                    d = {"data": {"status": 2, "format": "audio/L16;rate=16000", "audio": base64.b64encode(buf).decode('utf-8'), "encoding": "raw"}}
                    await ws.send(json.dumps(d))
                    break
                await asyncio.sleep(interval)

    async def _receive_result(self, ws):
        full_result = ""
        try:
            while True:
                message = await asyncio.wait_for(ws.recv(), timeout=30.0)
                print(f"Received raw message: {message}")
                
                response = json.loads(message)
                code = response.get("code", 0)
                
                if code != 0:
                    error_msg = f"讯飞API错误 {code}: {response.get('message', 'Unknown error')}"
                    print(error_msg)
                    return error_msg
                
                # 提取文本内容
                data = response.get("data", {})
                if "result" in data:
                    ws_data = data["result"].get("ws", [])
                    for item in ws_data:
                        for word_info in item.get("cw", []):
                            full_result += word_info.get("w", "")
                
                # 检查是否结束
                if data.get("status") == 2:
                    print("识别结束")
                    break
                    
        except asyncio.TimeoutError:
            print("识别超时")
            return "识别超时"
        except Exception as e:
            print(f"识别过程异常: {str(e)}")
            return f"识别异常: {str(e)}"
        
        print(f"最终识别结果: '{full_result}'")
        return full_result if full_result else "未识别到内容"