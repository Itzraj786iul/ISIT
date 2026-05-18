import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ISIC — Indian School of Innovation and Curiosity',
    short_name: 'ISIC',
    description: 'AI-powered adaptive learning, mastery tracking, and tools for schools and families.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#020617',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/brand/isic-logo-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
