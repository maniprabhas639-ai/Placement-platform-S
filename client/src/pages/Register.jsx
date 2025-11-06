import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (error) {
      setErr(error?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white/5 rounded-lg">
      <h2 className="text-2xl mb-4">Register</h2>
      {err && <div className="text-red-400 mb-3">{err}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name" required className="w-full p-3 rounded bg-black/60" />
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full p-3 rounded bg-black/60" />
        <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" required className="w-full p-3 rounded bg-black/60" />
        <button disabled={loading} type="submit" className="w-full py-3 rounded bg-gradient-to-r from-pink-400 to-violet-400">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-sm">Have an account? <Link to="/login" className="underline">Login</Link></p>
    </div>
  );
}
