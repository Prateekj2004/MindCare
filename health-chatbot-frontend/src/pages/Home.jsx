import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBox from '../components/ChatBox'; // ✅ Import ChatBox

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 px-4">
      {isLoggedIn ? (
        <ChatBox /> // ✅ Show ChatBox when logged in
      ) : (
        <div className="text-center space-y-6">
          <div className="text-6xl">🔒</div>
          <h2 className="text-xl font-semibold text-gray-700">Access restricted</h2>
          <p className="text-gray-500">Please log in to access your chatbot dashboard.</p>
          <button
            onClick={handleRedirect}
            className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
