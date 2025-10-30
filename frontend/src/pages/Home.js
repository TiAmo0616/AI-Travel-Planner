// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useNavigate,useLocation } from 'react-router-dom';
// import { Input, Button, Space, message, Card, Progress, Typography, Alert, Tooltip, Spin } from 'antd';
// import { 
//   AudioOutlined, 
//   PlayCircleOutlined, 
//   CheckCircleOutlined,
//   EnvironmentOutlined,
//   CalendarOutlined,
//   DollarOutlined,
//   UserOutlined,
//   HeartOutlined,
//   InfoCircleOutlined,
//   PauseCircleOutlined,
//   LoadingOutlined
// } from '@ant-design/icons';
// import RecordRTC from 'recordrtc';
// import axios from 'axios';

// const { Text, Title } = Typography;

// function Home() {
//   const navigate = useNavigate();
//   const { state } = useLocation();

//   // 统一的状态管理
//   // 2. 空初始值
// const [formData, setFormData] = useState({
//   destination: '',
//   dates: '',
//   budget: '',
//   travelers: '',
//   preferences: ''
// });

// // 3. 如果有预填数据，一次性写入
//     useEffect(() => {
//       const prefill = state?.prefill;
//   console.log('Location state:', state);
//   console.log('prefill:', prefill);
//       if (prefill) {
//     setFormData({
//       destination: String(prefill.destination || ''),
//       dates: String(prefill.dates || ''),
//       budget: String(prefill.budget || ''),
//       travelers: String(prefill.travelers || ''),
//       preferences: String(prefill.preferences || '')
//     });
//   }
// }, [location.state]);

//   const [recordingState, setRecordingState] = useState({
//     destination: { recording: false, audioBlob: null, transcribed: false, transcribing: false },
//     dates: { recording: false, audioBlob: null, transcribed: false, transcribing: false },
//     budget: { recording: false, audioBlob: null, transcribed: false, transcribing: false },
//     travelers: { recording: false, audioBlob: null, transcribed: false, transcribing: false },
//     preferences: { recording: false, audioBlob: null, transcribed: false, transcribing: false }
//   });

//   const [loading, setLoading] = useState(false);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [activeRecording, setActiveRecording] = useState(null);

//   // 使用 useRef 来存储计时器，避免状态更新问题
//   const timersRef = useRef({});
//   const recordersRef = useRef({});
//   const streamsRef = useRef({});

//   // 录音配置
//   const RECORDING_CONFIG = {
//     MAX_DURATION: 60, // 最大录音时长60秒
//     AUTO_STOP_WARNING: 55, // 55秒时提示即将结束
//   };

//   // 字段配置
//   const fieldConfig = {
//     destination: { label: '目的地', icon: <EnvironmentOutlined />, placeholder: '例如：北京、上海、日本东京' },
//     dates: { label: '旅行天数', icon: <CalendarOutlined />, placeholder: '例如：3天、一周、周末两天' },
//     budget: { label: '预算', icon: <DollarOutlined />, placeholder: '例如：5000元、人均2000' },
//     travelers: { label: '同行人数', icon: <UserOutlined />, placeholder: '例如：2人、家庭4人' },
//     preferences: { label: '旅行偏好', icon: <HeartOutlined />, placeholder: '例如：美食、购物、自然风光、历史文化' }
//   };

//   // 使用 useMemo 计算表单验证状态
//   const formValidation = useMemo(() => {
//     const isFormValid = Object.values(formData).every(value => value.trim() !== '');
//     const completionPercentage = Math.round(
//       (Object.values(formData).filter(value => value.trim() !== '').length / Object.keys(fieldConfig).length) * 100
//     );
    
//     return { isFormValid, completionPercentage };
//   }, [formData]);

//   // 更新表单数据
//   const updateFormData = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//     // 如果用户手动输入，重置该字段的语音识别状态
//     if (value && recordingState[field].transcribed) {
//       setRecordingState(prev => ({
//         ...prev,
//         [field]: { ...prev[field], transcribed: false, transcribing: false }
//       }));
//     }
//   };

//   // 清理录音资源
//   const cleanupRecording = (field) => {
//     // 清理计时器
//     if (timersRef.current[field]) {
//       clearInterval(timersRef.current[field]);
//       delete timersRef.current[field];
//     }

//     // 清理媒体流
//     if (streamsRef.current[field]) {
//       streamsRef.current[field].getTracks().forEach(track => {
//         track.stop();
//         track.enabled = false;
//       });
//       delete streamsRef.current[field];
//     }

//     // 清理录音器
//     if (recordersRef.current[field]) {
//       delete recordersRef.current[field];
//     }
//   };

//   // 上传并转写语音
//   const handleUpload = async (field, audioBlob) => {
//     if (!audioBlob) {
//       return;
//     }

//     const token = localStorage.getItem('jwt_token');
//     if (!token) {
//       message.error('请先登录');
//       return;
//     }

//     // 设置转写中状态
//     setRecordingState(prev => ({
//       ...prev,
//       [field]: { ...prev[field], transcribing: true }
//     }));

//     const formData = new FormData();
//     formData.append('audio', audioBlob, `${field}_recording.wav`);

//     try {
//       const res = await axios.post('http://localhost:8000/ai/transcribe', formData, {
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         },
//         timeout: 30000
//       });
      
//       console.log('Transcription response:', res.data);
      
//       if (res.data.transcription) {
//         updateFormData(field, res.data.transcription);
//         setRecordingState(prev => ({
//           ...prev,
//           [field]: { ...prev[field], transcribed: true, transcribing: false }
//         }));
//         message.success(`${fieldConfig[field].label}识别成功`);
//       } else {
//         setRecordingState(prev => ({
//           ...prev,
//           [field]: { ...prev[field], transcribing: false }
//         }));
//         message.warning('未识别到有效内容，请重新录音或尝试更清晰的发音');
//       }
//     } catch (err) {
//       setRecordingState(prev => ({
//         ...prev,
//         [field]: { ...prev[field], transcribing: false }
//       }));
//       console.error('Upload error:', err);
//       const errorMsg = err.response?.data?.detail || err.message || '识别失败';
//       message.error(`语音转文字失败：${errorMsg}`);
//     }
//   };

//   // 开始录音
//   const startRecording = async (field) => {
//     try {
//       // 如果有其他正在进行的录音，先停止
//       if (activeRecording && activeRecording !== field) {
//         await stopRecording(activeRecording);
//       }

//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           sampleRate: 16000,
//           channelCount: 1,
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         } 
//       });

//       const recorder = new RecordRTC(stream, {
//         type: 'audio',
//         mimeType: 'audio/wav',
//         desiredSampRate: 16000,
//         numberOfAudioChannels: 1,
//         bufferSize: 4096,
//         audioBitsPerSecond: 128000,
//         recorderType: RecordRTC.StereoAudioRecorder
//       });

//       recorder.startRecording();
      
//       // 使用 ref 存储录音相关对象
//       recordersRef.current[field] = recorder;
//       streamsRef.current[field] = stream;

//       setRecordingState(prev => ({
//         ...prev,
//         [field]: { ...prev[field], recording: true, transcribed: false, transcribing: false }
//       }));
//       setActiveRecording(field);
//       setRecordingTime(0); // 重置计时

//       // 录音计时
//       let time = 0;
//       const timer = setInterval(() => {
//         time += 1;
//         setRecordingTime(time);
        
//         // 55秒时提示即将结束
//         if (time === RECORDING_CONFIG.AUTO_STOP_WARNING) {
//           message.warning(`录音即将在 ${RECORDING_CONFIG.MAX_DURATION - time} 秒后自动结束`);
//         }
        
//         // 60秒自动停止
//         if (time >= RECORDING_CONFIG.MAX_DURATION) {
//           stopRecording(field);
//           message.info('录音已自动停止（最长60秒）');
//         }
//       }, 1000);

//       timersRef.current[field] = timer;

//       message.info('录音已开始，最长可录制60秒');

//     } catch (error) {
//       console.error('Recording error:', error);
//       message.error(`无法访问麦克风: ${error.message}`);
//     }
//   };

//   // 停止录音
//   const stopRecording = async (field) => {
//     console.log(`Stopping recording for: ${field}`);
    
//     const recorder = recordersRef.current[field];
//     const stream = streamsRef.current[field];

//     if (!recorder) {
//       console.warn(`No recorder found for field: ${field}`);
//       // 即使没有找到录音器，也要清理状态
//       setRecordingState(prev => ({
//         ...prev,
//         [field]: { ...prev[field], recording: false }
//       }));
//       setActiveRecording(null);
//       setRecordingTime(0);
//       cleanupRecording(field);
//       return;
//     }

//     try {
//       // 停止录音
//       recorder.stopRecording(() => {
//         try {
//           const blob = recorder.getBlob();
//           const duration = recordingTime;
//           console.log(`Recording stopped for ${field}, duration: ${duration}s, blob size:`, blob.size);
          
//           setRecordingState(prev => ({
//             ...prev,
//             [field]: { 
//               ...prev[field], 
//               recording: false, 
//               audioBlob: blob 
//             }
//           }));
//           setActiveRecording(null);
//           setRecordingTime(0);
//           message.success(`${fieldConfig[field].label}录音完成（${duration}秒），正在识别...`);

//           // 自动发送识别请求
//           handleUpload(field, blob);

//           // 清理资源
//           cleanupRecording(field);
          
//         } catch (error) {
//           console.error('Error getting blob:', error);
//           message.error('处理录音数据时出错');
//           cleanupRecording(field);
//         }
//       });

//     } catch (error) {
//       console.error('Error stopping recording:', error);
//       message.error('停止录音时出错');
//       // 确保状态被清理
//       setRecordingState(prev => ({
//         ...prev,
//         [field]: { ...prev[field], recording: false }
//       }));
//       setActiveRecording(null);
//       setRecordingTime(0);
//       cleanupRecording(field);
//     }
//   };

//   // 播放录音
//   const playRecording = (field) => {
//     const audioBlob = recordingState[field].audioBlob;
//     if (audioBlob) {
//       const audioUrl = URL.createObjectURL(audioBlob);
//       const audio = new Audio(audioUrl);
//       audio.play().catch(err => {
//         message.error('播放失败: ' + err.message);
//       });
//     }
//   };

//   // 表单验证函数
//   const validateForm = () => {
//     return formValidation.isFormValid;
//   };

//   // 生成行程
//   const handlePlan = async () => {
//     if (!validateForm()) {
//       message.error('请填写所有必填字段');
//       return;
//     }

//     setLoading(true);


//     try {
//       const token = localStorage.getItem('jwt_token');
//       if (!token) throw new Error('请先登录');
//       console.log('Submitting form data:', formData);
//       const res = await axios.post('http://localhost:8000/ai/generate-itinerary', formData, {
//         headers: { 
//           'Content-Type': 'application/json', 
//           'Authorization': `Bearer ${token}` 
//         },
        
//       });

//       console.log('Itinerary generation response:', res.data);
//       navigate('/plan-result', { 
//           state: { planData: res.data , formData: formData}
//       });

//     } catch (err) {
  
//       const errorMsg = err.response?.data?.detail || err.message || '生成失败，请重试';
//       message.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 渲染表单字段
//   const renderFormField = (field) => {
//     const state = recordingState[field];
//     const config = fieldConfig[field];
//     const value = formData[field];

//     // 计算剩余时间
//     const remainingTime = RECORDING_CONFIG.MAX_DURATION - recordingTime;
//     const isNearEnd = remainingTime <= 10;

//     return (
//       <div className="form-field" key={field} style={{ 
//         marginBottom: 20, 
//         padding: 16, 
//         border: '1px solid #d9d9d9', 
//         borderRadius: 8,
//         background: state.recording && isNearEnd ? '#fff2f0' : 'white'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
//           <Text strong>
//             {config.icon} {config.label}
//           </Text>
//           <div>
//             {state.transcribing && (
//               <Tooltip title="识别中">
//                 <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} size="small" />
//               </Tooltip>
//             )}
//             {state.transcribed && !state.transcribing && (
//               <Tooltip title="语音识别成功">
//                 <CheckCircleOutlined style={{ color: '#52c41a' }} />
//               </Tooltip>
//             )}
//           </div>
//         </div>
        
//         <Input
//           placeholder={config.placeholder}
//           value={value}
//           onChange={(e) => updateFormData(field, e.target.value)}
//           size="large"
//           style={{ marginBottom: 12 }}
//           suffix={
//             state.transcribing ? (
//               <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} size="small" />
//             ) : state.transcribed ? (
//               <CheckCircleOutlined style={{ color: '#52c41a' }} />
//             ) : null
//           }
//         />

//         <Space size="small">
//           {state.recording ? (
//             <Tooltip title="停止录音">
//               <Button
//                 type={isNearEnd ? "danger" : "primary"}
//                 icon={<PauseCircleOutlined />}
//                 onClick={() => stopRecording(field)}
//                 style={isNearEnd ? { 
//                   background: '#ff4d4f', 
//                   borderColor: '#ff4d4f',
//                   animation: 'pulse 1s infinite'
//                 } : {}}
//               >
//                 {isNearEnd ? `即将结束 (${remainingTime}s)` : `停止录音 (${recordingTime}s)`}
//               </Button>
//             </Tooltip>
//           ) : (
//             <Tooltip title="开始录音（最长60秒）">
//               <Button
//                 type="primary"
//                 icon={<AudioOutlined />}
//                 onClick={() => startRecording(field)}
//                 disabled={activeRecording !== null && activeRecording !== field}
//                 loading={state.transcribing}
//               >
//                 {state.transcribing ? '识别中...' : '开始录音'}
//               </Button>
//             </Tooltip>
//           )}

//           <Tooltip title="播放录音">
//             <Button
//               icon={<PlayCircleOutlined />}
//               onClick={() => playRecording(field)}
//               disabled={!state.audioBlob || state.transcribing}
//             >
//               播放
//             </Button>
//           </Tooltip>
//         </Space>

//         {/* 录音时长提示 */}
//         {state.recording && (
//           <div style={{ marginTop: 8 }}>
//             <Progress 
//               percent={(recordingTime / RECORDING_CONFIG.MAX_DURATION) * 100} 
//               size="small" 
//               status={isNearEnd ? "exception" : "active"}
//               showInfo={false}
//             />
//             <Text type="secondary" style={{ fontSize: 12 }}>
//               已录制: {recordingTime}秒 / 最长: {RECORDING_CONFIG.MAX_DURATION}秒
//             </Text>
//           </div>
//         )}

//         {/* 识别状态提示 */}
//         {state.transcribing && (
//           <div style={{ marginTop: 8 }}>
//             <Text type="secondary" style={{ fontSize: 12, color: '#1890ff' }}>
//               <LoadingOutlined spin style={{ marginRight: 4 }} />
//               正在识别语音内容...
//             </Text>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // 组件卸载时清理所有资源
//   useEffect(() => {
//     return () => {
//       // 清理所有录音资源
//       Object.keys(timersRef.current).forEach(field => {
//         cleanupRecording(field);
//       });
//     };
//   }, []);

//   return (
//     <div className="page home-page" style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
//       <Card 
//         style={{ 
//           maxWidth: 800, 
//           margin: '0 auto',
//           borderRadius: 12,
//           boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
//         }}
//       >
//         <div style={{ textAlign: 'center', marginBottom: 24 }}>
//           <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
//             🗺️ AI 智能行程规划
//           </Title>
//           <Text type="secondary">
//             告诉我您的旅行需求，AI将为您生成完美行程
//           </Text>
//         </div>

//         {/* 进度提示 */}
//         <div style={{ marginBottom: 24 }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
//             <Text>表单完成度</Text>
//             <Text strong>{formValidation.completionPercentage}%</Text>
//           </div>
//           <Progress 
//             percent={formValidation.completionPercentage} 
//             size="small" 
//             strokeColor={{
//               '0%': '#108ee9',
//               '100%': '#87d068',
//             }}
//           />
//         </div>

        

//         {/* 使用提示 */}
//         <Alert
//           message="使用提示"
//           description={
//             <div>
//               <div>• 您可以通过打字或语音输入信息</div>
//               <div>• 点击"开始录音"按钮说话，最长可录制60秒</div>
//               <div>• 录音停止后将自动识别并转换为文字</div>
//               <div>• 可以点击"播放"回听录音内容</div>
//               <div>• 所有字段都需要填写才能生成行程</div>
//             </div>
//           }
//           type="info"
//           showIcon
//           icon={<InfoCircleOutlined />}
//           style={{ marginBottom: 24 }}
//         />

//         {/* 表单区域 */}
//         <div className="form-container">
//           {Object.keys(fieldConfig).map(field => renderFormField(field))}
//         </div>

//         {/* 操作按钮 */}
//         <div style={{ textAlign: 'center', marginTop: 32 }}>
//           <Button
//             type="primary"
//             size="large"
//             onClick={handlePlan}
//             loading={loading}
//             disabled={loading || !formValidation.isFormValid}
//             style={{ 
//               minWidth: 200,
//               height: 50,
//               fontSize: '16px',
//               background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
//               border: 'none',
//               borderRadius: 8
//             }}
//           >
//             {loading ? '生成中...' : '🚀 生成智能行程'}
//           </Button>
          
//           {formValidation.completionPercentage < 100 && (
//             <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
//               请完成所有信息的填写
//             </Text>
//           )}
//         </div>
//       </Card>

//       {/* 添加动画样式 */}
//       <style>
//         {`
//           @keyframes pulse {
//             0% { transform: scale(1); }
//             50% { transform: scale(1.05); }
//             100% { transform: scale(1); }
//           }
//         `}
//       </style>
//     </div>
//   );
// }

// export default Home;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { Input, Button, Space, message, Card, Progress, Typography, Alert, Tooltip, Spin, Select, Tag } from 'antd';
import { 
  AudioOutlined, 
  PlayCircleOutlined, 
  CheckCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  HeartOutlined,
  InfoCircleOutlined,
  PauseCircleOutlined,
  LoadingOutlined,
  PlusOutlined
} from '@ant-design/icons';
import RecordRTC from 'recordrtc';
import axios from 'axios';
import api from '../api';

const { Text, Title } = Typography;
const { Option } = Select;

function Home() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // 统一的状态管理
  const [formData, setFormData] = useState({
    destination: '',
    dates: '',
    budget: '',
    travelers: '',
    preferences: ''
  });

  // 用户保存的偏好列表
  const [userPreferences, setUserPreferences] = useState([]);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  // 3. 如果有预填数据，一次性写入
  useEffect(() => {
    const prefill = state?.prefill;
    console.log('Location state:', state);
    console.log('prefill:', prefill);
    if (prefill) {
      setFormData({
        destination: String(prefill.destination || ''),
        dates: String(prefill.dates || ''),
        budget: String(prefill.budget || ''),
        travelers: String(prefill.travelers || ''),
        preferences: String(prefill.preferences || '')
      });
    }
  }, [state]);

  const [recordingState, setRecordingState] = useState({
    destination: { recording: false, audioBlob: null, transcribed: false, transcribing: false },
    dates: { recording: false, audioBlob: null, transcribed: false, transcribing: false },
    budget: { recording: false, audioBlob: null, transcribed: false, transcribing: false },
    travelers: { recording: false, audioBlob: null, transcribed: false, transcribing: false },
    preferences: { recording: false, audioBlob: null, transcribed: false, transcribing: false }
  });

  const [loading, setLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeRecording, setActiveRecording] = useState(null);

  // 使用 useRef 来存储计时器，避免状态更新问题
  const timersRef = useRef({});
  const recordersRef = useRef({});
  const streamsRef = useRef({});

  // 录音配置
  const RECORDING_CONFIG = {
    MAX_DURATION: 60, // 最大录音时长60秒
    AUTO_STOP_WARNING: 55, // 55秒时提示即将结束
  };

  // 字段配置
  const fieldConfig = {
    destination: { label: '目的地', icon: <EnvironmentOutlined />, placeholder: '例如：北京、上海、日本东京' },
    dates: { label: '旅行天数', icon: <CalendarOutlined />, placeholder: '例如：3天、一周、周末两天' },
    budget: { label: '预算', icon: <DollarOutlined />, placeholder: '例如：5000元、人均2000' },
    travelers: { label: '同行人数', icon: <UserOutlined />, placeholder: '例如：2人、家庭4人' },
    preferences: { label: '旅行偏好', icon: <HeartOutlined />, placeholder: '例如：美食、购物、自然风光、历史文化' }
  };

  // 加载用户保存的偏好
  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    setPreferencesLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        // 未登录时静默处理，不显示错误
        setPreferencesLoading(false);
        return;
      }

      const response = await api.get('http://localhost:8000/preferences/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('用户偏好设置加载成功:', response.data);
      setUserPreferences(response.data);
    } catch (error) {
      console.error('加载用户偏好设置失败:', error);
      // 静默处理错误，不影响主要功能
    } finally {
      setPreferencesLoading(false);
    }
  };

  // 使用 useMemo 计算表单验证状态
  const formValidation = useMemo(() => {
    const isFormValid = Object.values(formData).every(value => value.trim() !== '');
    const completionPercentage = Math.round(
      (Object.values(formData).filter(value => value.trim() !== '').length / Object.keys(fieldConfig).length) * 100
    );
    
    return { isFormValid, completionPercentage };
  }, [formData]);

  // 更新表单数据
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 如果用户手动输入，重置该字段的语音识别状态
    if (value && recordingState[field].transcribed) {
      setRecordingState(prev => ({
        ...prev,
        [field]: { ...prev[field], transcribed: false, transcribing: false }
      }));
    }
  };

  // 添加偏好到偏好字段（包含名称和描述）
  const addPreferenceToField = (preference) => {
    const currentPreferences = formData.preferences.trim();
    
    // 构建要添加的文本：名称 + 描述（如果有）
    let preferenceText = preference.name;
    if (preference.description && preference.description.trim() !== '' && preference.description !== '暂无描述') {
      preferenceText = `${preference.name}（${preference.description}）`;
    }
    
    // 检查是否已经添加过该偏好（基于名称检查）
    if (currentPreferences.includes(preference.name)) {
      message.warning(`偏好 "${preference.name}" 已添加`);
      return;
    }

    let newPreferences;
    if (currentPreferences === '') {
      
       const lastChar = currentPreferences.charAt(preferenceText.length - 1);
      const separator = /[，,。.;；!！?？]/.test(lastChar) ? ' ' : '，';
      newPreferences = preferenceText + separator;
    } else {
      
      newPreferences = currentPreferences  + preferenceText;
      // 检查当前偏好是否以标点符号结尾，如果没有则添加逗号
      const lastChar = currentPreferences.charAt(newPreferences.length - 1);
      const separator = /[，,。.;；!！?？]/.test(lastChar) ? ' ' : '，';
      newPreferences += separator;
    }
    

    updateFormData('preferences', newPreferences);
    message.success(`已添加偏好: ${preference.name}`);
  };



  // 清理录音资源
  const cleanupRecording = (field) => {
    // 清理计时器
    if (timersRef.current[field]) {
      clearInterval(timersRef.current[field]);
      delete timersRef.current[field];
    }

    // 清理媒体流
    if (streamsRef.current[field]) {
      streamsRef.current[field].getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      delete streamsRef.current[field];
    }

    // 清理录音器
    if (recordersRef.current[field]) {
      delete recordersRef.current[field];
    }
  };

  // 上传并转写语音
  const handleUpload = async (field, audioBlob) => {
    if (!audioBlob) {
      return;
    }

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      message.error('请先登录');
      return;
    }

    // 设置转写中状态
    setRecordingState(prev => ({
      ...prev,
      [field]: { ...prev[field], transcribing: true }
    }));

    const uploadformData = new FormData();
    uploadformData.append('audio', audioBlob, `${field}_recording.wav`);

    try {
      const res = await api.post('http://localhost:8000/ai/transcribe', uploadformData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        // timeout: 30000
      });
      
      console.log('Transcription response:', res.data);
      
      if (res.data.transcription) {
        console.log(formData)
        const currentValue = formData[field].trim();
        const newTranscription = res.data.transcription.trim();
        
        let updatedValue;
        
        if (currentValue === '') {
          // 如果当前为空，直接使用新内容
          updatedValue = newTranscription;
        } else {
          // 如果当前已有内容，检查是否需要添加分隔符
          const lastChar = currentValue.charAt(currentValue.length - 1);
          
          // 对于偏好字段，使用逗号分隔；其他字段使用空格分隔
          const separator = field === 'preferences' ? '，' : ' ';
          
          if (/[，,。.;；!！?？\s]/.test(lastChar)) {
            updatedValue = currentValue + newTranscription;
          } else {
            updatedValue = currentValue + separator + newTranscription;
          }
        }
        updateFormData(field, updatedValue);


        
        //updateFormData(field, res.data.transcription);
        setRecordingState(prev => ({
          ...prev,
          [field]: { ...prev[field], transcribed: true, transcribing: false }
        }));
        message.success(`${fieldConfig[field].label}识别成功`);
      } else {
        setRecordingState(prev => ({
          ...prev,
          [field]: { ...prev[field], transcribing: false }
        }));
        message.warning('未识别到有效内容，请重新录音或尝试更清晰的发音');
      }
    } catch (err) {
      setRecordingState(prev => ({
        ...prev,
        [field]: { ...prev[field], transcribing: false }
      }));
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.detail || err.message || '识别失败';
      message.error(`语音转文字失败：${errorMsg}`);
    }
  };

  // 开始录音
  const startRecording = async (field) => {
    try {
      // 如果有其他正在进行的录音，先停止
      if (activeRecording && activeRecording !== field) {
        await stopRecording(activeRecording);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
        bufferSize: 4096,
        audioBitsPerSecond: 128000,
        recorderType: RecordRTC.StereoAudioRecorder
      });

      recorder.startRecording();
      
      // 使用 ref 存储录音相关对象
      recordersRef.current[field] = recorder;
      streamsRef.current[field] = stream;

      setRecordingState(prev => ({
        ...prev,
        [field]: { ...prev[field], recording: true, transcribed: false, transcribing: false }
      }));
      setActiveRecording(field);
      setRecordingTime(0); // 重置计时

      // 录音计时
      let time = 0;
      const timer = setInterval(() => {
        time += 1;
        setRecordingTime(time);
        
        // 55秒时提示即将结束
        if (time === RECORDING_CONFIG.AUTO_STOP_WARNING) {
          message.warning(`录音即将在 ${RECORDING_CONFIG.MAX_DURATION - time} 秒后自动结束`);
        }
        
        // 60秒自动停止
        if (time >= RECORDING_CONFIG.MAX_DURATION) {
          stopRecording(field);
          message.info('录音已自动停止（最长60秒）');
        }
      }, 1000);

      timersRef.current[field] = timer;

      message.info('录音已开始，最长可录制60秒');

    } catch (error) {
      console.error('Recording error:', error);
      message.error(`无法访问麦克风: ${error.message}`);
    }
  };

  // 停止录音
  const stopRecording = async (field) => {
    console.log(`Stopping recording for: ${field}`);
    
    const recorder = recordersRef.current[field];
    const stream = streamsRef.current[field];

    if (!recorder) {
      console.warn(`No recorder found for field: ${field}`);
      // 即使没有找到录音器，也要清理状态
      setRecordingState(prev => ({
        ...prev,
        [field]: { ...prev[field], recording: false }
      }));
      setActiveRecording(null);
      setRecordingTime(0);
      cleanupRecording(field);
      return;
    }

    try {
      // 停止录音
      recorder.stopRecording(() => {
        try {
          const blob = recorder.getBlob();
          const duration = recordingTime;
          console.log(`Recording stopped for ${field}, duration: ${duration}s, blob size:`, blob.size);
          
          setRecordingState(prev => ({
            ...prev,
            [field]: { 
              ...prev[field], 
              recording: false, 
              audioBlob: blob 
            }
          }));
          setActiveRecording(null);
          setRecordingTime(0);
          message.success(`${fieldConfig[field].label}录音完成（${duration}秒），正在识别...`);

          // 自动发送识别请求
          handleUpload(field, blob);

          // 清理资源
          cleanupRecording(field);
          
        } catch (error) {
          console.error('Error getting blob:', error);
          message.error('处理录音数据时出错');
          cleanupRecording(field);
        }
      });

    } catch (error) {
      console.error('Error stopping recording:', error);
      message.error('停止录音时出错');
      // 确保状态被清理
      setRecordingState(prev => ({
        ...prev,
        [field]: { ...prev[field], recording: false }
      }));
      setActiveRecording(null);
      setRecordingTime(0);
      cleanupRecording(field);
    }
  };

  // 播放录音
  const playRecording = (field) => {
    const audioBlob = recordingState[field].audioBlob;
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        message.error('播放失败: ' + err.message);
      });
    }
  };

  // 表单验证函数
  const validateForm = () => {
    return formValidation.isFormValid;
  };

  // 生成行程
  const handlePlan = async () => {
    if (!validateForm()) {
      message.error('请填写所有必填字段');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('请先登录');
      console.log('Submitting form data:', formData);
      const res = await api.post('http://localhost:8000/ai/generate-itinerary', formData, {
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        
      });

      console.log('Itinerary generation response:', res.data);
      navigate('/plan-result', { 
          state: { planData: res.data , formData: formData}
      });

    } catch (err) {
  
      const errorMsg = err.response?.data?.detail || err.message || '生成失败，请重试';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 渲染偏好快速选择组件
  const renderPreferenceQuickSelect = () => {
    if (userPreferences.length === 0) {
      return null;
    }

    return (
      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          <HeartOutlined /> 快速选择已保存的偏好
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {userPreferences.map(preference => (
            <Tooltip
              key={preference.id}
              title={
                preference.description && preference.description.trim() !== '' && preference.description !== '暂无描述'
                  ? `${preference.name}: ${preference.description}`
                  : preference.name
              }
            >
              <Tag
                color="blue"
                style={{ 
                  cursor: 'pointer', 
                  padding: '4px 8px',
                  borderRadius: 16,
                  fontSize: '14px',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => addPreferenceToField(preference)}
              >
                {preference.name}
                <PlusOutlined style={{ marginLeft: 4 }} />
              </Tag>
            </Tooltip>
          ))}
        </div>
        <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
          点击偏好标签快速添加到偏好字段（包含详细描述）
        </Text>
      </div>
    );
  };

  // 渲染表单字段
  const renderFormField = (field) => {
    const state = recordingState[field];
    const config = fieldConfig[field];
    const value = formData[field];

    // 计算剩余时间
    const remainingTime = RECORDING_CONFIG.MAX_DURATION - recordingTime;
    const isNearEnd = remainingTime <= 10;

    // 对于偏好字段，添加快速选择
    const isPreferenceField = field === 'preferences';

    return (
      <div className="form-field" key={field} style={{ 
        marginBottom: 20, 
        padding: 16, 
        border: '1px solid #d9d9d9', 
        borderRadius: 8,
        background: state.recording && isNearEnd ? '#fff2f0' : 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>
            {config.icon} {config.label}
          </Text>
          <div>
            {state.transcribing && (
              <Tooltip title="识别中">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} size="small" />
              </Tooltip>
            )}
            {state.transcribed && !state.transcribing && (
              <Tooltip title="语音识别成功">
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              </Tooltip>
            )}
          </div>
        </div>
        
        {/* 偏好字段的特殊处理 */}
        {isPreferenceField && renderPreferenceQuickSelect()}
        
        <Input
          placeholder={config.placeholder}
          value={value}
          onChange={(e) => updateFormData(field, e.target.value)}
          size="large"
          style={{ marginBottom: 12 }}
          suffix={
            state.transcribing ? (
              <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} size="small" />
            ) : state.transcribed ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            ) : null
          }
        />

        <Space size="small">
          {state.recording ? (
            <Tooltip title="停止录音">
              <Button
                type={isNearEnd ? "danger" : "primary"}
                icon={<PauseCircleOutlined />}
                onClick={() => stopRecording(field)}
                style={isNearEnd ? { 
                  background: '#ff4d4f', 
                  borderColor: '#ff4d4f',
                  animation: 'pulse 1s infinite'
                } : {}}
              >
                {isNearEnd ? `即将结束 (${remainingTime}s)` : `停止录音 (${recordingTime}s)`}
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="开始录音（最长60秒）">
              <Button
                type="primary"
                icon={<AudioOutlined />}
                onClick={() => startRecording(field)}
                disabled={activeRecording !== null && activeRecording !== field}
                loading={state.transcribing}
              >
                {state.transcribing ? '识别中...' : '开始录音'}
              </Button>
            </Tooltip>
          )}

          <Tooltip title="播放录音">
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => playRecording(field)}
              disabled={!state.audioBlob || state.transcribing}
            >
              播放
            </Button>
          </Tooltip>
        </Space>

        {/* 录音时长提示 */}
        {state.recording && (
          <div style={{ marginTop: 8 }}>
            <Progress 
              percent={(recordingTime / RECORDING_CONFIG.MAX_DURATION) * 100} 
              size="small" 
              status={isNearEnd ? "exception" : "active"}
              showInfo={false}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              已录制: {recordingTime}秒 / 最长: {RECORDING_CONFIG.MAX_DURATION}秒
            </Text>
          </div>
        )}

        {/* 识别状态提示 */}
        {state.transcribing && (
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12, color: '#1890ff' }}>
              <LoadingOutlined spin style={{ marginRight: 4 }} />
              正在识别语音内容...
            </Text>
          </div>
        )}
      </div>
    );
  };

  // 组件卸载时清理所有资源
  useEffect(() => {
    return () => {
      // 清理所有录音资源
      Object.keys(timersRef.current).forEach(field => {
        cleanupRecording(field);
      });
    };
  }, []);

  return (
    <div className="page home-page" style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card 
        style={{ 
          maxWidth: 800, 
          margin: '0 auto',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            🗺️ AI 智能行程规划
          </Title>
          <Text type="secondary">
            告诉我您的旅行需求，AI将为您生成完美行程
          </Text>
        </div>

        {/* 进度提示 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>表单完成度</Text>
            <Text strong>{formValidation.completionPercentage}%</Text>
          </div>
          <Progress 
            percent={formValidation.completionPercentage} 
            size="small" 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>

        {/* 使用提示 */}
        <Alert
          message="使用提示"
          description={
            <div>
              <div>• 您可以通过打字或语音输入信息</div>
              <div>• 点击"开始录音"按钮说话，最长可录制60秒</div>
              <div>• 录音停止后将自动识别并转换为文字</div>
              <div>• 可以点击"播放"回听录音内容</div>
              <div>• 所有字段都需要填写才能生成行程</div>
              {userPreferences.length > 0 && (
                <div>• 您可以在"旅行偏好"字段快速选择已保存的偏好（包含详细描述）</div>
              )}
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24 }}
        />

        {/* 表单区域 */}
        <div className="form-container">
          {Object.keys(fieldConfig).map(field => renderFormField(field))}
        </div>

        {/* 操作按钮 */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Button
            type="primary"
            size="large"
            onClick={handlePlan}
            loading={loading}
            disabled={loading || !formValidation.isFormValid}
            style={{ 
              minWidth: 200,
              height: 50,
              fontSize: '16px',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              borderRadius: 8
            }}
          >
            {loading ? '生成中...' : '🚀 生成智能行程'}
          </Button>
          
          {formValidation.completionPercentage < 100 && (
            <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
              请完成所有信息的填写
            </Text>
          )}
        </div>
      </Card>

      {/* 添加动画样式 */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}

export default Home;