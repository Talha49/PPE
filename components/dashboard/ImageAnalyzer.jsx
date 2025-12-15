import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, ImageIcon, AlertCircle } from 'lucide-react';

export default function ImageAnalyzer() {
    const [image, setImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target.result);
            reader.readAsDataURL(file);
            setResult(null); // Reset prev result
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setAnalyzing(true);
        setResult(null);

        // Create FormData with file from input
        // NOTE: We need the actual file object, so we'll store it in state
        const input = document.getElementById('img-upload');
        if (!input.files[0]) {
            setAnalyzing(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', input.files[0]);

        try {
            const response = await fetch('https://ghauri21-ppedetector.hf.space/api/detect/image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();
            // Backend returns "data:image/jpeg;base64,..." string in data.image
            setResult(data);

        } catch (err) {
            console.error(err);
            alert("Failed to analyze image. Ensure backend is running.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            {/* Input Section */}
            <div className="flex flex-col gap-4">
                <div
                    className="border-2 border-dashed border-zinc-300 hover:border-blue-500/50 hover:bg-zinc-50 transition-all rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer group relative bg-white"
                    onClick={() => document.getElementById('img-upload').click()}
                >
                    <input id="img-upload" type="file" className="hidden" accept="image/*" onChange={handleUpload} />

                    {image ? (
                        <img src={image} className="h-full w-full object-contain p-2 rounded-lg" />
                    ) : (
                        <>
                            <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3 text-zinc-400 group-hover:scale-110 transition-transform">
                                <Upload size={20} />
                            </div>
                            <p className="text-zinc-600 font-medium">Click to upload image</p>
                            <p className="text-xs text-zinc-400 mt-1">JPG, PNG supported</p>
                        </>
                    )}
                </div>

                <Button
                    size="lg"
                    disabled={!image || analyzing}
                    onClick={handleAnalyze}
                    isLoading={analyzing}
                    className="w-full"
                >
                    Analyze Image
                </Button>
            </div>

            {/* Result Section */}
            <div className="border border-zinc-200 bg-zinc-50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                {result ? (
                    <div className="w-full h-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                        <img src={result.image} alt="Detection Result" className="max-h-64 object-contain rounded-lg border border-zinc-200 shadow-sm mb-4" />

                        <h3 className="text-xl font-bold text-zinc-900">Analysis Complete</h3>

                        {/* Stats from result */}
                        <div className="grid grid-cols-3 gap-4 text-left w-full mt-4">
                            {/* We can calculate stats from detections array if needed, backend sends 'detections' list too */}
                            <StatBox label="Detections" value={result.detections.length} />
                            <StatBox label="Violations" value={result.detections.filter(d => d.compliance_status?.includes('VIOLATION')).length} variant="danger" />
                        </div>
                    </div>
                ) : (
                    <div className="text-zinc-400">
                        <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Upload an image to see detection results</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBox({ label, value, variant }) {
    return (
        <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
            <div className={`text-xl font-bold ${variant === 'danger' ? 'text-red-600' : 'text-zinc-900'}`}>{value}</div>
        </div>
    )
}
