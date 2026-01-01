'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield, Eye, Video, Activity, Zap } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-sky-500/20">

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Soft Accents */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-emerald-50/50 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-2xl shadow-sm mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">v4.0 Enterprise Intelligence</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-zinc-900 leading-[0.9]">
            The Standard in <br />
            <span className="text-zinc-400">Automated</span> Safety
          </h1>
          
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Scalable PPE compliance monitoring for high-risk environments. 
            Real-time detection with 99.9% precision and instant reporting.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-10 py-8 text-lg" onClick={() => router.push('/auth')}>
              Get Started <Zap className="ml-2 h-5 w-5 fill-current" />
            </Button>
            <Button variant="secondary" size="lg" className="px-10 py-8 bg-white border-zinc-200" onClick={() => router.push('/auth')}>
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white border-y border-zinc-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black text-zinc-900 tracking-tight leading-none mb-6">Built for Scale. <br />Designed for Precision.</h2>
              <p className="text-zinc-500 font-medium">Enterprise-grade safety monitoring that integrates with your existing vision network.</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active nodes</span>
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-xl bg-zinc-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-zinc-400">CAM</div>
                    ))}
                </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Activity className="h-6 w-6 text-sky-500" />}
              accentColor="bg-sky-500/10"
              title="Real-time Stream"
              description="Sub-100ms latency stream analysis from any RTSP or local hardware configuration."
            />
            <FeatureCard 
              icon={<Video className="h-6 w-6 text-rose-500" />}
              accentColor="bg-rose-500/10"
              title="Audit Analysis"
              description="Deep-learning review of recorded footage for periodic compliance auditing and logging."
            />
            <FeatureCard 
              icon={<Eye className="h-6 w-6 text-emerald-500" />}
              accentColor="bg-emerald-500/10"
              title="Strategic Zones"
              description="Defined Regions of Interest with autonomous alerting for high-risk exclusion zones."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-zinc-50 overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-rose-50/50 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            <StatItem value="99.9%" label="Detection Accuracy" sub="Gold Standard Precision" />
            <StatItem value="< 50ms" label="Response Time" sub="Instant Safety Triggers" />
            <StatItem value="24/7" label="System Uptime" sub="Zero-Downtime Monitoring" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-zinc-900 rounded-[60px] mx-6 mb-12 text-center text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)]">
        <div className="container mx-auto px-6 max-w-2xl">
            <Shield className="h-16 w-16 text-sky-400 mx-auto mb-8" />
            <h2 className="text-5xl font-black tracking-tighter mb-6 leading-none">Ready to Secure <br />Your Facility?</h2>
            <p className="text-zinc-400 mb-12 text-lg font-medium">Join leading infrastructure teams already automating their workspace compliance.</p>
            <Button size="lg" variant="accent" className="px-12 py-8 text-xl" onClick={() => router.push('/auth')}>
               Launch Platform Now
            </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-6 w-6 bg-zinc-900 rounded-lg" />
              <span className="font-black tracking-tight text-zinc-900">SAFEGUARD AI</span>
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">© 2025 Intelligence Systems Architecture. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, accentColor }) {
  return (
    <Card className="hover:border-zinc-300 transition-all duration-500 bg-white border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-zinc-200/50 rounded-[40px] p-4 group">
      <CardContent className="p-8">
        <div className={`h-16 w-16 rounded-3xl ${accentColor} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <h3 className="text-2xl font-black text-zinc-900 mb-4 tracking-tight">{title}</h3>
        <p className="text-zinc-500 leading-relaxed font-medium">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function StatItem({ value, label, sub }) {
  return (
    <div className="animate-in fade-in zoom-in duration-500">
      <div className="text-7xl font-black text-zinc-900 mb-3 tracking-tighter">{value}</div>
      <div className="text-zinc-900 font-black uppercase tracking-[0.2em] text-xs mb-1">{label}</div>
      <div className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">{sub}</div>
    </div>
  );
}
