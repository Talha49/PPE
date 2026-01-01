import Sidebar from '@/components/dashboard/Sidebar';
import { Suspense } from 'react';

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden">
            <Suspense fallback={<div className="w-72 bg-white border-r border-zinc-200" />}>
                <Sidebar />
            </Suspense>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                <div className="flex-1 overflow-y-auto">
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
