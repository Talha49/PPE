'use client';

import { useState } from 'react';
import { Shield, Mail, Lock, User, Building, ArrowRight, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
    const [mode, setMode] = useState(initialMode); // 'login' or 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        companyName: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            if (onSuccess) onSuccess(data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-zinc-200 animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors">
                    <X size={20} />
                </button>

                <div className="p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
                            <Shield size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900">
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1">
                            {mode === 'login' ? 'Enter your credentials to access site' : 'Start your 14-day free trial today'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                            <div className="w-1 h-1 rounded-full bg-red-600" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-700 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-700 ml-1">Company Name</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="Acme Construction"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-semibold text-zinc-700">Password</label>
                                {mode === 'login' && <button type="button" className="text-[10px] text-blue-600 font-bold hover:underline">Forgot?</button>}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full rounded-xl py-6 text-sm font-bold mt-2">
                            {loading ? (
                                <Loader2 className="animate-spin mr-2" size={18} />
                            ) : (
                                <>
                                    {mode === 'login' ? 'Sign In' : 'Create Site Account'}
                                    <ArrowRight size={16} className="ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col items-center gap-2">
                        <p className="text-xs text-zinc-500">
                            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        </p>
                        <button
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="text-blue-600 text-xs font-bold hover:underline"
                        >
                            {mode === 'login' ? 'Start Free Trial' : 'Sign In instead'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
