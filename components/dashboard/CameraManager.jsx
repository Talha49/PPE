'use client';

import { useState, useEffect } from 'react';
import { Plus, Camera, MapPin, Trash2, Info, Loader2, ChevronRight, Settings, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function CameraManager({ onSelectCamera, activeCameraId }) {
    const [sites, setSites] = useState([]);
    const [cameras, setCameras] = useState([]);
    const [activeSite, setActiveSite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddSite, setShowAddSite] = useState(false);
    const [showEditSite, setShowEditSite] = useState(false);
    const [showAddCamera, setShowAddCamera] = useState(false);
    const [showEditCamera, setShowEditCamera] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [newSite, setNewSite] = useState({ name: '', address: '' });
    const [editingSite, setEditingSite] = useState(null);
    const [newCam, setNewCam] = useState({
        name: '', sourceType: 'rtsp', protocol: 'rtsp', ip: '', port: '',
        username: '', password: '', path: '', isAdvanced: false, streamUrl: ''
    });
    const [editingCamera, setEditingCamera] = useState(null);

    useEffect(() => {
        fetchSites();
    }, []);

    useEffect(() => {
        if (activeSite) fetchCameras(activeSite._id);
    }, [activeSite]);

    const fetchSites = async () => {
        try {
            const res = await fetch('/api/dashboard/sites');
            const data = await res.json();
            setSites(data);
            if (data.length > 0 && !activeSite) setActiveSite(data[0]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCameras = async (siteId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/dashboard/cameras?siteId=${siteId}`);
            const data = await res.json();
            setCameras(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSite = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await fetch('/api/dashboard/sites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSite)
            });
            if (res.ok) {
                await fetchSites();
                setShowAddSite(false);
                setNewSite({ name: '', address: '' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateSite = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await fetch(`/api/dashboard/sites/${editingSite._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSite)
            });
            if (res.ok) {
                await fetchSites();
                setShowEditSite(false);
                if (activeSite?._id === editingSite._id) setActiveSite(editingSite);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteSite = async () => {
        if (!activeSite) return;
        if (!confirm(`Are you sure? This will delete the site "${activeSite.name}" and ALL its cameras. This cannot be undone.`)) return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/dashboard/sites/${activeSite._id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchSites();
                setActiveSite(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const constructUrl = (cam) => {
        if (cam.isAdvanced) return cam.streamUrl;
        const auth = cam.username ? `${cam.username}:${cam.password}@` : '';
        const base = `${cam.ip}:${cam.port || (cam.protocol === 'rtsp' ? '554' : '80')}`;
        const path = cam.path ? (cam.path.startsWith('/') ? cam.path : `/${cam.path}`) : '';
        return `${cam.protocol}://${auth}${base}${path}`;
    };

    const handleAddCamera = async (e) => {
        e.preventDefault();
        if (!activeSite) return alert("Please select or create a site first.");

        setActionLoading(true);
        try {
            const finalUrl = constructUrl(newCam);
            const res = await fetch('/api/dashboard/cameras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCam,
                    streamUrl: finalUrl,
                    siteId: activeSite._id
                })
            });
            if (res.ok) {
                await fetchCameras(activeSite._id);
                setShowAddCamera(false);
                setNewCam({
                    name: '', sourceType: 'rtsp', protocol: 'rtsp', ip: '', port: '',
                    username: '', password: '', path: '', isAdvanced: false, streamUrl: ''
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateCamera = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const finalUrl = constructUrl(editingCamera);
            const res = await fetch(`/api/dashboard/cameras/${editingCamera._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...editingCamera, streamUrl: finalUrl })
            });
            if (res.ok) {
                await fetchCameras(activeSite._id);
                setShowEditCamera(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCamera = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this camera?')) return;
        try {
            await fetch(`/api/dashboard/cameras/${id}`, { method: 'DELETE' });
            fetchCameras(activeSite._id);
        } catch (error) {
            console.error(error);
        }
    };

    const openEditCamera = (e, camera) => {
        e.stopPropagation();
        setEditingCamera({
            ...camera,
            username: camera.username || '',
            password: camera.password || '',
            port: camera.port || '',
            path: camera.path || '',
            ip: camera.ip || '',
            streamUrl: camera.streamUrl || ''
        });
        setShowEditCamera(true);
    };

    if (loading && sites.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-zinc-900" size={40} />
            </div>
        );
    }

    if (sites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[40px] border-2 border-dashed border-zinc-100 text-center shadow-sm">
                <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-300 mb-6">
                    <MapPin size={40} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Zero Operating Sites</h3>
                <p className="text-zinc-500 max-w-sm mt-3 font-medium">To begin AI monitoring, initialize your first geographical site or building sector below.</p>
                <Button className="mt-10 rounded-2xl px-10 py-7 text-sm font-black bg-zinc-900 hover:bg-black text-white shadow-xl shadow-zinc-200" onClick={() => setShowAddSite(true)}>
                    <Plus size={20} className="mr-2" /> Initialize Primary Site
                </Button>

                {showAddSite && <SiteModal mode="create" data={newSite} setData={setNewSite} onSave={handleAddSite} onClose={() => setShowAddSite(false)} />}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Site Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm shadow-zinc-200/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-zinc-200">
                        <MapPin size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <select
                                className="text-xl font-black bg-transparent border-none focus:ring-0 p-0 cursor-pointer text-zinc-900 leading-none"
                                value={activeSite?._id || ''}
                                onChange={(e) => setActiveSite(sites.find(s => s._id === e.target.value))}
                            >
                                {sites.map(site => <option key={site._id} value={site._id}>{site.name}</option>)}
                            </select>
                            <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingSite({ ...activeSite, address: activeSite.address || '' }); setShowEditSite(true); }} className="text-zinc-300 hover:text-blue-600 p-1">
                                    <Plus className="rotate-45" size={14} /> {/* Placeholder for edit icon since lucide edit is missing? wait I have settings */}
                                    <Settings size={14} />
                                </button>
                                <button onClick={handleDeleteSite} className="text-zinc-300 hover:text-red-500 p-1">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-widest">{activeSite?.address || 'Awaiting Coordinates'}</p>
                    </div>
                </div>
                <Button variant="ghost" className="rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-50 p-6" onClick={() => setShowAddSite(true)}>
                    <Plus size={18} className="mr-2" /> Register Site
                </Button>
            </div>

            {/* Camera List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cameras.map(camera => (
                    <Card
                        key={camera._id}
                        onClick={() => onSelectCamera(camera)}
                        className={`group cursor-pointer rounded-[32px] transition-all relative overflow-hidden h-[200px] flex flex-col justify-between ${activeCameraId === camera._id
                            ? 'border-blue-600 bg-blue-50/10 ring-4 ring-blue-500/5 shadow-2xl shadow-blue-500/10'
                            : 'border-zinc-100 bg-white hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50'
                            }`}
                    >
                        <CardContent className="p-6 h-full flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeCameraId === camera._id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
                                        : 'bg-zinc-50 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white'
                                        }`}>
                                        <Camera size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-zinc-900 tracking-tight text-lg leading-tight truncate max-w-[140px] uppercase">
                                            {camera.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500 focus:ring-4 ring-red-500/20'}`} />
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.1em]">{camera.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                    <button onClick={(e) => openEditCamera(e, camera)} className="w-8 h-8 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all scale-90 hover:scale-100">
                                        <Settings size={14} />
                                    </button>
                                    <button onClick={(e) => handleDeleteCamera(e, camera._id)} className="w-8 h-8 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:border-red-200 shadow-sm transition-all scale-90 hover:scale-100">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-widest">{camera.sourceType} Node</span>
                                    {camera.roiConfig?.length > 0 && (
                                        <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest">{camera.roiConfig.length} Zones</span>
                                    )}
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeCameraId === camera._id ? 'bg-blue-600 text-white' : 'bg-zinc-50 text-zinc-300 group-hover:bg-zinc-900 group-hover:text-white'}`}>
                                    <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Add Camera Action Card */}
                <button
                    onClick={() => setShowAddCamera(true)}
                    className="border-2 border-dashed border-zinc-100 rounded-[32px] p-6 h-[200px] flex flex-col items-center justify-center gap-4 hover:border-blue-600 hover:bg-blue-50/20 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group"
                >
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Plus size={24} />
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-black text-zinc-800 uppercase tracking-widest">Add Node</span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase mt-1 tracking-widest">Expand Vision Network</span>
                    </div>
                </button>
            </div>

            {/* Modals */}
            {showAddSite && <SiteModal mode="create" data={newSite} setData={setNewSite} onSave={handleAddSite} onClose={() => setShowAddSite(false)} isLoading={actionLoading} />}
            {showEditSite && <SiteModal mode="edit" data={editingSite} setData={setEditingSite} onSave={handleUpdateSite} onClose={() => setShowEditSite(false)} isLoading={actionLoading} />}
            {showAddCamera && <CameraModal mode="create" data={newCam} setData={setNewCam} onSave={handleAddCamera} onClose={() => setShowAddCamera(false)} isLoading={actionLoading} />}
            {showEditCamera && <CameraModal mode="edit" data={editingCamera} setData={setEditingCamera} onSave={handleUpdateCamera} onClose={() => setShowEditCamera(false)} isLoading={actionLoading} />}
        </div>
    );
}

function SiteModal({ mode, data, setData, onSave, onClose, isLoading }) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] p-10 w-full max-w-[440px] border border-zinc-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-zinc-200">
                        <MapPin size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">
                        {mode === 'edit' ? 'Update Site Intel' : 'New Strategic Site'}
                    </h2>
                    <p className="text-zinc-500 text-sm mt-2 font-medium">Define your facility monitoring parameters.</p>
                </div>

                <form onSubmit={onSave} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Site Designation</label>
                        <input
                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                            placeholder="e.g. North Sector Warehouse"
                            value={data.name}
                            onChange={e => setData({ ...data, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Geographical Address</label>
                        <input
                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                            placeholder="Physical location or coordinates"
                            value={data.address}
                            onChange={e => setData({ ...data, address: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 pt-6">
                        <Button type="button" variant="ghost" className="flex-1 rounded-2xl font-bold py-7 hover:bg-zinc-50" onClick={onClose} disabled={isLoading}>Abort</Button>
                        <Button type="submit" className="flex-1 rounded-2xl font-black py-7 bg-zinc-900 hover:bg-black text-white shadow-xl shadow-zinc-200" isLoading={isLoading} loadingText={mode === 'edit' ? "Updating..." : "Initializing..."}>
                            {mode === 'edit' ? 'Apply changes' : 'Initialize Site'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CameraModal({ mode, data, setData, onSave, onClose, isLoading }) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] p-10 w-full max-w-[500px] border border-zinc-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-14 h-14 bg-blue-600 rounded-[20px] flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/30">
                        <Camera size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">
                        {mode === 'edit' ? 'Reconfigure Node' : 'Initialize Vision Node'}
                    </h2>
                    <p className="text-zinc-500 text-sm mt-2 font-medium">Link your hardware to the AI monitoring network.</p>
                </div>

                <form onSubmit={onSave} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Node Designation</label>
                        <input
                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all placeholder:text-zinc-300"
                            placeholder="e.g. Loading Dock #4"
                            value={data.name}
                            onChange={e => setData({ ...data, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Stream Source Intelligence</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setData({ ...data, sourceType: 'rtsp' })}
                                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${data.sourceType === 'rtsp' ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/5 shadow-sm' : 'border-zinc-100 bg-zinc-50 hover:bg-zinc-100'}`}
                            >
                                <Wifi size={20} className={data.sourceType === 'rtsp' ? 'text-blue-600' : 'text-zinc-400'} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${data.sourceType === 'rtsp' ? 'text-blue-600' : 'text-zinc-500'}`}>IP/RTSP Node</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData({ ...data, sourceType: 'camera' })}
                                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${data.sourceType === 'camera' ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-500/5 shadow-sm' : 'border-zinc-100 bg-zinc-50 hover:bg-zinc-100'}`}
                            >
                                <Camera size={20} className={data.sourceType === 'camera' ? 'text-indigo-600' : 'text-zinc-400'} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${data.sourceType === 'camera' ? 'text-indigo-600' : 'text-zinc-500'}`}>Local Web-Node</span>
                            </button>
                        </div>
                    </div>

                    {data.sourceType === 'rtsp' && (
                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Protocol Matrix</span>
                                <button
                                    type="button"
                                    onClick={() => setData(p => ({ ...p, isAdvanced: !p.isAdvanced }))}
                                    className={`text-[10px] font-black px-4 py-1.5 rounded-full border transition-all uppercase tracking-tighter ${data.isAdvanced ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}
                                >
                                    {data.isAdvanced ? 'Expert Mode' : 'Simple Mode'}
                                </button>
                            </div>

                            {data.isAdvanced ? (
                                <div className="space-y-3">
                                    <textarea
                                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl px-5 py-4 text-sm font-bold min-h-[100px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all placeholder:text-zinc-300"
                                        placeholder="rtsp://user:pass@192.168.1.1:554/live"
                                        value={data.streamUrl}
                                        onChange={e => setData({ ...data, streamUrl: e.target.value })}
                                        required
                                    />
                                    <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100 italic">
                                        <Info size={14} className="text-zinc-400 flex-shrink-0" />
                                        <p className="text-[10px] text-zinc-500 font-medium">Inject raw RTSP/HTTP endpoints here for specialized hardware setups.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Prot.</label>
                                        <select
                                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-2 py-4 text-xs font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                                            value={data.protocol}
                                            onChange={e => setData({ ...data, protocol: e.target.value })}
                                        >
                                            <option value="rtsp">RTSP</option>
                                            <option value="http">HTTP</option>
                                            <option value="https">HTTPS</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Static IP / Host</label>
                                        <input
                                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-4 text-xs font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all placeholder:text-zinc-300"
                                            placeholder="192.168.1.XX"
                                            value={data.ip}
                                            onChange={e => setData({ ...data, ip: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Port</label>
                                        <input
                                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-3 py-4 text-xs font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all placeholder:text-zinc-300"
                                            placeholder="554"
                                            value={data.port}
                                            onChange={e => setData({ ...data, port: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Access Key ID</label>
                                        <input
                                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-4 text-xs font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all placeholder:text-zinc-300"
                                            placeholder="Admin"
                                            value={data.username}
                                            onChange={e => setData({ ...data, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Secret Token</label>
                                        <input
                                            type="password"
                                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-4 text-xs font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all placeholder:text-zinc-300"
                                            placeholder="••••••••"
                                            value={data.password}
                                            onChange={e => setData({ ...data, password: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Encoder Path</label>
                                        <input
                                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-5 py-4 text-xs font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all placeholder:text-zinc-300"
                                            placeholder="e.g. /streaming/channels/101"
                                            value={data.path}
                                            onChange={e => setData({ ...data, path: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="ghost" className="flex-1 rounded-2xl font-bold py-7 hover:bg-zinc-50" onClick={onClose} disabled={isLoading}>Discard</Button>
                        <Button type="submit" className="flex-2 rounded-2xl font-black py-7 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 px-8" isLoading={isLoading} loadingText={mode === 'edit' ? "Reconfiguring..." : "Initializing..."}>
                            {mode === 'edit' ? 'Update Intelligence Node' : 'Initialize Node'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
