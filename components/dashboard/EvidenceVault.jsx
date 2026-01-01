'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Camera, Calendar, MapPin, Eye, Trash2, Loader2, ShieldAlert } from 'lucide-react';

export default function EvidenceVault({ siteId = null }) {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIncidents = async () => {
            setLoading(true);
            try {
                const url = siteId ? `/api/dashboard/analytics?siteId=${siteId}` : '/api/dashboard/analytics';
                const res = await fetch(url);
                const result = await res.json();
                setIncidents(result.recentIncidents || []);
            } catch (error) {
                console.error("Failed to fetch incidents:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchIncidents();
    }, [siteId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="animate-spin text-zinc-300 mb-4" size={48} />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Accessing Secure Vault...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Safety Evidence Vault</h2>
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">Searchable visual history of site violations</p>
                </div>
            </div>

            {incidents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {incidents.map((incident, idx) => (
                        <Card key={idx} className="group rounded-[40px] border-zinc-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
                            <div className="aspect-video relative overflow-hidden bg-zinc-200">
                                <img 
                                    src={incident.snapshot} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt="Violation Proof"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute top-4 left-4">
                                    <Badge variant="destructive" className="font-black px-4 py-1.5 shadow-xl border-2 border-white rounded-xl uppercase text-[10px] tracking-widest">
                                        {incident.object}
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-zinc-900 font-black uppercase text-sm tracking-tight">
                                            <MapPin size={14} className="text-indigo-600" />
                                            {incident.zone}
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
                                            <Calendar size={12} />
                                            {new Date(incident.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-zinc-900 bg-zinc-50 px-3 py-1 rounded-lg border border-zinc-100">
                                        {incident.duration}s
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="primary" className="flex-1 rounded-2xl bg-zinc-900 hover:bg-black font-black text-xs uppercase tracking-widest shadow-lg shadow-zinc-200">
                                        Open Record
                                    </Button>
                                    <Button variant="ghost" className="rounded-2xl border border-zinc-100 px-4">
                                        <Trash2 size={16} className="text-zinc-400 hover:text-rose-600" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
            ))}
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
            <ShieldAlert size={64} className="text-zinc-200 mb-6" />
            <h3 className="text-xl font-bold text-zinc-900">Vault is Empty</h3>
            <p className="text-zinc-500 max-w-xs text-center mt-2">No safety incidents have been archived yet. Start live monitoring to begin capturing evidence.</p>
        </div>
    )
}
        </div >
    );
}
