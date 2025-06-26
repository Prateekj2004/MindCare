import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      const res = await fetch('http://localhost:4000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || 'Login failed');
        return;
      }

      // Save token and user info
      localStorage.setItem('token', data.token);

      // If your backend returns name/email directly:
      if (data.name && data.email) {
        localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));
      } else {
        // Otherwise fetch user manually
        const userRes = await fetch('http://localhost:4000/api/user/me', {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const userData = await userRes.json();
        localStorage.setItem('user', JSON.stringify(userData));
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      setMsg('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Login to MindCare</h2>
        {msg && <div className="text-red-600 mb-4 text-center">{msg}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
