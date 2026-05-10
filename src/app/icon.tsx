import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/** App icon — cyan “I” on cosmic gradient (no external asset required). */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #030712 0%, #0e7490 55%, #06b6d4 100%)',
          borderRadius: 8,
          color: '#ecfeff',
          fontSize: 19,
          fontWeight: 800,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        I
      </div>
    ),
    { ...size }
  );
}
