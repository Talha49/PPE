import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Download, Table as TableIcon, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DetectionTable({ detections = [], onLogsUpdate }) {
    const [logs, setLogs] = useState([]);
    const lastLoggedRef = useRef(new Map()); // Map<key, timestamp>
    const COOLDOWN = 5000; // 5 seconds

    useEffect(() => {
        if (!detections || detections.length === 0) return;

        let hasNew = false;
        detections.forEach(d => {
            if (d.id === undefined || d.id === -1) return;

            const status = d.compliance_status || (d.class_name.includes('NO-') ? 'VIOLATION' : 'OK');
            const zone = d.zone_name || 'Global';
            const key = `${d.id}-${status}-${zone}`;
            const now = Date.now();

            if (lastLoggedRef.current.has(key)) {
                const lastTime = lastLoggedRef.current.get(key);
                if (now - lastTime < COOLDOWN) return;
            }

            lastLoggedRef.current.set(key, now);
            hasNew = true;

            const newEntry = {
                id: d.id,
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                object: d.class_name,
                conf: d.conf,
                status: status,
                zone: zone
            };

            setLogs(prev => {
                const updated = [newEntry, ...prev].slice(0, 50); // Keep more for export
                if (onLogsUpdate) onLogsUpdate(updated);
                return updated;
            });
        });
    }, [detections, onLogsUpdate]);

    const exportToCSV = () => {
        if (logs.length === 0) return alert("No logs to export yet!");

        const headers = ["Date", "Time", "ID", "Object", "Confidence", "Zone", "Status"];
        const rows = logs.map(l => [
            l.date, l.time, `#${l.id}`, l.object, `${(l.conf * 100).toFixed(0)}%`, l.zone, l.status
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `ppe_safety_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full h-full flex flex-col rounded-lg border border-zinc-200 bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-200">
                <div className="flex items-center gap-2 text-zinc-600 font-semibold">
                    <TableIcon size={18} />
                    <span>Real-time Event Logs</span>
                </div>
                <Button size="sm" variant="secondary" onClick={exportToCSV} disabled={logs.length === 0} className="h-8">
                    <Download size={14} className="mr-2" /> Export CSV
                </Button>
            </div>
            <div className="overflow-auto max-h-96">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 sticky top-0 z-10 text-[10px] uppercase text-zinc-400 font-bold tracking-widest border-b border-zinc-100">
                        <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Object</th>
                            <th className="px-4 py-3">Zone</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {logs.map((row, i) => (
                            <TableRow key={`${row.id}-${row.time}`} data={row} />
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-zinc-300">
                                        <Activity size={32} className="opacity-20" />
                                        <p className="text-xs font-medium">Monitoring site... Waiting for events</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
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
