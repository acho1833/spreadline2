'use client';

import { useEffect } from 'react';

export default function Frontend1Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Load Mermaid for diagrams
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.async = true;
    script.onload = () => {
      // @ts-expect-error mermaid is loaded from CDN
      window.mermaid?.initialize({
        startOnLoad: true,
        theme: 'dark',
        securityLevel: 'loose',
        flowchart: { curve: 'basis' },
      });
      // @ts-expect-error mermaid is loaded from CDN
      window.mermaid?.run();
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return <>{children}</>;
}
