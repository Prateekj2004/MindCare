import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [msg, setMsg] = useState('');
  const [updated, setUpdated] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return navigate('/login');

    fetch('http://localhost:4000/api/user/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.name && data.email) setUser({ name: data.name, email: data.email });
      })
      .catch(() => navigate('/login'));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    setUpdated(false);

    const res = await fetch('http://localhost:4000/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.message || 'Failed to update profile');
      return;
    }

    setUpdated(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Update Profile</h2>
        {msg && <div className="text-red-600 mb-3">{msg}</div>}
        {updated && <div className="text-green-600 mb-3">Profile updated successfully!</div>}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
