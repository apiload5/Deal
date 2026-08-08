'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#f8fafc' }}>
      <h2>Something went wrong</h2>
      <p style={{ fontSize: '12px', opacity: 0.8 }}>{error?.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={() => reset()}
        style={{ padding: '8px 16px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        Try Again
      </button>
    </div>
  );
}
