import api from './api';

// 文字生成行程
export const generateItinerary = (params) =>
  api.post('/ai/generate-itinerary', params);

// 语音转文字（FormData 上传）
export const transcribeAudio = (audioBlob) => {
  const form = new FormData();
  form.append('audio', audioBlob, 'voice.wav');
  return api.post('/ai/transcribe', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};