'use client';
// Agentation's pointing toolbar, development only, imported inside the NODE_ENV branch so a
// production build drops it. Each note saved on an element is posted to /dev/pointed, where a
// chat reads it. The toolbar reads its theme only when it mounts, so a cook sidebar that sets it
// asks for a new mount.
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Pointing = process.env.NODE_ENV === 'development'
  ? dynamic(() => import('agentation').then((m) => function Pointing() {
      const [mount, setMount] = useState(0);
      useEffect(() => {
        const again = () => setMount((n) => n + 1);
        window.addEventListener('pointing:theme', again);
        return () => window.removeEventListener('pointing:theme', again);
      }, []);
      return <m.Agentation key={mount} webhookUrl={`${window.location.origin}/dev/pointed`} />;
    }), { ssr: false })
  : null;

export function DevTools() {
  return Pointing ? <Pointing /> : null;
}
