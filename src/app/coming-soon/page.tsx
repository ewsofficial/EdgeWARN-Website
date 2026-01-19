'use client';

import Link from 'next/link';
import LightningEffect from '@/components/LightningEffect';

export default function ComingSoon() {
  return (
    <main className="hero relative min-h-screen flex items-center justify-center p-12 overflow-hidden">
      <div className="bg-orb" aria-hidden="true"></div>
      <LightningEffect />
      <div className="content relative z-10 w-full max-w-[1040px] p-9">
        <div className="card">
            <div className="brand-container">
                <div className="logo-wrapper">
                    <img src="/assets/EdgeWARN.png" alt="EdgeWARN Logo" className="logo-img" />
                </div>
                <div className="brand-text">
                    <h1 className="brand" style={{ fontSize: '4rem' }}>Coming Soon</h1>
                </div>
            </div>
            <p className="sub">EdgeWARN is currently in active development.</p>
            <p className="sub" style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                We are currently finalizing the design of the backend server to ensure a robust and reliable
                nowcasting experience.
            </p>
            <div className="actions">
                <Link href="/" className="btn btn-ghost">Back to Home</Link>
            </div>
        </div>
      </div>
    </main>
  );
}
