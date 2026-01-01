'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Activity, Image as ImageIcon, Video, Settings, LogOut, ChevronRight, MapPin, BarChart3 } from 'lucide-react';

export default function Sidebar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentView = searchParams.get('view') || 'realtime';

    const menuItems = [
        { id: 'realtime', label: 'Live Monitoring', icon: <Activity size={20} />, color: 'text-blue-600' },
        { id: 'analytics', label: 'Safety Analytics', icon: <BarChart3 size={20} />, color: 'text-indigo-600' },
        { id: 'manage', label: 'Site Inventory', icon: <MapPin size={20} />, color: 'text-emerald-600' },
        { id: 'image', label: 'Image Analysis', icon: <ImageIcon size={20} />, color: 'text-purple-600' },
        { id: 'video', label: 'Video Audit', icon: <Video size={20} />, color: 'text-orange-600' },
        { id: 'settings', label: 'System Settings', icon: <Settings size={20} />, color: 'text-zinc-600' },
    ];

    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
        } catch (error) {
            console.error(error);
            // Fallback
            document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push('/');
        }
    };

    return (
        <aside className="w-72 border-r border-zinc-200 bg-white hidden md:flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="h-20 flex items-center px-8 border-b border-zinc-50 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-200">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-sm tracking-tight text-zinc-900 leading-none">SafeGuard</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Intelligence</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 ml-2">Main Console</p>
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        href={`/dashboard?view=${item.id}`}
                        className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${currentView === item.id
                            ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200 scale-[1.02]'
                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 hover:scale-[1.01]'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`transition-colors ${currentView === item.id ? 'text-white' : item.color}`}>
                                {item.icon}
                            </div>
                            <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
                        </div>
                        {currentView === item.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        )}
                        {currentView !== item.id && (
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                        )}
                    </Link>
                ))}
            </nav>

            <div className="p-6 border-t border-zinc-50">
                <button
                    onClick={handleSignOut}
                    className="group flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-2xl w-full transition-all duration-300"
                >
                    <div className="p-2 bg-zinc-50 rounded-xl group-hover:bg-red-100/50 group-hover:text-red-600 transition-colors">
                        <LogOut size={18} />
                    </div>
                    <span className="font-bold text-[13px]">Terminate Session</span>
                </button>
                <div className="mt-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Network Secure</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium leading-normal italic">
                        All safety signals are encrypted and monitored 24/7.
                    </p>
                </div>
            </div>
        </aside>
    );
}
