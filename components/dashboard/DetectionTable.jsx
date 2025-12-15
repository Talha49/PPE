import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';

export default function DetectionTable({ detections = [] }) {
    const [logs, setLogs] = useState([]);
    const lastLoggedRef = useRef(new Map()); // Map<key, timestamp>
    const COOLDOWN = 5000; // 5 seconds

    useEffect(() => {
        if (!detections || detections.length === 0) return;

        detections.forEach(d => {
            // Backend sends 'id', not 'track_id'. And it might be -1 if not tracked well.
            if (d.id === undefined || d.id === -1) return;

            // Determine Status
            const status = d.compliance_status || (d.class_name.includes('NO-') ? 'VIOLATION' : 'OK');
            const key = `${d.id}-${status}`;
            const now = Date.now();

            // Check cooldown to avoid spamming the table
            if (lastLoggedRef.current.has(key)) {
                const lastTime = lastLoggedRef.current.get(key);
                if (now - lastTime < COOLDOWN) return;
            }

            // Add to log
            lastLoggedRef.current.set(key, now);

            const newEntry = {
                id: d.id,
                time: new Date().toLocaleTimeString(),
                object: d.class_name,
                conf: d.conf,
                status: status
            };

            setLogs(prev => [newEntry, ...prev].slice(0, 15)); // Keep last 15
        });
    }, [detections]);

    return (
        <div className="w-full h-full overflow-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-sm text-left">
                <thead className="bg-zinc-100 sticky top-0 z-10 text-xs uppercase text-zinc-500 font-semibold tracking-wider">
                    <tr>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Object</th>
                        <th className="px-4 py-3">Conf</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">ID</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {logs.map((row, i) => (
                        <TableRow key={i} data={row} />
                    ))}
                    {logs.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-zinc-400 italic">
                                Waiting for detections...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function TableRow({ data }) {
    const { time, object, conf, status, id } = data;

    const isViolation = status?.includes('VIOLATION') || object.includes('NO-');

    return (
        <tr className="hover:bg-zinc-50 transition-colors group animate-in fade-in slide-in-from-top-1 duration-300">
            <td className="px-4 py-2 font-mono text-zinc-500">{time}</td>
            <td className="px-4 py-2 font-medium text-zinc-900">{object}</td>
            <td className="px-4 py-2 text-zinc-500">{(conf * 100).toFixed(0)}%</td>
            <td className="px-4 py-2">
                <Badge variant={isViolation ? 'destructive' : 'success'}>
                    {status || 'OK'}
                </Badge>
            </td>
            <td className="px-4 py-2 font-mono text-zinc-400">#{id}</td>
        </tr>
    );
}
