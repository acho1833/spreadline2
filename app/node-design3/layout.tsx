import Script from 'next/script';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="mermaid"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs').then(m => {
              m.default.initialize({
                startOnLoad: true,
                theme: 'dark',
                securityLevel: 'loose',
                flowchart: { curve: 'basis' }
              });
              m.default.run();
            });
          `
        }}
      />
      {children}
    </>
  );
}
