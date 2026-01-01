"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Shield, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

const TimelineScrubber = ({ incidents = [] }) => {
    const [index, setIndex] = useState(0);
    const current = incidents[index] || null;

    if (!incidents.length) return null;

    return (
        <div style={{
            backgroundColor: '#18181b',
            borderRadius: '24px',
            padding: '24px',
            color: 'white',
            border: '1px solid #27272a',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '2px', color: '#a1a1aa', textTransform: 'uppercase' }}>
                        Visual Evidence Scrubber
                    </h3>
                    <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '4px' }}>
                        INCIDENT TIMELINE
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setIndex(Math.max(0, index - 1))}
                        disabled={index === 0}
                        style={{ padding: '8px', borderRadius: '50%', backgroundColor: '#27272a', border: 'none', color: 'white', cursor: 'pointer', opacity: index === 0 ? 0.3 : 1 }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setIndex(Math.min(incidents.length - 1, index + 1))}
                        disabled={index === incidents.length - 1}
                        style={{ padding: '8px', borderRadius: '50%', backgroundColor: '#27272a', border: 'none', color: 'white', cursor: 'pointer', opacity: index === incidents.length - 1 ? 0.3 : 1 }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Main Visual Display */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', background: '#09090b', border: '1px solid #3f3f46' }}>
                {current && (
                    <>
                        <img
                            src={current.snapshot}
                            alt="Violation"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        {/* Overlay Metadata */}
                        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}>
                            <div style={{ background: 'rgba(0,0,0,0.8)', padding: '12px 16px', borderRadius: '12px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '10px', fontWeight: '900', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '2px' }}>Incident Target</div>
                                <div style={{ fontSize: '18px', fontWeight: '900', color: '#f43f5e' }}>{current.object.toUpperCase()} DETECTED</div>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'white', marginTop: '4px' }}>Zone: {current.zone}</div>
                            </div>
                            <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.8)', padding: '12px 16px', borderRadius: '12px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '10px', fontWeight: '900', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '2px' }}>Timestamp</div>
                                <div style={{ fontSize: '16px', fontWeight: '900' }}>{new Date(current.timestamp).toLocaleTimeString()}</div>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: '#71717a' }}>{new Date(current.timestamp).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Scrubber Controls */}
            <div style={{ marginTop: '20px' }}>
                <input
                    type="range"
                    min="0"
                    max={incidents.length - 1}
                    value={index}
                    onChange={(e) => setIndex(parseInt(e.target.value))}
                    style={{
                        width: '100%',
                        accentColor: '#f43f5e',
                        height: '6px',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', fontWeight: '900', color: '#71717a', textTransform: 'uppercase' }}>
                    <span>Oldest Evidence</span>
                    <span>{index + 1} of {incidents.length} Records</span>
                    <span>Most Recent</span>
                </div>
            </div>
        </div>
    );
};

export default TimelineScrubber;
