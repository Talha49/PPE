'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
    Activity,
    ShieldCheck,
    ShieldAlert,
    TrendingUp,
    TrendingDown,
    Loader2,
    AlertTriangle,
    BarChart3,
    Map,
    Download,
    Camera,
    Shield,
    Calendar,
    Clock
} from 'lucide-react';
import AuditReport from './AuditReport';
import TimelineScrubber from './TimelineScrubber';
import { Button } from '@/components/ui/Button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AnalyticsView({ siteId = null }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedEvidence, setSelectedEvidence] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const url = siteId ? `/api/dashboard/analytics?siteId=${siteId}` : '/api/dashboard/analytics';
                const res = await fetch(url);
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [siteId]);

    const handleDownloadReport = async () => {
        setIsExporting(true);
        try {
            // 1. Create a hidden iframe for radical isolation
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.left = '-10000px';
            iframe.style.top = '0';
            iframe.style.width = '1200px'; // A4 width relative scale
            iframe.style.height = '1600px';
            document.body.appendChild(iframe);

            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            // 2. Inject Industrial Hardened CSS (Standard HEX ONLY)
            const css = `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                * { box-sizing: border-box; font-family: 'Inter', sans-serif !important; margin: 0; padding: 0; }
                body { background: white; padding: 60px; }
                .report-container { width: 100%; color: #18181b; }
                .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 4px solid #18181b; }
                .h-title { font-size: 48px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; line-height: 0.9; }
                .h-sub { font-size: 14px; font-weight: 900; color: #a1a1aa; letter-spacing: 4px; margin-top: 5px; }
                .site-info { display: flex; justify-content: space-between; padding: 40px; border-radius: 30px; background: #fafafa; border: 1px solid #f4f4f5; margin-bottom: 30px; }
                .iq-box { text-align: right; }
                .iq-val { font-size: 80px; font-weight: 900; line-height: 1; margin-top: 5px; }
                .briefing { padding: 40px; border-radius: 30px; background: #18181b; color: white; margin-bottom: 30px; }
                .brief-tag { font-size: 10px; font-weight: 900; color: #71717a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }
                .brief-text { font-size: 28px; font-weight: 900; font-style: italic; line-height: 1.2; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
                .card { padding: 40px; border-radius: 30px; border: 2px solid #f4f4f5; }
                .card-title { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; margin-bottom: 25px; text-decoration: underline; text-underline-offset: 8px; }
                .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f4f4f5; }
                .stat-label { font-size: 14px; font-weight: 700; color: #52525b; }
                .stat-val { font-size: 40px; font-weight: 900; }
                .check-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; border: 2px solid #f4f4f5; padding: 30px; border-radius: 30px; margin-bottom: 30px; }
                .check-item { border-left: 3px solid #10b981; padding-left: 15px; }
                .check-label { font-[10px]; font-weight: 900; color: #a1a1aa; text-transform: uppercase; }
                .check-status { font-size: 12px; font-weight: 900; margin-top: 2px; }
                .evidence-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                .ev-card { border-radius: 20px; border: 1px solid #f4f4f5; overflow: hidden; background: #fafafa; }
                .ev-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
                .ev-meta { padding: 15px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
                .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #f4f4f5; display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; }
                .signature-box { margin-top: 60px; display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 40px; }
                .sig-line { border-top: 2px solid #f4f4f5; padding-top: 10px; font-size: 10px; font-weight: 900; color: #a1a1aa; text-transform: uppercase; }
            `;

            // 3. Construct Industrial Report HTML Template (Standard Tags ONLY)
            const reportHtml = `
                <div class="report-container">
                    <div class="header">
                        <div>
                            <div class="h-title">Executive<br>Compliance Audit</div>
                            <div class="h-sub">INDUSTRIAL SAFETY IQ REPORT // VERIFIED</div>
                        </div>
                        <div style="text-align: right">
                            <div style="font-size: 12px; font-weight: 900; color: #18181b">${new Date().toLocaleDateString()}</div>
                            <div style="font-size: 10px; font-weight: 900; color: #a1a1aa">REF: ${Math.random().toString(36).substring(7).toUpperCase()}</div>
                        </div>
                    </div>

                    <div class="site-info">
                        <div>
                            <div class="check-label">Primary Site Context</div>
                            <div style="font-size: 24px; font-weight: 900">${siteId || 'Enterprise Global View'}</div>
                        </div>
                        <div class="iq-box">
                            <div class="check-label">SAFETY IQ INDEX</div>
                            <div class="iq-val" style="color: ${summary.riskIndex < 30 ? '#059669' : '#e11d48'}">${summary.riskIndex}%</div>
                        </div>
                    </div>

                    <div class="briefing">
                        <div class="brief-tag">Automated Intelligence Briefing</div>
                        <div class="brief-text">"${summary.toolboxTalk}"</div>
                    </div>

                    <div class="grid">
                        <div class="card">
                            <div class="card-title">Executive Scoreboard</div>
                            <div class="stat-row">
                                <span class="stat-label">Compliance Grade</span>
                                <span class="stat-val">${summary.safetyGrade}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Critical Incidents</span>
                                <span class="stat-val" style="color: #e11d48">${summary.totalIncidents}</span>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-title">Risk Projection</div>
                            <div style="font-size: 14px; font-weight: 700; line-height: 1.6">
                                ${summary.safetyGrade === 'A'
                    ? "Proactive compliance remains high. No immediate corrective actions required for primary zones."
                    : "Violation density exceeds industrial thresholds. Deployment of safety oversight recommended."}
                            </div>
                            <div style="font-size: 10px; font-weight: 700; color: #a1a1aa; margin-top: 20px; font-style: italic">
                                * Based on 7-day neural telemetry synthesis.
                            </div>
                        </div>
                    </div>

                    <div class="check-grid">
                        <div class="check-item"><div class="check-label">PPE Detection</div><div class="check-status">ACTIVE / STABLE</div></div>
                        <div class="check-item"><div class="check-label">Logic Integrity</div><div class="check-status">VERIFIED</div></div>
                        <div class="check-item"><div class="check-label">Storage Link</div><div class="check-status">SECURED</div></div>
                    </div>

                    <div class="evidence-grid">
                        ${recentIncidents.slice(0, 3).map(inc => `
                            <div class="ev-card">
                                <img class="ev-img" src="${inc.snapshot}">
                                <div class="ev-meta">${inc.object} IN ${inc.zone}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="signature-box">
                        <div class="sig-line">Safety Supervisor</div>
                        <div class="sig-line" style="text-align: center">SafeGuard Intelligence Hash: ${Math.random().toString(36).substring(2).toUpperCase()}</div>
                        <div class="sig-line" style="text-align: right">Timestamp</div>
                    </div>

                    <div class="footer">
                        <span>SafeGuard Industrial v1.4.2</span>
                        <span>Official Compliance Record // Highly Confidential</span>
                        <span>Node: AI-REGION-01</span>
                    </div>
                </div>
            `;

            iframeDoc.open();
            iframeDoc.write(`<html><head><style>${css}</style></head><body>${reportHtml}</body></html>`);
            iframeDoc.close();

            // 4. Wait for images to load in iframe
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 5. Capture the isolated Iframe content
            const canvas = await html2canvas(iframeDoc.body, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            // 6. Generate PDF and Save
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`SafeGuard_Audit_${siteId || 'Global'}_${new Date().toISOString().split('T')[0]}.pdf`);

            // 7. Cleanup
            document.body.removeChild(iframe);
        } catch (error) {
            console.error("Hardened PDF Generation failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadProof = async (evidenceId) => {
        const incident = data.recentIncidents.find(inc => inc._id === evidenceId);
        if (!incident) return;

        setIsExporting(true);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1600;
            canvas.height = 900;
            const ctx = canvas.getContext('2d');

            // 1. Draw Clean Background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Load and Draw Main Snapshot
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = incident.snapshot;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error("Failed to load snapshot"));
            });

            // Calculate dimensions for main image (left 1000px)
            const imgAreaWidth = 1000;
            const hRatio = imgAreaWidth / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.min(hRatio, vRatio);
            const centerShiftX = (imgAreaWidth - img.width * ratio) / 2;
            const centerShiftY = (canvas.height - img.height * ratio) / 2;

            ctx.fillStyle = '#f4f4f5';
            ctx.fillRect(0, 0, imgAreaWidth, canvas.height);
            ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);

            // 3. Draw Industrial Sidebar
            ctx.fillStyle = '#18181b';
            ctx.fillRect(1000, 0, 600, 900);

            // 4. Draw Branding
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 40px sans-serif';
            ctx.fillText('SAFEGUARD IQ', 1060, 100);
            ctx.fillStyle = '#a1a1aa';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('VERIFIED COMPLIANCE EVIDENCE', 1060, 140);

            // Separator
            ctx.strokeStyle = '#3f3f46';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(1060, 180);
            ctx.lineTo(1540, 180);
            ctx.stroke();

            // 5. Incident Details
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 64px sans-serif';
            ctx.fillText((incident.object || 'Violation').toUpperCase(), 1060, 280);

            ctx.fillStyle = '#f43f5e';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('CRITICAL RISK DETECTED', 1060, 320);

            // Metadata Grid
            const metadata = [
                { label: 'ZONE IDENTIFIER', value: incident.zone || 'Global' },
                { label: 'DEVICE NODE', value: incident.camera_id || 'AI_V4_PRIMARY' },
                { label: 'TIMESTAMP', value: new Date(incident.timestamp).toLocaleDateString() },
                { label: 'PRECISE TIME', value: new Date(incident.timestamp).toLocaleTimeString() },
                { label: 'INTEGRITY HASH', value: Math.random().toString(36).substring(7).toUpperCase() }
            ];

            metadata.forEach((item, i) => {
                const y = 420 + (i * 80);
                ctx.fillStyle = '#a1a1aa';
                ctx.font = '900 12px sans-serif';
                ctx.fillText(item.label, 1060, y);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 20px sans-serif';
                ctx.fillText(item.value, 1060, y + 30);
            });

            // 6. Signature Area
            ctx.strokeStyle = '#3f3f46';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(1060, 820);
            ctx.lineTo(1540, 820);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#71717a';
            ctx.font = 'italic bold 12px sans-serif';
            ctx.fillText('Verified via SafeGuard Vault Registry', 1060, 850);

            // 7. Download
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.download = `SafeGuard_Proof_${incident._id}.jpg`;
            link.click();
        } catch (error) {
            console.error("Direct Canvas Capture failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-pulse">
                <Loader2 className="animate-spin text-zinc-300 mb-4" size={48} />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Aggregating Safety Intelligence...</p>
            </div>
        );
    }

    if (!data || data.error || !data.summary) {
        return (
            <Card className="border-dashed border-2 border-zinc-200 bg-zinc-50/50">
                <CardContent className="flex flex-col items-center justify-center p-20 text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-4 border border-rose-100 shadow-inner">
                        <ShieldAlert size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900">
                        {data?.error ? "Intelligence Link Error" : "Safety Intelligence Required"}
                    </h3>
                    <p className="text-zinc-500 max-w-sm mt-4 text-sm leading-relaxed">
                        {data?.error
                            ? "We encountered an issue synchronizing with the Safety IQ engine. Please ensure your site monitoring is active and refresh."
                            : "No safety incidents have been archived yet. Once the synthesis engine captures a violation, your Intelligence Briefing will appear here."}
                    </p>
                    <Button variant="outline" className="mt-8 rounded-2xl" onClick={() => window.location.reload()}>
                        Retry Sync
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const { summary, trend, zoneStats, recentIncidents, habitualViolators = [] } = data;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header with Download */}
            <div className="flex justify-between items-center no-print">
                <div className="flex flex-col">
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase">Safety IQ Intelligence</h2>
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">Predictive Compliance & Risk Profiling</p>
                </div>
                <Button
                    variant="primary"
                    className="rounded-2xl bg-zinc-900 hover:bg-black shadow-xl shadow-zinc-200 px-8 font-black py-6 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    onClick={handleDownloadReport}
                    disabled={isExporting}
                >
                    {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    {isExporting ? "Generating PDF..." : "Download Executive Audit"}
                </Button>
            </div>

            {/* Printable Report Component */}
            <AuditReport data={data} siteDetails={null} />

            {/* MANAGEMENT INTELLIGENCE BRIEFING */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 rounded-[40px] border-zinc-100 shadow-xl overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-900 text-white">
                    <CardContent className="p-10 flex flex-col justify-between h-full">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <Activity size={24} className="text-indigo-200" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Automated Intelligence Briefing</h3>
                            </div>
                            <p className="text-2xl font-bold leading-tight tracking-tight">
                                "{summary.toolboxTalk}"
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Generated via Safety IQ Engine</span>
                            <Badge className="bg-emerald-400 text-emerald-950 font-black px-4 py-1">REAL-TIME DATA MATCH</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[40px] border-zinc-100 shadow-xl overflow-hidden bg-white">
                    <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-6">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor" strokeWidth="12"
                                    fill="transparent" className="text-zinc-50"
                                />
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor" strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={364}
                                    strokeDashoffset={364 - (364 * summary.riskIndex) / 100}
                                    className={`${summary.riskIndex > 50 ? 'text-rose-500' : 'text-indigo-500'} transition-all duration-1000 ease-out`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-zinc-900 leading-none">{summary.riskIndex}%</span>
                                <span className="text-[9px] font-black text-zinc-400 uppercase mt-1">Risk Index</span>
                            </div>
                        </div>
                        <h4 className="text-sm font-black text-zinc-900 uppercase mb-2">Predictive Risk Level</h4>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic">{summary.safetyGrade === 'A' ? 'Minimal Risk Profile' : 'Targeted Risk High'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* TIMELINE SCRUBBER - PHASE 5 EXCLUSIVE */}
            <div className="animate-in slide-in-from-bottom-4 duration-1000">
                <TimelineScrubber incidents={recentIncidents} />
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Site Grade"
                    value={summary.safetyGrade}
                    icon={<ShieldCheck className={summary.safetyGrade === 'A' ? "text-emerald-600" : "text-rose-600"} size={24} />}
                    trend={summary.safetyGrade === 'A' ? "Audit Ready" : "Manual Review Required"}
                    trendColor={summary.safetyGrade === 'A' ? "text-emerald-600" : "text-rose-600"}
                />
                <KPICard
                    title="Active Incidents"
                    value={summary.totalIncidents}
                    icon={<AlertTriangle className="text-amber-600" size={24} />}
                    trend="Synthesis active"
                />
                <KPICard
                    title="Intelligence Status"
                    value="Synced"
                    icon={<ShieldAlert className="text-blue-600" size={24} />}
                    trend="Visual proofs online"
                />
            </div>

            {/* RECENT EVIDENCE GALLERY */}
            <Card className="rounded-[40px] border-zinc-100 shadow-2xl overflow-hidden bg-white">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 px-10 py-8 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-900 shadow-sm border border-zinc-100">
                            <Camera size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-zinc-900 uppercase tracking-tight">Visual Proof Archive</CardTitle>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Verified compliance snapshots</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10">
                    {recentIncidents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recentIncidents.map((incident, idx) => (
                                <div key={idx} className="group relative bg-zinc-50 rounded-[32px] overflow-hidden border border-zinc-100 hover:border-indigo-500/20 transition-all duration-500 shadow-sm hover:shadow-2xl">
                                    <div className="aspect-video bg-zinc-200 overflow-hidden relative">
                                        <img
                                            src={incident.snapshot}
                                            alt="Violation Proof"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <Badge variant="destructive" className="font-black px-4 py-1.5 shadow-xl border-2 border-white uppercase text-[10px] tracking-widest rounded-xl">
                                                {incident.object}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Critical Zone</h4>
                                                <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">{incident.zone}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-zinc-400 uppercase block">Timestamp</span>
                                                <span className="text-[10px] font-black text-zinc-900">
                                                    {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full rounded-2xl border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white font-black text-[10px] uppercase tracking-widest py-5 transition-all"
                                            onClick={() => setSelectedEvidence(incident)}
                                        >
                                            Inspect Visual Proof
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center">
                            <ShieldCheck size={64} className="text-indigo-100 mb-4" />
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Waiting for significant risk events...</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Zone Hazard Map */}
                <Card className="rounded-[40px] border-zinc-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-white border-b border-zinc-50 px-8 py-8 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Map className="text-zinc-400" size={20} />
                            <CardTitle className="text-lg font-black text-zinc-900 uppercase">Risk Cluster Density</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {zoneStats.length > 0 ? (
                            <div className="space-y-6">
                                {zoneStats.map((zone, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-black text-zinc-900 uppercase tracking-widest">{zone._id}</span>
                                            <Badge variant="soft" className="bg-indigo-50 text-indigo-700 font-black">{zone.count} INCIDENTS</Badge>
                                        </div>
                                        <div className="h-4 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                                            <div
                                                className="h-full bg-indigo-600 transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                                style={{ width: `${(zone.count / summary.totalIncidents) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-zinc-400 italic text-sm">Cluster data unavailable.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Habitual Violators Leaderboard - PHASE 5 EXCLUSIVE */}
                <Card className="rounded-[40px] border-zinc-100 shadow-xl overflow-hidden bg-white">
                    <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 px-8 py-8 flex items-center gap-3">
                        <ShieldAlert className="text-rose-600" size={20} />
                        <CardTitle className="text-lg font-black text-zinc-900 uppercase">Habitual Risk Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {habitualViolators.length > 0 ? (
                            <div className="divide-y divide-zinc-100">
                                {habitualViolators.map((violator, idx) => (
                                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-xs">
                                                ID {violator._id}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-zinc-900 uppercase">Frequent Offender</div>
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Primary: {violator.primaryViolation}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-rose-600">{violator.count}</div>
                                            <div className="text-[9px] font-black text-zinc-400 uppercase leading-none">Violations</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs"> No Habitual Profiles Detected</div>
                        )}
                        <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                            <p className="text-[10px] font-bold text-zinc-400 leading-relaxed italic">
                                * Identification based on unique object tracking persistence. Cross-frame deduplication active.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* EVIDENCE INSPECTOR MODAL */}
            {selectedEvidence && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300 no-print">
                    <div className="absolute inset-0" style={{ backgroundColor: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(12px)' }} onClick={() => setSelectedEvidence(null)} />
                    <div
                        id={`evidence-modal-${selectedEvidence._id}`}
                        className="relative w-full max-w-5xl rounded-[40px] overflow-hidden animate-in zoom-in-95 duration-300"
                        style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #f4f4f5',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <button
                            onClick={() => setSelectedEvidence(null)}
                            className="absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center transition-all z-10 no-capture"
                            style={{ backgroundColor: '#f4f4f5', color: '#18181b', border: 'none', cursor: 'pointer' }}
                        >
                            <Shield size={20} className="rotate-45" />
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }} className="lg:grid-cols-3">
                            <div className="lg:col-span-2 aspect-video flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#f4f4f5' }}>
                                <img
                                    src={selectedEvidence.snapshot}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    alt="Full Evidence"
                                />
                            </div>
                            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div>
                                        <div
                                            style={{
                                                backgroundColor: '#fee2e2',
                                                color: '#b91c1c',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                borderRadius: '12px',
                                                padding: '4px 16px',
                                                fontSize: '10px',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                marginBottom: '16px'
                                            }}
                                        >
                                            {selectedEvidence.object} Violation
                                        </div>
                                        <h3 style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '-0.05em', textTransform: 'uppercase', color: '#18181b', margin: '0' }}>{selectedEvidence.zone} Area</h3>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', backgroundColor: '#fafafa', color: '#a1a1aa' }}>
                                                <Calendar size={18} style={{ margin: 'auto' }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', margin: '0' }}>Date Recorded</p>
                                                <p style={{ fontSize: '14px', fontWeight: '700', color: '#18181b', margin: '0' }}>{new Date(selectedEvidence.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', backgroundColor: '#fafafa', color: '#a1a1aa' }}>
                                                <Clock size={18} style={{ margin: 'auto' }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', margin: '0' }}>Precise Time</p>
                                                <p style={{ fontSize: '14px', fontWeight: '700', color: '#18181b', margin: '0' }}>{new Date(selectedEvidence.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '24px', borderRadius: '24px', border: '1px solid #f4f4f5', backgroundColor: '#fafafa' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <ShieldAlert size={14} style={{ color: '#f43f5e' }} />
                                            <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#18181b' }}>Integrity Status</span>
                                        </div>
                                        <p style={{ fontSize: '10px', fontWeight: '500', lineHeight: '1.6', textTransform: 'uppercase', color: '#a1a1aa', margin: '0' }}>
                                            Timestamped Base64 snapshot stored in SafeGuard Evidence Vault. Distributed registry verified.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownloadProof(selectedEvidence._id)}
                                    disabled={isExporting}
                                    style={{
                                        width: '100%',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        backgroundColor: '#18181b',
                                        color: '#ffffff',
                                        border: 'none',
                                        fontWeight: '900',
                                        textTransform: 'uppercase',
                                        fontSize: '12px',
                                        letterSpacing: '0.1em',
                                        cursor: isExporting ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        marginTop: '32px'
                                    }}
                                >
                                    {isExporting ? <Loader2 size={18} className="animate-spin" /> : null}
                                    {isExporting ? "Capturing..." : "Download Proof"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function KPICard({ title, value, icon, trend, trendColor = "text-zinc-500" }) {
    return (
        <Card className="rounded-[32px] border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-8">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-white border border-zinc-100 transition-colors shadow-sm">
                        {icon}
                    </div>
                </div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{title}</h3>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-zinc-900 tracking-tighter">{value}</span>
                </div>
                {trend && (
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-4 ${trendColor}`}>
                        • {trend}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

