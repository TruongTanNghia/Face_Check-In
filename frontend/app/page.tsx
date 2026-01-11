"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function AttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [mode, setMode] = useState<'Auto' | 'Check-in' | 'Check-out'>('Auto');

  useEffect(() => {
    if (isCameraOn) {
      startWebcam();
    } else {
      stopWebcam();
    }
    
    let interval: any;
    if (isCameraOn) {
      interval = setInterval(captureAndRecognize, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
      stopWebcam();
    };
  }, [isCameraOn, mode]); // Re-run effect when camera toggle or mode changes

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Webcam access denied. Please enable camera permissions.");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureAndRecognize = async () => {
    if (!videoRef.current || processing) return;

    setProcessing(true);
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas && video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          
          const response = await axios.post('http://localhost:8000/recognize/', {
            image: imageData,
            mode: mode
          });
          
          if (response.data.status !== 'no_face' && response.data.status !== 'unknown') {
            setStatus(response.data);
            // Clear status after 5 seconds
            setTimeout(() => setStatus(null), 5000);
          } else if (response.data.status === 'unknown') {
             // Optional: Handle unknown status differently if needed
          }
        }
      }
    } catch (err) {
      console.error("Recognition error:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold text-glow-cyan mb-2 tracking-tight">REAL-TIME <span className="text-tech-cyan">ATTENDANCE</span></h2>
        <p className="text-gray-400">Position your face within the frame for automatic check-in/out.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Camera View */}
        <div className="lg:col-span-2 relative">
          <div className="glass rounded-[2rem] overflow-hidden border-tech-cyan/30 border-2 shadow-[0_0_30px_rgba(0,243,255,0.15)] relative aspect-video">
            {isCameraOn ? (
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <p className="text-gray-400 font-mono tracking-widest text-sm uppercase">Camera System Offline</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanner Overlay */}
            {isCameraOn && (
              <div className="absolute inset-0 border-[40px] border-transparent pointer-events-none">
                <div className="w-full h-full border-2 border-tech-cyan/40 rounded-3xl relative overflow-hidden">
                  <div className="scanner-line"></div>
                  
                  {/* Viewfinder Corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-tech-cyan"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-tech-cyan"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-tech-cyan"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-tech-cyan"></div>
                </div>
              </div>
            )}

            {/* Status Overlay */}
            {status && (
              <div className="absolute bottom-10 left-10 right-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`glass p-6 rounded-2xl flex items-center justify-between border-2 ${status.status === 'success' ? 'border-green-500/50 bg-green-500/10' : 'border-yellow-500/50 bg-yellow-500/10'}`}>
                   <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Authenticated User</p>
                      <h3 className="text-2xl font-bold text-white">{status.name}</h3>
                      <p className="text-sm text-gray-300">ID: {status.employee_id}</p>
                   </div>
                   <div className="text-right">
                      <p className={`text-xl font-black uppercase ${status.type === 'Check-in' ? 'text-green-400' : 'text-blue-400'}`}>
                        {status.type}
                      </p>
                      <p className="text-sm font-mono text-gray-400">{status.time}</p>
                   </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-8 text-center">
                <p className="text-red-500 text-xl font-bold">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl space-y-6">
            <div>
              <h4 className="text-xl font-bold mb-4 text-tech-cyan">Camera Control</h4>
              <button 
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 ${
                  isCameraOn 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' 
                  : 'bg-tech-cyan/20 text-tech-cyan border border-tech-cyan/30 hover:bg-tech-cyan hover:text-black'
                }`}
              >
                {isCameraOn ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                    STOP CAMERA
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    START CAMERA
                  </>
                )}
              </button>
            </div>

            <div className="separator h-[1px] bg-white/5"></div>

            <div>
              <h4 className="text-xl font-bold mb-4 text-tech-cyan">Operation Mode</h4>
              <div className="grid grid-cols-1 gap-3">
                {(['Auto', 'Check-in', 'Check-out'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                      mode === m 
                      ? 'bg-tech-cyan text-black border-tech-cyan shadow-[0_0_15px_rgba(0,243,255,0.3)]' 
                      : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {m === 'Auto' && '🔄 AUTOMATIC DETECTION'}
                    {m === 'Check-in' && '📥 FORCED CHECK-IN'}
                    {m === 'Check-out' && '📤 FORCED CHECK-OUT'}
                  </button>
                ))}
              </div>
            </div>

            <div className="separator h-[1px] bg-white/5"></div>

            <div>
              <h4 className="text-sm font-bold mb-4 text-gray-500 uppercase tracking-widest">Live Stats</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-gray-400 text-xs">Scan Status</span>
                  <span className={`flex items-center gap-2 text-xs ${processing ? 'text-tech-cyan' : 'text-green-400'}`}>
                     <div className={`w-2 h-2 rounded-full ${processing ? 'bg-tech-cyan animate-pulse' : (isCameraOn ? 'bg-green-400' : 'bg-gray-600')}`}></div>
                     {processing ? 'Processing...' : (isCameraOn ? 'Ready to Scan' : 'System Paused')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border-l-4 border-tech-purple">
            <h4 className="text-xl font-bold mb-2">Instructions</h4>
            <ul className="text-sm text-gray-400 space-y-3">
              <li className="flex gap-2"><span>1.</span> Face the camera directly and stay still.</li>
              <li className="flex gap-2"><span>2.</span> Ensure adequate lighting for recognition.</li>
              <li className="flex gap-2"><span>3.</span> System will automatically log your entry/exit.</li>
              <li className="flex gap-2"><span>4.</span> Wait for the green/blue confirmation message.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
