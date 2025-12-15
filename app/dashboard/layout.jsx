import Link from 'next/link';
import { Shield, LayoutDashboard, Image as ImageIcon, Video, Settings, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden">

            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-200 bg-white hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-zinc-200">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-zinc-900">SafeGuard AI</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active />
                    {/* We can add sub-routes here if we move away from tab-based state later */}
                    <NavItem href="#" icon={<ImageIcon size={20} />} label="Image Analysis" />
                    <NavItem href="#" icon={<Video size={20} />} label="Video Analysis" />
                    <NavItem href="#" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-zinc-200">
                    <button className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg w-full transition-colors">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header (TODO: Add Hamburger) */}

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, active }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active
                ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </Link>
    );
}
