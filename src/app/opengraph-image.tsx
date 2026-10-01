import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { PROFILE } from '@/content/profile';

export const alt = `${PROFILE.name}, ${PROFILE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Share card shown when the site link is posted on LinkedIn, WhatsApp, X, etc. Generated at build time. */
export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), 'public/images/naveen-square.jpg'));
  const src = `data:image/jpeg;base64,${photo.toString('base64')}`;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 56,
        padding: '0 80px',
        color: '#f3efe7',
        background:
          'radial-gradient(circle at 15% 20%, #5b2cff 0%, transparent 45%), radial-gradient(circle at 85% 80%, #00d1c1 0%, transparent 45%), radial-gradient(circle at 70% 10%, #ff7a59 0%, transparent 35%), #06060a',
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: ImageResponse renders plain <img> */}
      <img
        src={src}
        alt=""
        width={300}
        height={300}
        style={{ borderRadius: 150, border: '6px solid rgba(255,255,255,0.25)', objectFit: 'cover' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.7 }}>
          Portfolio
        </div>
        <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>{PROFILE.name}</div>
        <div style={{ fontSize: 38, marginTop: 18, opacity: 0.85 }}>
          Software Engineer · Full-stack · ML · Web3
        </div>
        <div style={{ fontSize: 28, marginTop: 14, opacity: 0.6 }}>Bengaluru, India · Google Cloud ACE</div>
      </div>
    </div>,
    size,
  );
}
