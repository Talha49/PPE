'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Activity, Image as ImageIcon, Video, Settings, ShieldAlert, Camera } from 'lucide-react';

import StreamView from '@/components/dashboard/StreamView';
import DetectionTable from '@/components/dashboard/DetectionTable';
import ImageAnalyzer from '@/components/dashboard/ImageAnalyzer';
import VideoAnalyzer from '@/components/dashboard/VideoAnalyzer';
import UserHeader from '@/components/dashboard/UserHeader';
import CameraManager from '@/components/dashboard/CameraManager';
import AnalyticsView from '@/components/dashboard/AnalyticsView';

import { useWebSocket } from '@/hooks/useWebSocket';

function DashboardContent() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('view') || 'realtime';

    const [user, setUser] = useState(null);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [streamQuality, setStreamQuality] = useState('sd'); // 'sd' or 'hd'
    const [privacyMode, setPrivacyMode] = useState(false); // GDPR Privacy
    const [detectionsEnabled, setDetectionsEnabled] = useState(true); // AI On/Off

    // WebSocket State
    const [connectionUrl, setConnectionUrl] = useState(null);
    const { isConnected, lastMessage, sendMessage } = useWebSocket(connectionUrl);

    // Client-Side Stream Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamIntervalRef = useRef(null);
    const alertAudioRef = useRef(null);

    const [isAlertActive, setIsAlertActive] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    // Fetch user on mount
    useEffect(() => {
        fetch('/api/auth/me').then(res => res.json()).then(data => setUser(data));
        alertAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        alertAudioRef.current.volume = 0.5;
    }, []);

    // Clear data if not connected to prevent stale frames/detections
    const detections = isConnected ? (lastMessage?.detections || []) : [];
    const frame = isConnected ? lastMessage?.frame : null;

    // Handle incoming backend commands (Errors, Config Acks)
    useEffect(() => {
        if (lastMessage?.type === 'error') {
            setCameraError(lastMessage.message);
        } else if (lastMessage?.frame) {
            setCameraError(null);
            // PRO FIX: Synchronize Alert State with Backend Telemetry
            setIsAlertActive(lastMessage.alert_active || false);
        }
    }, [lastMessage]);

    // HOT-SWAP: Send config updates without reconnecting stream
    useEffect(() => {
        if (isConnected) {
            sendMessage({
                type: 'config_update',
                quality: streamQuality,
                privacy: privacyMode,
                detections: detectionsEnabled
            });
        }
    }, [streamQuality, privacyMode, detectionsEnabled, isConnected, sendMessage]);

    const handleStartStream = () => {
        if (!selectedCamera) return;
        const { sourceType, streamUrl } = selectedCamera;

        // --- PRODUCTION CLOUD CONFIG ---
        const host = 'ghauri21-ppedetector.hf.space';
        const protocol = 'wss';

        // 1. Detect Private/Local IP (DroidCam)
        const isPrivate = streamUrl && (streamUrl.includes('192.168.') || streamUrl.includes('10.') || streamUrl.includes('localhost') || streamUrl.includes('127.0.0.1'));

        // 2. Select Connection Mode:
        // - 'client' relay for Webcams and Private DroidCams (Required for Cloud Security)
        // - 'rtsp' (Direct AI Connect) for public URLs
        const mode = (sourceType === 'camera' || isPrivate) ? 'client' : 'rtsp';

        let url = `${protocol}://${host}/ws/detect/live?source_type=${mode}&quality=${streamQuality}&privacy=${privacyMode}&detections=${detectionsEnabled}`;

        // Only pass custom_url if the Cloud AI can actually reach it (Public IPs)
        if (sourceType === 'rtsp' && !isPrivate) {
            url += `&custom_url=${encodeURIComponent(streamUrl)}`;
        }

        console.log(`🚀 [SECURE CONNECT] Initializing Engine: ${url}`);
        setConnectionUrl(url);
    };

    const handleStopStream = () => {
        setConnectionUrl(null);
        setIsAlertActive(false);
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    // --- SECURE PROXY BRIDGE ---
    useEffect(() => {
        if (!isConnected || !selectedCamera || !connectionUrl?.includes('source_type=client')) return;

        const isWebcam = selectedCamera.sourceType === 'camera';

        if (isWebcam) {
            // RELAY A: Hardware Webcam
            navigator.mediaDevices.getUserMedia({ video: { width: 640 } })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                        streamIntervalRef.current = setInterval(() => {
                            if (!videoRef.current || !canvasRef.current || !isConnected) return;
                            const ctx = canvasRef.current.getContext('2d');
                            ctx.drawImage(videoRef.current, 0, 0, 640, 480);
                            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5);
                            sendMessage({ image: dataUrl });
                        }, 150);
                    }
                })
                .catch(err => console.error("Webcam blocked:", err));
        } else {
            // RELAY B: Private IP (DroidCam) via Secure API Proxy
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(selectedCamera.streamUrl)}`;
            const img = new Image();
            img.crossOrigin = "anonymous";

            let loadError = false;
            img.onerror = () => {
                loadError = true;
                console.error("⛔ PROXY ERROR: Cannot reach camera via server.");
            };
            img.src = proxyUrl;

            streamIntervalRef.current = setInterval(() => {
                if (!canvasRef.current || !isConnected || loadError) return;
                if (img.complete && img.naturalWidth > 0) {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.drawImage(img, 0, 0, 640, 480);
                    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5);
                    sendMessage({ image: dataUrl });
                }
            }, 150);
        }

        return () => { if (streamIntervalRef.current) clearInterval(streamIntervalRef.current); };
    }, [isConnected, selectedCamera, sendMessage, connectionUrl]);

    // --- SMART INCIDENT SYNTHESIS ---
    const activeIncidentsRef = useRef(new Map()); // Map<id, { startTime, captured }>

    // --- FRAME SYNCHRONIZATION FOR SNAPSHOTS ---
    useEffect(() => {
        if (frame && canvasRef.current) {
            const img = new Image();
            img.onload = () => {
                const ctx = canvasRef.current.getContext('2d');
                ctx.drawImage(img, 0, 0, 640, 480);
            };
            img.src = frame;
        }
    }, [frame]);

    useEffect(() => {
        if (!isConnected || !detections.length || !selectedCamera) return;

        const now = Date.now();
        const siteId = selectedCamera.siteId;
        const cameraId = selectedCamera._id;

        detections.forEach(d => {
            if (d.id === undefined || d.id === -1) return;

            const isViolation = d.compliance_status === 'VIOLATION' || d.class_name.includes('NO-');

            if (isViolation) {
                if (!activeIncidentsRef.current.has(d.id)) {
                    activeIncidentsRef.current.set(d.id, { startTime: now, captured: false });
                } else {
                    const incident = activeIncidentsRef.current.get(d.id);
                    const duration = now - incident.startTime;

                    // If violation persists for > 3 seconds and not yet captured
                    if (duration > 3000 && !incident.captured) {
                        incident.captured = true; // Prevent double logging

                        // CAPTURE VISUAL EVIDENCE
                        if (canvasRef.current) {
                            const snapshot = canvasRef.current.toDataURL('image/jpeg', 0.6);

                            fetch('/api/dashboard/incidents', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    siteId,
                                    cameraId,
                                    personId: d.personId, // Propagate persistent tracking ID
                                    type: 'PPE_VIOLATION',
                                    object: d.class_name,
                                    zone: d.zone_name || 'Global',
                                    status: 'VIOLATION',
                                    snapshot,
                                    duration: Math.round(duration / 1000)
                                })
                            }).catch(err => console.error("Incident upload failed:", err));
                        }
                    }
                }
            } else {
                // If person becomes compliant, clear their incident tracking
                activeIncidentsRef.current.delete(d.id);
            }
        });

        // Cleanup stale IDs (if person leaves the frame)
        const currentIds = new Set(detections.map(d => d.id));
        for (let id of activeIncidentsRef.current.keys()) {
            if (!currentIds.has(id)) activeIncidentsRef.current.delete(id);
        }

    }, [detections, isConnected, selectedCamera, frame]); // Added frame as dependency for sync

    // Effect to handle alerts
    useEffect(() => {
        if (isConnected && lastMessage?.alert_active) {
            setIsAlertActive(true);
            if (alertAudioRef.current && alertAudioRef.current.paused) {
                alertAudioRef.current.play().catch(e => { });
            }
            const timer = setTimeout(() => setIsAlertActive(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [lastMessage, isConnected]);

    const handleROIUpdate = (polygon) => {
        if (isConnected) sendMessage({ type: 'roi_update', polygon });
    };

    const handleSaveROI = async (roiConfig) => {
        if (!selectedCamera) return;
        const camId = selectedCamera._id.toString();

        try {
            const res = await fetch(`/api/dashboard/cameras/${camId}/roi`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roiConfig })
            });

            if (res.ok) {
                alert("Safety rules saved successfully!");
                setSelectedCamera(prev => ({ ...prev, roiConfig }));
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || 'Failed to save'}`);
            }
        } catch (error) {
            console.error(error);
            alert("Connection error while saving rules.");
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            <UserHeader user={user} />

            <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-2 duration-700">
                <video ref={videoRef} className="hidden" muted playsInline />
                <canvas ref={canvasRef} width="640" height="480" className="hidden" />

                {activeTab === 'realtime' && (
                    <div className="flex flex-col gap-6">
                        {!selectedCamera ? (
                            <Card className="border-dashed border-2 border-zinc-200 bg-zinc-50/50">
                                <CardContent className="flex flex-col items-center justify-center p-20 text-center">
                                    <div className="w-16 h-16 bg-zinc-100 rounded-3xl flex items-center justify-center text-zinc-400 mb-4">
                                        <Camera size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900">No Camera Selected</h3>
                                    <p className="text-zinc-500 max-w-sm mt-2">Please select a camera from the Site Inventory to start monitoring live safety compliance.</p>
                                    <Link href="/dashboard?view=manage" className="mt-6">
                                        <Button className="rounded-xl">Open Site Inventory</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <Card className="w-full border-blue-500/20 shadow-xl overflow-hidden rounded-3xl">
                                    <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between border-b border-zinc-100 py-4 px-6 bg-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600">
                                                <Camera size={20} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-bold">{selectedCamera.name}</CardTitle>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <StatusBadge status={isConnected ? 'connected' : 'disconnected'} />
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{selectedCamera.sourceType} stream</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedCamera(null)}>Switch Camera</Button>
                                            {isConnected ? (
                                                <Button variant="destructive" size="sm" onClick={handleStopStream}>Stop Stream</Button>
                                            ) : (
                                                <Button variant="primary" size="sm" onClick={handleStartStream}>Start Monitoring</Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 bg-zinc-50">
                                        <StreamView
                                            streamUrl={frame}
                                            isStreaming={isConnected}
                                            onROIChange={handleROIUpdate}
                                            isAlertActive={isAlertActive}
                                            initialZones={selectedCamera?.roiConfig || []}
                                            onSaveROI={handleSaveROI}
                                            quality={streamQuality}
                                            onQualityChange={setStreamQuality}
                                            privacyMode={privacyMode}
                                            onPrivacyChange={setPrivacyMode}
                                            detectionsEnabled={detectionsEnabled}
                                            onDetectionsToggle={setDetectionsEnabled}
                                            errorMessage={cameraError}
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="rounded-3xl shadow-lg border-zinc-200">
                                    <CardHeader className="border-b border-zinc-50 px-6 py-4 flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ShieldAlert className="text-blue-600" size={20} />
                                            <CardTitle className="text-base font-bold text-zinc-900">Compliance Log</CardTitle>
                                        </div>
                                        <Badge variant="secondary" className="font-bold text-[10px]">{detections.length} Signals Captured</Badge>
                                    </CardHeader>
                                    <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                                        <DetectionTable
                                            detections={detections}
                                            siteId={selectedCamera.siteId}
                                            cameraId={selectedCamera._id}
                                        />
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'manage' && (
                    <CameraManager
                        activeCameraId={selectedCamera?._id}
                        onSelectCamera={(cam) => {
                            setSelectedCamera(cam);
                            // Set URL to realtime to trigger switch
                            window.history.pushState({}, '', '/dashboard?view=realtime');
                        }}
                    />
                )}

                {activeTab === 'analytics' && <AnalyticsView />}
                {activeTab === 'image' && <ImageAnalyzer />}
                {activeTab === 'video' && <VideoAnalyzer />}
                {activeTab === 'settings' && (
                    <div className="flex flex-col items-center justify-center p-20 text-zinc-400">
                        <Settings size={64} className="mb-4 opacity-20" />
                        <h2 className="text-xl font-bold text-zinc-900">System Preferences</h2>
                        <p className="mt-2 text-sm italic">Enterprise configuration module coming soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main page wrapper with Suspense
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                    <span className="text-sm font-bold text-zinc-500 animate-pulse uppercase tracking-widest">Deciphering Safety Protocols...</span>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}

function StatusBadge({ status }) {
    if (status === 'connected') {
        return <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-full border border-green-100">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Active</span>
        </div>
    }
    return <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 rounded-full border border-zinc-200">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Standby</span>
    </div>
}
