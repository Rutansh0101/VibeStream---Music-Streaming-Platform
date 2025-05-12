import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Logout() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the actual logout function from AuthContext
        await logout();
        
        toast.success("Logged out successfully!", {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: false,
        });
        
        // Redirect to the login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (error) {
        console.error('Error during logout:', error);
        
        toast.error("Error during logout. Please try again.", {
          position: "top-center",
          autoClose: 2000,
        });
        
        // Still redirect to login even if there was an error
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };
    
    performLogout();
  }, [navigate, logout]);
  
  return (
    <div className='h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#121212] to-[#191414]'>
      <ToastContainer theme="dark" />
      <div className='animate-pulse text-white text-2xl font-bold mb-4'>
        Logging you out...
      </div>
      <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white'></div>
    </div>
  );
}

export default Logout;