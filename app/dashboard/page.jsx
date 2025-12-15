'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Activity, Image as ImageIcon, Video, Wifi, WifiOff, Camera, Router } from 'lucide-react';

import StreamView from '@/components/dashboard/StreamView';
import DetectionTable from '@/components/dashboard/DetectionTable';
import ImageAnalyzer from '@/components/dashboard/ImageAnalyzer';
import VideoAnalyzer from '@/components/dashboard/VideoAnalyzer';

import { useWebSocket } from '@/hooks/useWebSocket';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('realtime');

    // RTSP / Stream Configuration
    const [sourceType, setSourceType] = useState('camera'); // 'camera' or 'rtsp'
    const [rtspConfig, setRtspConfig] = useState({
        protocol: 'rtsp',
        ip: '',
        port: '',
        username: '',
        password: ''
    });

    // WebSocket State
    const [connectionUrl, setConnectionUrl] = useState(null);
    const { isConnected, lastMessage, sendMessage } = useWebSocket(connectionUrl);

    // Client-Side Stream Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamIntervalRef = useRef(null);

    // Clear data if not connected to prevent stale frames/detections
    const detections = isConnected ? (lastMessage?.detections || []) : [];
    const frame = isConnected ? lastMessage?.frame : null;

    const handleStartStream = () => {
        // Use correct source type for deployment
        // If camera, we use 'client' to tell backend we will send frames
        // If RTSP, backend handles it

        const type = sourceType === 'camera' ? 'client' : 'rtsp';

        let url = `wss://ghauri21-ppedetector.hf.space/ws/detect/live?source_type=${type}`;
        if (sourceType === 'rtsp') {
            const { protocol, ip, port, username, password } = rtspConfig;
            if (!ip || !port) return alert("IP and Port are required for RTSP");
            url += `&protocol=${protocol}&ip=${ip}&port=${port}&username=${username}&password=${password}`;
        }
        setConnectionUrl(url);
    };

    const handleStopStream = () => {
        setConnectionUrl(null);
        // Stop client stream if active
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    // Effect to handle Client-Side Streaming when connected
    useEffect(() => {
        if (isConnected && sourceType === 'camera') {
            // Start Webcam
            navigator.mediaDevices.getUserMedia({ video: { width: 640 } })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();

                        // Start sending frames
                        streamIntervalRef.current = setInterval(() => {
                            if (!videoRef.current || !canvasRef.current || !isConnected) return;

                            const ctx = canvasRef.current.getContext('2d');
                            ctx.drawImage(videoRef.current, 0, 0, 640, 480);
                            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5); // Compression 0.5

                            sendMessage({ image: dataUrl });

                        }, 150); // ~7 FPS to save bandwidth
                    }
                })
                .catch(err => console.error("Error accessing webcam:", err));
        }

        return () => {
            if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        };
    }, [isConnected, sourceType, sendMessage]);

    const handleROIUpdate = (polygon) => {
        if (isConnected) {
            sendMessage({ type: 'roi_update', polygon });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
                    <p className="text-zinc-500 mt-1">Monitor site safety and compliance in real-time.</p>
                </div>
                <div className="flex gap-2">
                    <StatusBadge status={isConnected ? 'connected' : 'disconnected'} />
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex p-1 gap-1 bg-zinc-100 rounded-xl border border-zinc-200 w-fit">
                <TabButton
                    active={activeTab === 'realtime'}
                    onClick={() => setActiveTab('realtime')}
                    icon={<Activity size={18} />}
                    label="Real-time"
                />
                <TabButton
                    active={activeTab === 'image'}
                    onClick={() => setActiveTab('image')}
                    icon={<ImageIcon size={18} />}
                    label="Image Analysis"
                />
                <TabButton
                    active={activeTab === 'video'}
                    onClick={() => setActiveTab('video')}
                    icon={<Video size={18} />}
                    label="Video Analysis"
                />
            </div>

            <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Hidden Elements for Client-Side Streaming */}
                <video ref={videoRef} className="hidden" muted playsInline />
                <canvas ref={canvasRef} width="640" height="480" className="hidden" />

                {activeTab === 'realtime' && (
                    <div className="flex flex-col gap-6">
                        <Card className="w-full border-blue-500/20 shadow-lg">
                            <CardHeader className="flex flex-col gap-4 border-b border-zinc-100 pb-4">
                                <div className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        {isConnected ? <Wifi className="h-5 w-5 text-green-600 animate-pulse" /> : <WifiOff className="h-5 w-5 text-red-500" />}
                                        Live Feed
                                    </CardTitle>
                                    <div>
                                        {isConnected ? (
                                            <Button variant="destructive" size="sm" onClick={handleStopStream}>Stop Stream</Button>
                                        ) : (
                                            <Button variant="primary" size="sm" onClick={handleStartStream}>Start Stream</Button>
                                        )}
                                    </div>
                                </div>

                                {/* RTSP Config Panel */}
                                {!isConnected && (
                                    <div className="flex flex-wrap gap-4 items-center bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={sourceType === 'camera' ? 'secondary' : 'ghost'}
                                                onClick={() => setSourceType('camera')}
                                                className={sourceType === 'camera' ? 'bg-white shadow-sm border-zinc-200' : ''}
                                            >
                                                <Camera size={16} className="mr-2" /> Webcam
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={sourceType === 'rtsp' ? 'secondary' : 'ghost'}
                                                onClick={() => setSourceType('rtsp')}
                                                className={sourceType === 'rtsp' ? 'bg-white shadow-sm border-zinc-200' : ''}
                                            >
                                                <Router size={16} className="mr-2" /> RTSP / IP
                                            </Button>
                                        </div>

                                        {sourceType === 'rtsp' && (
                                            <div className="flex gap-2 flex-wrap items-center animate-in slide-in-from-left-2">
                                                <select
                                                    className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={rtspConfig.protocol}
                                                    onChange={(e) => setRtspConfig({ ...rtspConfig, protocol: e.target.value })}
                                                >
                                                    <option value="rtsp">RTSP</option>
                                                    <option value="http">HTTP</option>
                                                    <option value="https">HTTPS</option>
                                                </select>
                                                <input
                                                    className="h-9 rounded-md border border-zinc-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                                                    placeholder="IP Address"
                                                    value={rtspConfig.ip}
                                                    onChange={(e) => setRtspConfig({ ...rtspConfig, ip: e.target.value })}
                                                />
                                                <input
                                                    className="h-9 rounded-md border border-zinc-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                                                    placeholder="Port"
                                                    value={rtspConfig.port}
                                                    onChange={(e) => setRtspConfig({ ...rtspConfig, port: e.target.value })}
                                                />
                                                <input
                                                    className="h-9 rounded-md border border-zinc-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                                                    placeholder="User"
                                                    value={rtspConfig.username}
                                                    onChange={(e) => setRtspConfig({ ...rtspConfig, username: e.target.value })}
                                                />
                                                <input
                                                    className="h-9 rounded-md border border-zinc-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                                                    type="password"
                                                    placeholder="Pass"
                                                    value={rtspConfig.password}
                                                    onChange={(e) => setRtspConfig({ ...rtspConfig, password: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <StreamView
                                        streamUrl={frame}
                                        isStreaming={isConnected}
                                        onROIChange={handleROIUpdate}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Live Detections</CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-96 overflow-y-auto">
                                <DetectionTable detections={detections} />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'image' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Static Image Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImageAnalyzer />
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'video' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Video File Processing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VideoAnalyzer />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
                ? 'bg-white text-blue-600 shadow-sm border border-zinc-200'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
        >
            {icon}
            <span>{label}</span>
            {label === 'Real-time' && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
        </button>
    );
}

function StatusBadge({ status }) {
    if (status === 'connected') {
        return <Badge variant="success" className="h-7 px-3 gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> System Online</Badge>
    }
    return <Badge variant="destructive" className="h-7 px-3 gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Disconnected</Badge>
}
