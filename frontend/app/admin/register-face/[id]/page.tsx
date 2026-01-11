"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

export default function RegisterFace() {
  const { id } = useParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [user, setUser] = useState<any>(null);
  const [capturing, setCapturing] = useState(false);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("Ready to scan");
  const [flash, setFlash] = useState(false);
  const [regMode, setRegMode] = useState<'webcam' | 'upload'>('webcam');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const totalSteps = 10;
  
  const angles = [
    "Looking Center", "Looking Center", 
    "Slight Left", "Slight Right", 
    "Chin Up", "Chin Down",
    "Near View", "Far View",
    "Final Check", "Processing..."
  ];

  useEffect(() => {
    fetchUser();
    startWebcam();
    return () => stopWebcam();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:8000/users/');
      const currentUser = res.data.find((u: any) => u.id === Number(id));
      setUser(currentUser);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access failed.");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const stopWebcamOld = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || capturing) return;

    setCapturing(true);
    let capturedCount = 0;
    
    for (let i = 0; i < totalSteps; i++) {
      try {
        const angleNote = angles[i] || "Steady...";
        setStatus(`${angleNote} (${i + 1}/${totalSteps})`);
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          
          // Trigger flash effect
          setFlash(true);
          setTimeout(() => setFlash(false), 100);

          await axios.post(`http://localhost:8000/register-face/${id}`, {
            image: imageData
          });
          
          capturedCount++;
          setCount(capturedCount);
        }
        await new Promise(r => setTimeout(r, 800));
      } catch (err: any) {
        setStatus(`Lost tracking at sample ${i+1}. Keep still!`);
      }
    }

    if (capturedCount > 0) {
      setStatus("Registration Complete!");
      setTimeout(() => {
         router.push('/admin/users');
      }, 1500);
    } else {
      setStatus("Registration Failed. Try again.");
    }
    setCapturing(false);
  };

  if (!user) return <div className="p-20 text-center text-tech-cyan animate-pulse">Initializing Scanner...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10 flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-extrabold text-glow-cyan mb-2 tracking-tight">FACE <span className="text-tech-cyan">REGISTRATION</span></h2>
          <p className="text-gray-400">Capturing biometric data for <span className="text-white font-bold">{user.full_name}</span> ({user.employee_id})</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => { setRegMode('webcam'); startWebcam(); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${regMode === 'webcam' ? 'bg-tech-cyan text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Webcam
          </button>
          <button 
            onClick={() => { setRegMode('upload'); stopWebcam(); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${regMode === 'upload' ? 'bg-tech-cyan text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Upload
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative glass rounded-[2rem] overflow-hidden border-2 border-tech-cyan/20 aspect-square md:aspect-auto md:min-h-[500px] flex items-center justify-center">
            {regMode === 'webcam' ? (
              <>
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Viewfinder Overlay */}
                <div className="absolute inset-x-12 inset-y-12 border-2 border-dashed border-tech-cyan/40 rounded-full flex items-center justify-center animate-pulse">
                   <div className="text-tech-cyan/10 font-black text-6xl select-none">BIOMETRIC</div>
                </div>

                {/* Rotating ring */}
                <div className="absolute inset-x-8 inset-y-8 border-[1px] border-tech-cyan/20 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-x-20 inset-y-20 border-[1px] border-tech-cyan/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                {/* Flash Effect Overlay */}
                <div className={`absolute inset-0 bg-white transition-opacity duration-150 pointer-events-none ${flash ? 'opacity-70' : 'opacity-0'}`} />
                
                <div className="absolute top-6 left-6 px-4 py-2 glass rounded-xl border border-white/10 text-[0.6rem] font-mono flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC_SYNC: ACTIVE_CHANNEL_01
                </div>
              </>
            ) : (
              <div className="w-full h-full p-10 flex flex-col items-center justify-center text-center">
                {previewUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={previewUrl} className="max-w-full max-h-full rounded-2xl border border-tech-cyan/30 shadow-2xl" alt="Preview" />
                    <button 
                      onClick={() => { setUploadFile(null); setPreviewUrl(null); }}
                      className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer group">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadFile(file);
                          setPreviewUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <div className="w-24 h-24 rounded-full bg-tech-cyan/10 border-2 border-dashed border-tech-cyan/30 flex items-center justify-center mb-6 group-hover:border-tech-cyan transition-colors">
                      <svg className="w-10 h-10 text-tech-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="font-bold text-gray-200 mb-2">Click to Upload Image</p>
                    <p className="text-xs text-gray-500 max-w-[200px]">Ensure the face is clear and centered for best recognition results.</p>
                  </label>
                )}
              </div>
            )}
        </div>

        <div className="flex flex-col justify-between">
           <div className="glass p-8 rounded-3xl space-y-6">
              <div>
                 <h4 className="text-xl font-bold mb-2 flex justify-between items-center">
                   {regMode === 'webcam' ? 'Scanning Biometrics' : 'Pre-processing File'}
                   {capturing && <span className="text-[0.6rem] bg-tech-cyan/20 px-2 py-1 rounded text-tech-cyan animate-pulse">LIVE ANALYZING</span>}
                 </h4>
                 <p className="text-sm text-tech-cyan mb-2 font-mono uppercase tracking-widest">{status}</p>
                 
                 <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-tech-blue via-tech-cyan to-tech-blue transition-all duration-500 shadow-[0_0_10px_rgba(0,243,255,0.5)]" 
                      style={{ width: regMode === 'webcam' ? `${(count / totalSteps) * 100}%` : (uploadFile ? '100%' : '0%') }}
                    />
                 </div>
                 <p className="text-right text-[0.6rem] mt-2 text-gray-500 font-mono tracking-widest leading-loose">
                   {regMode === 'webcam' ? `SIGNAL_STRENGTH: 98% // ${count}/${totalSteps} SAMPLES_LOCKED` : 'READY_ FOR_ENCRYPTION'}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                  <p className="text-[0.6rem] text-gray-500 font-bold mb-1 uppercase">Method</p>
                  <p className="text-xs font-bold text-tech-cyan uppercase">{regMode}</p>
                </div>
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                  <p className="text-[0.6rem] text-gray-500 font-bold mb-1 uppercase">Status</p>
                  <p className={`text-xs font-bold uppercase ${count === totalSteps || uploadFile ? 'text-green-500' : 'text-yellow-500'}`}>
                    {count === totalSteps ? 'Verified' : uploadFile ? 'Ready' : 'Pending'}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-tech-cyan/5 border border-tech-cyan/20 rounded-2xl">
                 <h5 className="font-bold text-tech-cyan mb-2 text-[0.6rem] uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-tech-cyan" /> Bio-Metric Protocols
                 </h5>
                 <ul className="text-[0.7rem] text-gray-400 space-y-2 font-mono">
                    <li>{regMode === 'webcam' ? '&gt; DETECT MULTIPLE ANGLES FOR ROBUSTNESS' : '&gt; ENSURE IMAGE HAS CLEAR LIGHTING'}</li>
                    <li>{regMode === 'webcam' ? '&gt; MAINTAIN STEADY POSITION WITHIN SCANNER' : '&gt; ONLY ONE FACE SHOULD BE PRESENT'}</li>
                    <li className="text-tech-cyan/40">&gt; ENCRYPTION: AES-256 BIT ROTATION</li>
                 </ul>
              </div>
           </div>

           <div className="mt-8 space-y-4">
              {regMode === 'webcam' ? (
                <button 
                  onClick={handleCapture}
                  disabled={capturing || count === totalSteps}
                  className={`w-full py-5 rounded-2xl font-black text-xl tracking-tighter transition-all ${
                    count === totalSteps 
                    ? 'bg-green-500 text-background cursor-default' 
                    : 'bg-tech-cyan text-background hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] active:scale-95'
                  } disabled:opacity-50`}
                >
                  {capturing ? 'SCANNING...' : count === totalSteps ? 'DATABASE UPDATED' : 'START BIOMETRIC SCAN'}
                </button>
              ) : (
                <button 
                  disabled={!uploadFile || capturing}
                  onClick={async () => {
                    if (!uploadFile) return;
                    setCapturing(true);
                    setStatus("Encoding file...");
                    const reader = new FileReader();
                    reader.readAsDataURL(uploadFile);
                    reader.onload = async () => {
                      try {
                        await axios.post(`http://localhost:8000/register-face/${id}`, {
                          image: reader.result
                        });
                        setStatus("Registration Complete!");
                        setTimeout(() => router.push('/admin/users'), 1500);
                      } catch (err) {
                        setStatus("Upload Failed. Check image clarity.");
                        setCapturing(false);
                      }
                    };
                  }}
                  className={`w-full py-5 rounded-2xl font-black text-xl tracking-tighter transition-all bg-tech-cyan text-background hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] disabled:opacity-50`}
                >
                  {capturing ? 'PROCESSING FILE...' : 'UPLOAD FACE DATA'}
                </button>
              )}
              
              <button 
                onClick={() => router.back()}
                className="w-full py-4 text-gray-500 hover:text-white transition-colors font-bold text-sm"
              >
                DISCARD & RETURN
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
