import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, Play, FileVideo } from 'lucide-react';
import { Badge } from '../ui/Badge';

export default function VideoAnalyzer() {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [streamUrl, setStreamUrl] = useState(null);

    const handleUpload = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleProcess = async () => {
        if (!file) return;
        setProcessing(true);
        setStreamUrl(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('https://ghauri21-ppedetector.hf.space/api/detect/video', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                let url = data.stream_url;

                // If relative path, prepend backend domain
                if (url.startsWith('/')) {
                    url = `https://ghauri21-ppedetector.hf.space${url}`;
                } else {
                    // Fallback for older backend versions returning localhost
                    url = url.replace('http://127.0.0.1:8000', 'https://ghauri21-ppedetector.hf.space');
                }
                setStreamUrl(url);
            } else {
                alert('Analysis failed');
            }

        } catch (err) {
            console.error(err);
            alert("Video upload failed.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Upload Bar */}
            <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200 shadow-sm">
                <div className="relative">
                    <input id="vid-upload" type="file" className="hidden" accept="video/*" onChange={handleUpload} />
                    <Button variant="secondary" onClick={() => document.getElementById('vid-upload').click()}>
                        <Upload size={16} className="mr-2" />
                        {file ? 'Change Video' : 'Select Video'}
                    </Button>
                </div>
                <div className="flex-1 px-4 text-zinc-600 truncate font-mono text-sm">
                    {file ? file.name : "No file selected"}
                </div>
                <Button disabled={!file || processing || streamUrl} onClick={handleProcess} isLoading={processing}>
                    Start Processing
                </Button>
                {streamUrl && (
                    <Button variant="destructive" onClick={() => setStreamUrl(null)}>
                        Stop Stream
                    </Button>
                )}
            </div>

            {/* Video Player Area */}
            <div className="flex-1 bg-black rounded-xl border border-zinc-200 overflow-hidden relative flex items-center justify-center group shadow-md">
                {streamUrl ? (
                    <div className="w-full h-full relative">
                        <img src={streamUrl} className="w-full h-full object-contain" alt="Processed Video Stream" />
                        <div className="absolute top-4 left-4">
                            <Badge variant="success" className="animate-pulse">Playing Processed Stream</Badge>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-zinc-500">
                        <FileVideo size={64} className="mx-auto mb-4 opacity-20" />
                        <p>Select a video to begin analysis</p>
                    </div>
                )}
            </div>
        </div>
    );
}
