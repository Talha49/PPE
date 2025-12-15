import { useState, useRef, useEffect, useCallback } from 'react';

export function useROI(canvasRef, videoRef) {
    const [points, setPoints] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [polygon, setPolygon] = useState(null); // Completed polygon

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Drawing Style
        ctx.strokeStyle = '#f59e0b'; // Amber-500
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';

        // Draw active points
        const activePoints = points.length > 0 ? points : (polygon || []);

        if (activePoints.length === 0) return;

        ctx.beginPath();
        ctx.moveTo(activePoints[0].x, activePoints[0].y);

        activePoints.forEach((p, i) => {
            if (i > 0) ctx.lineTo(p.x, p.y);
            // Draw vertext circles
            // ctx.fillRect(p.x - 2, p.y - 2, 4, 4); 
        });

        if (polygon) {
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        } else {
            ctx.stroke();
            // Draw little circles for vertices
             activePoints.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#f59e0b';
                ctx.fill();
             });
        }
    }, [points, polygon]);

    // Re-draw whenever points change
    useEffect(() => {
        draw();
    }, [draw]);

    const addPoint = (x, y) => {
        if (!isDrawing && !polygon) return; // Must be in drawing mode or fresh
        if (polygon) return; // Already finished

        // Add point in Canvas Coordinates
        setPoints(prev => [...prev, { x, y }]);
    };

    const finishPolygon = () => {
        if (points.length < 3) return;
        setPolygon(points);
        setPoints([]);
        setIsDrawing(false);
        return points; // Return canvas coords
    };

    const clearROI = () => {
        setPoints([]);
        setPolygon(null);
        setIsDrawing(true); // Reset to drawing mode if wanted
    };

    // Helper to get scaled points for Backend
    const getBackendPolygon = () => {
        if (!polygon || !canvasRef.current || !videoRef.current) return null;
        
        const canvas = canvasRef.current;
        const element = videoRef.current;
        
        // Handle both Video and Img tags
        const naturalWidth = element.naturalWidth || element.videoWidth || 640;
        const naturalHeight = element.naturalHeight || element.videoHeight || 480;

        const scaleX = naturalWidth / canvas.width;
        const scaleY = naturalHeight / canvas.height; 

        return polygon.map(p => ([
             p.x * scaleX,
             p.y * scaleY
        ]));
    };

    return {
        points,
        polygon, // Exposed state
        isDrawing,
        setIsDrawing,
        addPoint,
        finishPolygon,
        clearROI,
        getBackendPolygon,
        draw // Force draw
    };
}
