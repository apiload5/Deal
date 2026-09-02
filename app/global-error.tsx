'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Error</title>
      </head>
      <body style={{ backgroundColor: '#0a0e1a', color: '#f8fafc', padding: '2rem', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Application Error</h2>
          <p style={{ fontSize: '12px', opacity: 0.8 }}>{error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => reset()}
            style={{ padding: '8px 16px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
