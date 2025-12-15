import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useROI } from '@/hooks/useROI';
import { Eye, Trash2, CheckCircle } from 'lucide-react';

export default function StreamView({ streamUrl, isStreaming, onROIChange }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const {
        isDrawing,
        setIsDrawing,
        addPoint,
        finishPolygon,
        clearROI,
        getBackendPolygon,
        polygon,
        draw // force redraw
    } = useROI(canvasRef, videoRef);

    // Resize observer to keep canvas matched to video size
    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const resizeCanvas = () => {
            const vid = videoRef.current;
            const cvs = canvasRef.current;
            if (vid && cvs) {
                cvs.width = vid.clientWidth;
                cvs.height = vid.clientHeight;
                draw();
            }
        };

        // Initial resize
        setTimeout(resizeCanvas, 500); // Small delay for layout
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [draw]);

    const handleCanvasClick = (e) => {
        if (!isDrawing) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addPoint(x, y);
    };

    const handleFinish = () => {
        const poly = finishPolygon();
        if (poly) {
            const backendPoly = getBackendPolygon();
            onROIChange(backendPoly);
        }
    };

    const handleClear = () => {
        clearROI();
        onROIChange(null); // Send clear to backend
    };

    return (
        <div className="relative w-full bg-black rounded-lg overflow-hidden border border-slate-800 shadow-inner group flex flex-col items-center">
            {/* Container for Video + Canvas to ensure overlap */}
            <div className="relative w-full aspect-video">
                {/* Video Feed */}
                {streamUrl ? (
                    <img
                        ref={videoRef}
                        src={streamUrl}
                        alt="Live Stream"
                        className="absolute inset-0 w-full h-full object-contain z-0"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 backdrop-blur-sm z-0">
                        <div className="h-16 w-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center animate-pulse">
                            <div className="h-3 w-3 bg-red-500 rounded-full" />
                        </div>
                        <p className="font-medium animate-pulse">Waiting for Stream ({isStreaming ? 'Connected' : 'Offline'})...</p>
                    </div>
                )}

                {/* ROI Overlay Canvas */}
                <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 z-10 w-full h-full ${isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
                    onClick={handleCanvasClick}
                    onDoubleClick={handleFinish}
                />
            </div>

            {/* ROI Controls Overlay - Only show when streaming */}
            {isStreaming && (
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    {(!isDrawing && !polygon) && (
                        <Button size="sm" variant="secondary" onClick={() => setIsDrawing(true)} className="backdrop-blur-md bg-black/50 border-slate-700">
                            <Eye className="mr-2 h-4 w-4" /> Draw ROI
                        </Button>
                    )}

                    {isDrawing && (
                        <Button size="sm" variant="primary" onClick={handleFinish} className="animate-pulse">
                            <CheckCircle className="mr-2 h-4 w-4" /> Finish (DbClick)
                        </Button>
                    )}

                    {polygon && (
                        <Button size="sm" variant="destructive" onClick={handleClear} className="backdrop-blur-md bg-red-900/50">
                            <Trash2 className="mr-2 h-4 w-4" /> Clear ROI
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
