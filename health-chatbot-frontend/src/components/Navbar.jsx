import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]); // update when route changes

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-wide hover:text-indigo-200">
          🧠 MindCare
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-indigo-200 transition">Home</Link>

          {!user ? (
            <>
              <Link to="/login" className="hover:text-indigo-200 transition">Login</Link>
              <Link to="/signup" className="hover:text-indigo-200 transition">Signup</Link>
            </>
          ) : (
            <>
              <span className="text-sm font-medium">Hi, {user.name.split(' ')[0]} 👋</span>
              <Link to="/profile" className="hover:text-indigo-200 transition">Profile</Link>
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
