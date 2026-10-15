import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div><p className="font-display text-6xl font-extrabold text-accent">404</p><h1 className="mt-2 text-2xl font-bold">That page does not exist</h1>
        <p className="mt-1 text-dim">Check the address or go back to the start.</p><Link to="/" className="btn-primary mt-5 inline-flex">Go home</Link></div>
    </div>
  );
}
