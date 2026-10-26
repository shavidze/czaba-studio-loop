import { Link } from '@remix-run/react';

export default function Login() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Sign In</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Authentication coming soon...
      </p>
      <Link to="/" className="button button-primary">
        Back to Home
      </Link>
    </div>
  );
}
