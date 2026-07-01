import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-black text-slate-900">404</h1>
      <p className="mt-2 text-lg text-slate-600">This property or location does not exist.</p>
      <Link href="/" className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white shadow-md hover:bg-blue-700">
        Return Home
      </Link>
    </div>
  );
}
