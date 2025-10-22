import React, { useState } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [trip, setTrip] = useState(null);
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  // 录音功能（浏览器原生）
  const handleRecord = async () => {
    if (!window.MediaRecorder) {
      alert('浏览器不支持录音');
      return;
    }
    let chunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new window.MediaRecorder(stream);
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      setFile(blob);
      setTranscript('正在识别...');
      // 上传音频到后端
      const form = new FormData();
      form.append('file', blob, 'voice.wav');
      const res = await fetch('http://localhost:8000/api/voice/stt', { method: 'POST', body: form });
      const data = await res.json();
      setTranscript(data.transcript || '');
      setInput(data.transcript || '');
    };
    recorder.start();
    setTimeout(() => recorder.stop(), 4000); // 录4秒
    
  };

  // 文字输入直接识别
  const handleTextSTT = async () => {
    setTranscript('正在识别...');
    const form = new FormData();
    form.append('text', input);
    const res = await fetch('http://localhost:8000/api/voice/stt', { method: 'POST', body: form });
    const data = await res.json();
    setTranscript(data.transcript || '');
  };

  // 智能行程生成
  const handlePlan = async () => {
    setLoading(true);
    // NLU 解析
    const nluRes = await fetch('http://localhost:8000/api/nlu/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: transcript || input })
    });
    const nlu = await nluRes.json();
    // 创建行程
    const tripRes = await fetch('http://localhost:8000/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: nlu, text: transcript || input })
    });
    const tripData = await tripRes.json();
    setTrip(tripData);
    // 生成详细行程
    const genRes = await fetch(`http://localhost:8000/api/trips/${tripData.id}/generate`, { method: 'POST' });
    const genData = await genRes.json();
    setPlan(genData.plan);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>AI 智能行程规划</h2>
      <textarea
        rows={3}
        style={{ width: '100%' }}
        placeholder="请输入旅行需求，如：我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <div style={{ margin: '10px 0' }}>
        <button onClick={handleTextSTT}>文字识别</button>
        <button onClick={handleRecord}>语音录入</button>
      </div>
      {transcript && <div>识别结果：{transcript}</div>}
      <button onClick={handlePlan} disabled={loading || !transcript && !input}>
        {loading ? '生成中...' : '生成智能行程'}
      </button>
      {plan && (
        <div style={{ marginTop: 20 }}>
          <h3>个性化行程规划</h3>
          <pre style={{ background: '#f6f6f6', padding: 10 }}>{plan}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
