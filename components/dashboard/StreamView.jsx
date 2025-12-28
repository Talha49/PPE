import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useROI } from '@/hooks/useROI';
import { Shield, AlertTriangle, Trash2, Plus, PenTool } from 'lucide-react';

export default function StreamView({ streamUrl, isStreaming, onROIChange, isAlertActive }) {
    const canvasRef = useRef(null);
    const videoRef = useRef(null);

    const {
        zones, points, isDrawing, setIsDrawing, activeZoneId, setActiveZoneId,
        addPoint, finishZone, startDragging, handleDrag, stopDragging,
        deleteActiveZone, getBackendPolygons, clearAll
    } = useROI(canvasRef, videoRef);

    // Auto-update parent when zones change
    useEffect(() => {
        if (onROIChange) {
            onROIChange(getBackendPolygons());
        }
    }, [zones, onROIChange]);

    // Cleanup: Clear all zones and alerts when stream stops
    useEffect(() => {
        if (!isStreaming) {
            clearAll();
            setActiveZoneId(null);
            setIsDrawing(false);
        }
    }, [isStreaming, clearAll, setActiveZoneId, setIsDrawing]);

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

            {/* 3. ROI Toolbelt */}
            {isStreaming && (
                <div className="flex flex-wrap gap-3 items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <div className="flex gap-2">
                        {!isDrawing ? (
                            <Button variant="primary" size="sm" onClick={() => setIsDrawing(true)}>
                                <Plus size={16} className="mr-2" /> Create New Area
                            </Button>
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

                    <div className="flex gap-2 items-center">
                        {activeZoneId && (
                            <Button size="sm" variant="ghost" onClick={deleteActiveZone} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 size={16} className="mr-2" /> Delete Selected
                            </Button>
                        )}
                        <span className="text-xs text-zinc-400 font-medium px-2 border-l border-zinc-200">
                            {zones.length} Zones Total
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
