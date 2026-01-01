import { useState, useRef, useEffect, useCallback } from 'react';

export function useROI(canvasRef, videoRef) {
    const [zones, setZones] = useState([]); // Array of { id, points, type, name }
    const [activeZoneId, setActiveZoneId] = useState(null);
    const [points, setPoints] = useState([]); // For drawing a NEW polygon
    const [isDrawing, setIsDrawing] = useState(false);
    
    // Dragging state
    const [draggingPoint, setDraggingPoint] = useState(null); // { zoneId, pointIndex }

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Existing Polygons
        zones.forEach(zone => {
            const isSelected = activeZoneId === zone.id;
            
            // Color based on type
            let color = '#f59e0b'; // Amber (Standard)
            if (zone.type === 'danger') color = '#ef4444'; // Red
            if (zone.type === 'safe') color = '#22c55e'; // Green

            ctx.strokeStyle = color;
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.fillStyle = zone.type === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(242, 158, 11, 0.1)';

            ctx.beginPath();
            zone.points.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            // Draw Vertices if selected
            if (isSelected) {
                zone.points.forEach((p, i) => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.stroke();
                });
            }
        });

        // 2. Draw Active (In-progress) Points
        if (isDrawing && points.length > 0) {
            ctx.strokeStyle = '#6366f1'; // Indigo
            ctx.lineWidth = 2;
            ctx.beginPath();
            points.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#6366f1';
                ctx.fill();
            });
        }
    }, [points, zones, isDrawing, activeZoneId, canvasRef]);

    // Sync canvas internal resolution with its display size
    useEffect(() => {
        const syncResolution = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                draw(); // Redraw immediately
            }
        };

        syncResolution();
        window.addEventListener('resize', syncResolution);
        return () => window.removeEventListener('resize', syncResolution);
    }, [draw]);

    useEffect(() => {
        draw();
    }, [draw]);

    const addPoint = (x, y) => {
        if (!isDrawing) return;
        setPoints(prev => [...prev, { x, y }]);
    };

    const finishZone = (type = 'ppe', name = 'Zone') => {
        if (points.length < 3) return;
        const newZone = {
            id: Date.now(),
            points: [...points],
            type,
            name: `${name} ${zones.length + 1}`
        };
        setZones(prev => [...prev, newZone]);
        setPoints([]);
        setIsDrawing(false);
        setActiveZoneId(newZone.id);
    };

    const startDragging = (x, y) => {
        // Hit test for vertices
        for (const zone of zones) {
            for (let i = 0; i < zone.points.length; i++) {
                const p = zone.points[i];
                const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
                if (dist < 10) {
                    setDraggingPoint({ zoneId: zone.id, pointIndex: i });
                    setActiveZoneId(zone.id);
                    return true;
                }
            }
        }
        return false;
    };

    const handleDrag = (x, y) => {
        if (!draggingPoint) return;
        setZones(prev => prev.map(zone => {
            if (zone.id === draggingPoint.zoneId) {
                const newPoints = [...zone.points];
                newPoints[draggingPoint.pointIndex] = { x, y };
                return { ...zone, points: newPoints };
            }
            return zone;
        }));
    };

    const stopDragging = () => {
        setDraggingPoint(null);
    };

    const deleteActiveZone = () => {
        setZones(prev => prev.filter(z => z.id !== activeZoneId));
        setActiveZoneId(null);
    };

    const getBackendPolygons = () => {
        const canvas = canvasRef.current;
        if (!canvas) return [];
        
        const width = canvas.width;
        const height = canvas.height;

        return zones.map(zone => ({
            id: zone.id,
            name: zone.name,
            type: zone.type,
            // Send normalized coordinates (0 to 1) for full robustness
            polygon: zone.points.map(p => [
                parseFloat((p.x / width).toFixed(4)), 
                parseFloat((p.y / height).toFixed(4))
            ])
        }));
    };

    return {
        zones,
        setZones,
        points,
        isDrawing,
        activeZoneId,
        setActiveZoneId,
        setIsDrawing,
        addPoint,
        finishZone,
        startDragging,
        handleDrag,
        stopDragging,
        deleteActiveZone,
        getBackendPolygons,
        clearAll: () => setZones([])
    };
}
