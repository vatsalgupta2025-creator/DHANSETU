'use client';
import React, { useEffect, useState, useRef } from 'react';

// ── Lightweight Shader Background for Loading Screen ──────────────────────────
// A subtle, warm-toned WebGL shader that runs behind the existing loading content.
// Rendered at low opacity to give a premium ambient glow without overpowering.

const loadingShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}
void main(void) {
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.25,bg*.137,bg*.05),d);
  }
  O=vec4(col,1);
}`;

function useLoadingShader() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const glRef = useRef<WebGL2RenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl2');
        if (!gl) return;
        glRef.current = gl;

        // Compile shader
        const vertSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

        const vs = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vs, vertSrc);
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fs, loadingShaderSource);
        gl.compileShader(fs);

        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
            console.error('Shader error:', gl.getShaderInfoLog(fs));
            return;
        }

        const program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Link error:', gl.getProgramInfoLog(program));
            return;
        }

        programRef.current = program;

        // Geometry
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);
        const pos = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

        // Uniform locations
        const uRes = gl.getUniformLocation(program, 'resolution');
        const uTime = gl.getUniformLocation(program, 'time');

        // Resize
        const resize = () => {
            const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener('resize', resize);

        // Render loop
        const loop = (now: number) => {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, now * 1e-3);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animFrameRef.current = requestAnimationFrame(loop);
        };
        loop(0);

        return () => {
            window.removeEventListener('resize', resize);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
        };
    }, []);

    return canvasRef;
}

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'loading' | 'done'>('loading');
    const shaderCanvasRef = useLoadingShader();

    useEffect(() => {
        const start = Date.now();
        const duration = 3000;
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const pct = Math.min(100, Math.round((elapsed / duration) * 100));
            setProgress(pct);
            if (pct >= 100) {
                clearInterval(interval);
                setPhase('done');
                setTimeout(onDone, 400);
            }
        }, 30);
        return () => clearInterval(interval);
    }, [onDone]);

    const loadingTexts = [
        'Initializing AI Engine...',
        'Loading Risk Models...',
        'Connecting to Data Layer...',
        'Preparing Language Packs...',
        'Ready!',
    ];
    const textIndex = Math.min(4, Math.floor(progress / 20));

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(135deg, #fdfbf7 0%, #f5efe6 40%, #f0ebe0 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            opacity: phase === 'done' ? 0 : 1,
            transition: 'opacity 0.4s ease',
        }}>
            {/* ── WebGL Shader Background ────────────────────────────────────────── */}
            <canvas
                ref={shaderCanvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.55,
                    mixBlendMode: 'overlay',
                    pointerEvents: 'none',
                }}
            />
            {/* Warm tint overlay to blend shader with cream theme */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `
                    radial-gradient(ellipse 60% 50% at 50% 40%, rgba(13,148,136,0.06) 0%, transparent 60%),
                    radial-gradient(ellipse 80% 60% at 50% 50%, rgba(245,200,66,0.10) 0%, transparent 70%)
                `,
                pointerEvents: 'none',
            }} />

            {/* Animated background particles - using deterministic values to avoid hydration mismatch */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {Array.from({ length: 20 }).map((_, i) => {
                    const sizes = [3.63, 2.68, 2.74, 1.17, 2.21, 4.43, 4.22, 3.16, 2.57, 1.09, 3.90, 1.50, 2.30, 3.58, 2.66, 2.78, 1.36, 2.25, 2.18, 1.97];
                    const heights = [4.62, 1.47, 3.06, 3.68, 1.13, 1.36, 3.59, 2.58, 1.07, 1.28, 2.05, 1.88, 2.25, 3.12, 1.20, 1.82, 2.56, 1.58, 2.36, 3.97];
                    const lefts = [0, 5.3, 10.6, 15.9, 21.2, 26.5, 31.8, 37.1, 42.4, 47.7, 53, 58.3, 63.6, 68.9, 74.2, 79.5, 84.8, 90.1, 95.4, 0.7];
                    const tops = [0, 7.1, 14.2, 21.3, 28.4, 35.5, 42.6, 49.7, 56.8, 63.9, 71, 78.1, 85.2, 92.3, 99.4, 6.5, 13.6, 20.7, 27.8, 34.9];
                    const durations = [3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5, 6];
                    const delays = [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 0.1, 0.4, 0.7, 1, 1.3, 1.6, 1.9, 0.2, 0.5, 0.8, 1.1, 1.4, 1.7];
                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            width: sizes[i] || 2,
                            height: heights[i] || 2,
                            borderRadius: '50%',
                            background: i % 3 === 0 ? '#0d9488' : i % 3 === 1 ? '#16a34a' : '#d97706',
                            left: `${lefts[i]}%`,
                            top: `${tops[i]}%`,
                            opacity: 0.4,
                            animation: `floatParticle ${durations[i]}s ease-in-out ${delays[i]}s infinite alternate`,
                        }} />
                    );
                })}
            </div>

            {/* Glowing ring behind coin */}
            <div style={{
                position: 'relative',
                width: 200, height: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 40,
                zIndex: 1,
            }}>
                {/* Outer glow ring */}
                <div style={{
                    position: 'absolute',
                    width: 200, height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)',
                    animation: 'pulseRing 2s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute',
                    width: 160, height: 160,
                    borderRadius: '50%',
                    border: '1px solid rgba(13,148,136,0.3)',
                    animation: 'spinSlow 8s linear infinite',
                }} />
                <div style={{
                    position: 'absolute',
                    width: 180, height: 180,
                    borderRadius: '50%',
                    border: '1px dashed rgba(22,163,74,0.2)',
                    animation: 'spinSlow 12s linear infinite reverse',
                }} />

                {/* 3D Rupee Coin */}
                <div style={{
                    width: 120, height: 120,
                    position: 'relative',
                    animation: 'coin3dSpin 2s linear infinite',
                    transformStyle: 'preserve-3d',
                    perspective: '400px',
                }}>
                    {/* Coin face */}
                    <div style={{
                        width: 120, height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(145deg, #f5c842 0%, #e6a817 30%, #f0b429 50%, #c8860a 70%, #f5c842 100%)',
                        boxShadow: `
                            0 0 0 4px #c8860a,
                            0 0 0 6px #f5c842,
                            0 8px 32px rgba(245,200,66,0.5),
                            0 0 60px rgba(245,200,66,0.2),
                            inset 0 2px 8px rgba(255,255,255,0.4),
                            inset 0 -2px 8px rgba(0,0,0,0.2)
                        `,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Coin shine effect */}
                        <div style={{
                            position: 'absolute',
                            top: '10%', left: '15%',
                            width: '40%', height: '35%',
                            borderRadius: '50%',
                            background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)',
                            transform: 'rotate(-30deg)',
                        }} />
                        {/* Rupee symbol */}
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: 900,
                            color: '#7a4f00',
                            textShadow: '0 1px 2px rgba(255,255,255,0.3), 0 -1px 2px rgba(0,0,0,0.2)',
                            lineHeight: 1,
                            fontFamily: 'Arial, sans-serif',
                            zIndex: 1,
                        }}>₹</div>
                        {/* Coin edge lines */}
                        <div style={{
                            position: 'absolute',
                            inset: 4,
                            borderRadius: '50%',
                            border: '2px solid rgba(200,134,10,0.5)',
                        }} />
                    </div>
                </div>
            </div>

            {/* Brand name */}
            <div style={{ textAlign: 'center', marginBottom: 32, zIndex: 1 }}>
                <div style={{
                    fontSize: '2.8rem',
                    fontWeight: 900,
                    fontFamily: 'Space Grotesk, sans-serif',
                    background: 'linear-gradient(135deg, #0d9488, #16a34a, #f5c842)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em',
                    marginBottom: 6,
                }}>
                    DhanSetu
                </div>
                <div style={{
                    fontSize: '0.9rem',
                    color: '#8b7355',
                    fontWeight: 400,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                }}>
                    AI Debt Recovery Platform
                </div>
            </div>

            {/* AI feature pills */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 480, zIndex: 1 }}>
                {['🤖 XGBoost AI', '🌐 23 Languages', '🔊 TTS + STT', '📊 Real-time Analytics', '🛡️ RBI Compliant'].map((pill, i) => (
                    <div key={pill} style={{
                        padding: '5px 14px',
                        borderRadius: 999,
                        border: '1px solid rgba(13,148,136,0.4)',
                        background: 'rgba(13,148,136,0.1)',
                        color: '#5a3e28',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        animation: `fadeInUp 0.5s ease ${0.1 + i * 0.1}s both`,
                    }}>
                        {pill}
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div style={{ width: 320, marginBottom: 16, zIndex: 1 }}>
                <div style={{
                    height: 4, borderRadius: 999,
                    background: 'rgba(139, 90, 43, 0.10)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, #0d9488, #16a34a, #f5c842)',
                        transition: 'width 0.1s linear',
                        boxShadow: '0 0 10px rgba(13,148,136,0.6)',
                    }} />
                </div>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: 8, fontSize: '0.72rem',
                    color: '#b3a08a',
                }}>
                    <span style={{ color: '#0d9488', fontWeight: 600 }}>{loadingTexts[textIndex]}</span>
                    <span>{progress}%</span>
                </div>
            </div>

            {/* Powered by */}
            <div style={{ fontSize: '0.65rem', color: '#b3a08a', marginTop: 8, letterSpacing: '0.1em', zIndex: 1 }}>
                POWERED BY GPT-4 · XGBOOST · RASA NLU
            </div>

            <style>{`
                @keyframes coin3dSpin {
                    0%   { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }
                @keyframes pulseRing {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50%       { transform: scale(1.08); opacity: 1; }
                }
                @keyframes spinSlow {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes floatParticle {
                    from { transform: translateY(0px) scale(1); }
                    to   { transform: translateY(-20px) scale(1.3); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
