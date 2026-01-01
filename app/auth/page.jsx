'use client';

import { useState } from 'react';
import { Shield, Mail, Lock, User, Building, ArrowRight, Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        companyName: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/dashboard');
            } else {
                setError(data.error || 'Authentication failed');
                setLoading(false);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-zinc-50 to-zinc-50">
            {/* Back to Home */}
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-blue-600 transition-all font-medium text-sm">
                <Home size={16} /> <span>Back to Site</span>
            </Link>

            <div className="w-full max-w-[440px] animate-in slide-in-from-bottom border border-zinc-200 bg-white rounded-[32px] shadow-2xl shadow-zinc-200/50 overflow-hidden">
                <div className="p-10">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/20">
                            <Shield size={28} />
                        </div>
                        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
                            {mode === 'login' ? 'Mission Control' : 'Join the Force'}
                        </h1>
                        <p className="text-zinc-500 text-sm mt-3 font-medium">
                            {mode === 'login'
                                ? 'Secure entry for safety managers and admins.'
                                : 'Setup your organization in under 2 minutes.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {mode === 'register' && (
                            <div className="space-y-5 animate-in slide-in-from-top-4">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-zinc-800 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-zinc-400 font-medium"
                                            placeholder="e.g. Robert Fox"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-zinc-800 ml-1">Company Name</label>
                                    <div className="relative group">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-zinc-400 font-medium"
                                            placeholder="e.g. Fox Constructions"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-zinc-800 ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-zinc-400 font-medium"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[13px] font-bold text-zinc-800">Password</label>
                                {mode === 'login' && <button type="button" className="text-[11px] text-blue-600 font-black hover:underline uppercase tracking-tighter">Recover Access</button>}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-zinc-400 font-medium"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full rounded-2xl py-7 text-sm font-black mt-4 bg-zinc-900 hover:bg-black text-white transition-all shadow-xl shadow-zinc-200">
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>{mode === 'login' ? 'Proceed to Dashboard' : 'Create My Account'}</span>
                                    <ArrowRight size={18} />
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-zinc-100 flex flex-col items-center gap-4">
                        <p className="text-[13px] text-zinc-500 font-medium">
                            {mode === 'login' ? "New to the platform?" : "Joined us before?"}
                        </p>
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                setError('');
                            }}
                            className="text-blue-600 text-sm font-black hover:underline px-6 py-2 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-all"
                        >
                            {mode === 'login' ? 'Start Free Deployment' : 'Sign In to Account'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-footer */}
            <div className="mt-12 text-zinc-400 text-xs font-medium flex gap-6">
                <Link href="#" className="hover:text-zinc-600">Privacy Policy</Link>
                <Link href="#" className="hover:text-zinc-600">Terms of Service</Link>
                <Link href="#" className="hover:text-zinc-600">Site Status</Link>
            </div>
        </div>
    );
}
