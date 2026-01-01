import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useROI } from '@/hooks/useROI';
import { Shield, AlertTriangle, Trash2, Plus, PenTool } from 'lucide-react';

export default function StreamView({
    streamUrl,
    isStreaming,
    onROIChange,
    isAlertActive,
    initialZones = [],
    onSaveROI,
    quality = 'sd',
    onQualityChange,
    privacyMode = false,
    onPrivacyChange,
    detectionsEnabled = true,
    onDetectionsToggle,
    errorMessage = null
}) {
    const canvasRef = useRef(null);
    const videoRef = useRef(null);

    const {
        zones, setZones, points, isDrawing, setIsDrawing, activeZoneId, setActiveZoneId,
        addPoint, finishZone, startDragging, handleDrag, stopDragging,
        deleteActiveZone, getBackendPolygons, clearAll
    } = useROI(canvasRef, videoRef);

    // Load initial zones when camera changes
    useEffect(() => {
        if (initialZones && initialZones.length > 0) {
            // Transform backend format to hook format if needed
            // Backend: [{type, points: [[x,y]...]}]
            // Hook: [{id, name, type, points: [{x,y}...]}]
            const formatted = initialZones.map((z, idx) => {
                const rawPoints = z.polygon || z.points || [];
                return {
                    id: z.id || `zone-${idx}-${Date.now()}`,
                    name: z.name || `${z.type === 'danger' ? 'Danger' : 'PPE'} Area ${idx + 1}`,
                    type: z.type,
                    // If normalized (0-1), we need to scale back to 640x480 for the canvas
                    // For now, let's assume they might be normalized or absolute
                    points: rawPoints.map(p => {
                        const x = p[0] <= 1 ? p[0] * 640 : p[0];
                        const y = p[1] <= 1 ? p[1] * 480 : p[1];
                        return { x, y };
                    })
                };
            });
            setZones(formatted);
        } else {
            setZones([]);
        }
    }, [initialZones, setZones]);

    // Auto-update parent when zones change
    useEffect(() => {
        if (onROIChange) {
            onROIChange(getBackendPolygons());
        }
    }, [zones, onROIChange]);

    // Cleanup: Clear all zones and alerts when stream stops
    useEffect(() => {
        if (!isStreaming) {
            // clearAll(); // Don't clear if we want to see them while offline
            setActiveZoneId(null);
            setIsDrawing(false);
        }
    }, [isStreaming, setActiveZoneId, setIsDrawing]);

    const handleMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDrawing) {
            addPoint(x, y);
        } else {
            const hit = startDragging(x, y);
            if (!hit) setActiveZoneId(null);
        }
    };

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleDrag(x, y);
    };

    const handleMouseUp = () => {
        stopDragging();
    };

    return (
        <div className="flex flex-col gap-4">
            <style jsx="true">{`
                @keyframes pulse-red {
                    0% { box-shadow: inset 0 0 0 0px rgba(239, 68, 68, 0.7); border-color: transparent; }
                    50% { box-shadow: inset 0 0 0 10px rgba(239, 68, 68, 0.7); border-color: rgba(239, 68, 68, 1); }
                    100% { box-shadow: inset 0 0 0 0px rgba(239, 68, 68, 0.7); border-color: transparent; }
                }
                .alert-pulse {
                    animation: pulse-red 0.8s infinite;
                }
            `}</style>

            <div className={`relative bg-black rounded-xl overflow-hidden shadow-2xl group flex items-center justify-center min-h-[480px] transition-all duration-300 border-4 ${isAlertActive ? 'alert-pulse' : 'border-transparent'}`}>
                {/* 1. Feed Container */}
                {streamUrl ? (
                    <div className="relative">
                        <img
                            ref={videoRef}
                            src={streamUrl}
                            alt="Live Stream"
                            className="max-h-[70vh] w-auto object-contain select-none shadow-sm"
                        />
                        {/* 2. ROI Overlay - Exactly matches image dimensions */}
                        <canvas
                            ref={canvasRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            className={`absolute inset-0 w-full h-full z-20 
                                        ${isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
                            style={{ pointerEvents: isStreaming ? 'auto' : 'none' }}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-zinc-500">
                        <PenTool size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium">Stream Offline</p>
                    </div>
                )}

                {/* Camera Error / Signal Loss Overlay */}
                {errorMessage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-6 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                            <AlertTriangle className="text-red-500 animate-bounce" size={32} />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1 uppercase tracking-tighter">SIGNAL INTERRUPTED</h3>
                        <p className="text-red-400 text-sm max-w-[280px] leading-relaxed font-medium">
                            {errorMessage}
                        </p>
                        <p className="text-zinc-500 text-[10px] mt-4 uppercase tracking-[0.2em] font-black">
                            Auto-Reconnect Sentry Active
                        </p>
                    </div>
                )}

                {/* Alert Label */}
                {isAlertActive && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-black shadow-2xl z-40 animate-pulse flex items-center gap-2 border-2 border-white/50">
                        <AlertTriangle size={20} className="animate-bounce" />
                        CRITICAL SAFETY ALERT
                    </div>
                )}

                {/* Instruction Overlay */}
                {isDrawing && points.length === 0 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-30 animate-bounce">
                        Click on video to start drawing
                    </div>
                )}
            </div>

            {/* 3. ROI Toolbelt & Stream Quality */}
            {isStreaming && (
                <div className="flex flex-wrap gap-3 items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <div className="flex gap-2">
                        {!isDrawing ? (
                            <>
                                <Button variant="primary" size="sm" onClick={() => setIsDrawing(true)}>
                                    <Plus size={16} className="mr-2" /> Create New Area
                                </Button>
                                {onSaveROI && (
                                    <Button variant="outline" size="sm" className="bg-white border-zinc-200" onClick={() => onSaveROI(getBackendPolygons())}>
                                        Save Rules
                                    </Button>
                                )}
                            </>
                        ) : (
                            <div className="flex gap-2 items-center bg-white p-1 rounded-lg border border-zinc-200 shadow-sm animate-in slide-in-from-left-2">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 px-3">Finish Area:</span>
                                <Button size="sm" variant="success" onClick={() => finishZone('ppe')} disabled={points.length < 3}>
                                    <Shield size={16} className="mr-2" /> PPE Zone
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => finishZone('danger')} disabled={points.length < 3}>
                                    <AlertTriangle size={16} className="mr-2" /> Danger Zone
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsDrawing(false)}>Cancel</Button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* Stream Quality Selector */}
                        <div className="flex bg-zinc-200/50 p-1 rounded-lg gap-1 border border-zinc-200">
                            <button
                                onClick={() => onQualityChange?.('sd')}
                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all ${quality === 'sd' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                Standard (SD)
                            </button>
                            <button
                                onClick={() => onQualityChange?.('hd')}
                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-1 ${quality === 'hd' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                {quality === 'hd' && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                                High Def (HD)
                            </button>
                        </div>

                        <div className="h-6 w-[1px] bg-zinc-200" />

                        {/* Live AI Detection Toggle */}
                        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-700 shadow-xl">
                            <div className={`w-2 h-2 rounded-full ${detectionsEnabled ? 'bg-blue-400 animate-pulse' : 'bg-zinc-600'}`} />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Live AI</span>
                            <button
                                onClick={() => onDetectionsToggle?.(!detectionsEnabled)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${detectionsEnabled ? 'bg-blue-600' : 'bg-zinc-700'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${detectionsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="h-6 w-[1px] bg-zinc-200" />

                        {/* GDPR Privacy Mode Toggle */}
                        <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-200">
                            <div className={`w-2 h-2 rounded-full ${privacyMode ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`} />
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Privacy (GDPR)</span>
                            <button
                                onClick={() => onPrivacyChange?.(!privacyMode)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${privacyMode ? 'bg-green-600' : 'bg-zinc-300'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${privacyMode ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {activeZoneId && (
                            <Button size="sm" variant="ghost" onClick={deleteActiveZone} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 size={16} className="mr-2" /> Delete Selected
                            </Button>
                        )}
                        <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                            {zones.length} Zones
                        </span>
                        <Button size="sm" variant="ghost" onClick={clearAll} className="text-zinc-500">Clear All</Button>
                    </div>
                </div>
            )}

            {/* Zone Summary Labels */}
            {zones.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Active Monitoring Sites</p>
                    <div className="flex flex-wrap gap-2">
                        {zones.map(zone => (
                            <div
                                key={zone.id}
                                onClick={() => setActiveZoneId(zone.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border
                                        ${activeZoneId === zone.id ? 'ring-2 ring-blue-500 ring-offset-2 border-transparent' : ''}
                                        ${zone.type === 'danger' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                                        'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}
                            >
                                {zone.type === 'danger' ? <AlertTriangle size={12} /> : <Shield size={12} />}
                                {zone.name}
                                <span className="opacity-40 text-[10px]">({zone.points.length} pts)</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
