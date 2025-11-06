import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setErr(error?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white/5 rounded-lg">
      <h2 className="text-2xl mb-4">Login</h2>
      {err && <div className="text-red-400 mb-3">{err}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full p-3 rounded bg-black/60" />
        <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" required className="w-full p-3 rounded bg-black/60" />
        <button disabled={loading} type="submit" className="w-full py-3 rounded bg-gradient-to-r from-pink-400 to-violet-400">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-sm">No account? <Link to="/register" className="underline">Register</Link></p>
    </div>
  );
}
