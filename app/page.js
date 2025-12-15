import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield, Eye, Video, Activity, Zap, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SafeGuard AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button size="sm" variant="ghost">Login</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge variant="success" className="mb-6 animate-fade-in">
            v2.0 Now Available
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
            Next-Gen PPE Detection <br /> for Modern Safety
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ensure workplace compliance with real-time AI monitoring. 
            Detect hardhats, vests, and masks instantly with 99.9% accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg">
                Launch Dashboard <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="secondary" className="h-14 px-8">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900/20 border-y border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Detection Capabilities</h2>
            <p className="text-slate-400">Everything you need to maintain a safe and compliant construction site.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Activity className="h-6 w-6 text-blue-400" />}
              title="Real-time Monitoring"
              description="Connect any RTSP camera for instant compliance checks with < 100ms latency."
            />
            <FeatureCard 
              icon={<Video className="h-6 w-6 text-purple-400" />}
              title="Video Analysis"
              description="Upload pre-recorded footage to audit past shifts and generate safety reports."
            />
            <FeatureCard 
              icon={<Eye className="h-6 w-6 text-emerald-400" />}
              title="Smart ROI"
              description="Draw custom Regions of Interest to focus detection on specific hazardous zones."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 bg-gradient-to-r from-blue-900/10 to-indigo-900/10 rounded-3xl p-12 border border-blue-500/10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatItem value="99.9%" label="Detection Accuracy" />
            <StatItem value="< 50ms" label="Processing Latency" />
            <StatItem value="24/7" label="Continuous Uptime" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p>© 2025 SafeGuard AI. Built for the Future of Construction.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="hover:border-blue-500/50 transition-colors group">
      <CardHeader>
        <div className="h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function StatItem({ value, label }) {
  return (
    <div>
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <div className="text-blue-200/60 font-medium uppercase tracking-wider text-sm">{label}</div>
    </div>
  );
}
