'use client';

import { Shield, LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserHeader({ user }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    return (
        <div className="flex items-center justify-between py-6 border-b border-zinc-100 bg-white/40 backdrop-blur-xl sticky top-0 z-40">
            <div className="flex flex-col">
                <h1 className="text-xl font-black text-zinc-900 tracking-tight">System Console</h1>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] leading-none mt-1">Real-time Safety Matrix</p>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 pr-6 border-r border-zinc-100">
                    <div className="text-right">
                        <p className="text-sm font-black text-zinc-900 leading-tight uppercase tracking-tight">{user?.name || 'Authorized Personnel'}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{user?.email || 'Secure Session'}</p>
                    </div>
                    <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-zinc-200">
                        <UserIcon size={18} />
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-xl border border-zinc-100 transition-all hover:border-red-200 shadow-sm"
                    title="Terminate Session"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:block hidden animate-in fade-in slide-in-from-right-2 duration-300">Exit</span>
                    <LogOut size={16} />
                </button>
            </div>
        </div>
    );
}
