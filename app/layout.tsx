import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voxel Editor',
  description: 'Browser-based 3D voxel editor built with Next.js and Three.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
