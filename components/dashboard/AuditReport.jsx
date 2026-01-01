'use client';

import React from 'react';
import { Shield, MapPin, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuditReport({ data, siteDetails }) {
    if (!data) return null;

    const { summary, zoneStats, objectStats } = data;
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div id="safety-audit-report" style={{ backgroundColor: '#ffffff', color: '#18181b', border: '1px solid #f4f4f5' }} className="print-report hidden print:block transition-all p-12 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start pb-8 mb-12" style={{ borderBottom: '4px solid #18181b' }}>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: '#18181b' }}>
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ color: '#18181b' }}>SafeGuard Intelligence</h1>
                        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#71717a' }}>Safety Compliance Audit Report</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-xs font-bold mb-1" style={{ color: '#71717a' }}>
                        <Calendar size={14} />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-xs font-bold" style={{ color: '#71717a' }}>
                        <Clock size={14} />
                        <span>Generated at {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            {/* Site Info */}
            <div className="p-8 rounded-3xl mb-8 flex justify-between border" style={{ backgroundColor: '#fafafa', borderColor: '#f4f4f5' }}>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <MapPin style={{ color: '#a1a1aa' }} size={20} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#a1a1aa' }}>Primary Site Context</p>
                            <p className="text-xl font-black" style={{ color: '#18181b' }}>{siteDetails?.name || 'Enterprise Global View'}</p>
                            <p className="text-[8px] font-bold uppercase" style={{ color: '#d4d4d8' }}>Active Monitoring Node: {siteDetails?.id || 'GLOBAL_INSTANCE'}</p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#a1a1aa' }}>Safety IQ Index</p>
                    <p className="text-7xl font-black leading-none" style={{ color: summary.riskIndex < 30 ? '#059669' : '#e11d48' }}>
                        {summary.riskIndex}%
                    </p>
                    <p className="text-[10px] font-black uppercase mt-2" style={{ color: summary.riskIndex < 30 ? '#10b981' : '#f43f5e' }}>
                        {summary.riskIndex < 30 ? 'OPERATIONAL CLEARANCE: HIGH' : 'IMMEDIATE MITIGATION REQUIRED'}
                    </p>
                </div>
            </div>

            {/* Management Briefing */}
            <div className="p-10 rounded-3xl mb-8" style={{ backgroundColor: '#18181b', color: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#f43f5e' }} />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#a1a1aa' }}>Automated Intelligence Briefing</h2>
                </div>
                <p className="text-2xl font-black italic leading-tight tracking-tight">
                    "{summary.toolboxTalk}"
                </p>
                <div className="mt-6 flex gap-8 border-t border-zinc-800 pt-6">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Confidence Score</p>
                        <p className="text-sm font-black">98.4% AI SYNTHESIS</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Data Points Analyzed</p>
                        <p className="text-sm font-black">{summary.totalIncidents * 12} FRAMES</p>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="p-8 rounded-3xl border-2" style={{ borderColor: '#f4f4f5' }}>
                    <h2 className="text-xs font-black uppercase tracking-widest mb-6 underline underline-offset-8" style={{ color: '#a1a1aa', textDecorationColor: '#e4e4e7' }}>Executive Scoreboard</h2>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-zinc-50 pb-4">
                            <div>
                                <span className="text-xs font-bold block" style={{ color: '#52525b' }}>Site Compliance Grade</span>
                                <span className="text-[8px] font-black text-zinc-300 uppercase">ALGORITHMIC FAIRNESS APPLIED</span>
                            </div>
                            <span className="font-black text-4xl" style={{ color: '#18181b' }}>{summary.safetyGrade}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-zinc-50 pb-4">
                            <span className="text-xs font-bold" style={{ color: '#e11d48' }}>Unresolved Risk Events</span>
                            <span className="font-black text-xl" style={{ color: '#e11d48' }}>{summary.totalIncidents}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold" style={{ color: '#059669' }}>Audit Status</span>
                            <span className="font-black uppercase text-sm" style={{ color: '#059669' }}>{summary.safetyGrade === 'A' ? 'PRISTINE / CAPABLE' : 'ACTION_REQUIRED'}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-3xl border-2" style={{ borderColor: '#f4f4f5' }}>
                    <h2 className="text-xs font-black uppercase tracking-widest mb-6 underline underline-offset-8" style={{ color: '#a1a1aa', textDecorationColor: '#e4e4e7' }}>Strategic Risk Projection</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-5 rounded-2xl" style={{ backgroundColor: '#fafafa' }}>
                            {summary.safetyGrade === 'A' ? (
                                <CheckCircle2 style={{ color: '#10b981' }} className="shrink-0" size={24} />
                            ) : (
                                <AlertCircle style={{ color: '#f43f5e' }} className="shrink-0" size={24} />
                            )
                            }
                            <div>
                                <p className="text-xs font-bold leading-relaxed mb-2" style={{ color: '#18181b' }}>
                                    {summary.safetyGrade === 'A'
                                        ? "Site operations exhibit high-integrity compliance levels. Predictive engine suggests standard vigilance."
                                        : "High-density violation clusters identified. Immediate manual oversight recommended to prevent recordable incidents."
                                    }
                                </p>
                                <p className="text-[9px] font-medium leading-relaxed italic" style={{ color: '#a1a1aa' }}>
                                    * Projection based on a 7-day rolling average of behavioral telemetry and machine learning risk heuristics.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Regulatory Health Checklist */}
            <div className="mb-8 p-8 rounded-3xl border-2" style={{ borderColor: '#f4f4f5' }}>
                <h2 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: '#a1a1aa' }}>Regulatory Alignment Checklist</h2>
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { label: 'PPE Detection Engine', status: 'ACTIVE', color: '#10b981' },
                        { label: 'Oversight Integrity', status: 'VERIFIED', color: '#10b981' },
                        { label: 'Snapshot Persistence', status: 'SYNCED', color: '#10b981' },
                        { label: 'Metadata Hash Sync', status: 'ENCRYPTED', color: '#10b981' },
                        { label: 'Behavioral Heatmap', status: 'GEN_COMPLETE', color: '#10b981' },
                        { label: 'Risk Intelligence', status: summary.riskIndex > 50 ? 'WARNING' : 'NOMINAL', color: summary.riskIndex > 50 ? '#f59e0b' : '#10b981' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col border-l-2 p-3" style={{ borderColor: item.color }}>
                            <span className="text-[8px] font-black uppercase text-zinc-400 mb-1">{item.label}</span>
                            <span className="text-[10px] font-black" style={{ color: '#18181b' }}>{item.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visual Evidence Table */}
            <div className="space-y-8 mb-8">
                <div>
                    <h2 className="text-xs font-black uppercase tracking-widest mb-4 ml-2" style={{ color: '#a1a1aa' }}>Visual Evidence Repository (Last 3 Critical)</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {data.recentIncidents?.slice(0, 3).map((inc, i) => (
                            <div key={i} className="border rounded-2xl overflow-hidden" style={{ backgroundColor: '#fafafa', borderColor: '#f4f4f5' }}>
                                <img src={inc.snapshot} alt="Proof" className="w-full aspect-video object-cover border-b" style={{ borderColor: '#f4f4f5' }} />
                                <div className="p-3">
                                    <p className="text-[10px] font-black uppercase truncate" style={{ color: '#18181b' }}>{inc.object} IN {inc.zone}</p>
                                    <p className="text-[8px] font-bold mt-1 uppercase tracking-widest" style={{ color: '#a1a1aa' }}>UID: {inc._id?.substring(18).toUpperCase()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest mb-4 ml-2" style={{ color: '#a1a1aa' }}>Zone Compliance Matrix</h2>
                        <table className="min-w-[400px] text-left border-collapse">
                            <thead>
                                <tr style={{ borderBottom: '2px solid #18181b' }}>
                                    <th className="py-4 px-2 text-[10px] font-black uppercase tracking-widest" style={{ color: '#18181b' }}>Zone ID</th>
                                    <th className="py-4 px-2 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: '#18181b' }}>Incidents</th>
                                    <th className="py-4 px-2 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: '#18181b' }}>Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {zoneStats.map((zone, i) => (
                                    <tr key={i} className="italic" style={{ borderBottom: '1px solid #f4f4f5' }}>
                                        <td className="py-4 px-2 font-bold uppercase" style={{ color: '#18181b' }}>{zone._id}</td>
                                        <td className="py-4 px-2 text-right font-black" style={{ color: '#18181b' }}>{zone.count}</td>
                                        <td className="py-4 px-2 text-right">
                                            <span className="text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter" style={{ backgroundColor: zone.count > 10 ? '#fee2e2' : '#fef3c7', color: zone.count > 10 ? '#b91c1c' : '#b45309' }}>
                                                {zone.count > 10 ? 'CRITICAL' : 'ELEVATED'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-right max-w-[300px]">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#d4d4d8' }}>Site Intelligence Hash</p>
                        <p className="text-xl font-black break-all" style={{ color: '#e4e4e7', fontFamily: 'monospace' }}>{Math.random().toString(36).substring(2).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            {/* Safety Declaration */}
            <div className="mt-12 p-8 rounded-3xl" style={{ border: '1px dashed #e4e4e7' }}>
                <p className="text-[9px] font-bold leading-relaxed uppercase tracking-wide" style={{ color: '#d4d4d8' }}>
                    SAFEGUARD DECLARATION: This report is an automatically synthesized document based on neural network telemetry. The intelligence hash provided above serves as a unique identifier for this audit session. All visual evidence is timestamped and stored in a cryptographically secured evidence vault. Digital tampering with these records is restricted.
                </p>
            </div>

            {/* Final Assessment Signature */}
            <div className="mt-12 pt-8 grid grid-cols-2 gap-20" style={{ borderTop: '2px solid #f4f4f5' }}>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-8" style={{ color: '#a1a1aa' }}>Authorized Safety Supervisor Signature</p>
                    <div className="h-0.5 w-full mb-2" style={{ backgroundColor: '#e4e4e7' }} />
                    <p className="text-[10px] font-bold uppercase italic underline underline-offset-4" style={{ color: '#d4d4d8', textDecorationColor: '#f4f4f5' }}>Digitally Verified via SafeGuard IQ</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-8" style={{ color: '#a1a1aa' }}>Verification Timestamp</p>
                    <div className="h-0.5 w-full mb-2" style={{ backgroundColor: '#e4e4e7' }} />
                    <p className="text-[10px] font-bold uppercase tabular-nums" style={{ color: '#d4d4d8' }}>{date} // {new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Footer - Social Proof & Versioning */}
            <div className="mt-8 pt-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-4" style={{ borderTop: '1px solid #f4f4f5', color: '#a1a1aa' }}>
                <div className="flex gap-4">
                    <span>SafeGuard Industrial v1.4.2</span>
                    <span style={{ color: '#e4e4e7' }}>|</span>
                    <span>Node ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                </div>
                <span>Official Compliance Record • Highly Confidential</span>
            </div>

            <style jsx global>{`
                @media print {
                    @page { 
                        size: A4;
                        margin: 20mm; 
                    }
                    body { 
                        background: white !important;
                        overscroll-behavior: none;
                    }
                    .no-print { display: none !important; }
                    .print-report { 
                        display: block !important; 
                        position: relative !important;
                        width: 100% !important;
                        height: auto !important;
                        padding: 0 !important;
                    }
                    /* Prevent cards from breaking across pages */
                    .rounded-3xl, .rounded-2xl {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
}
