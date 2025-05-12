import React, { useState, useEffect, useContext } from 'react';
import Navbar from './Navbar';
import { FiLoader, FiTrash2, FiPlus, FiMusic, FiDatabase } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

function ListAlbum() {
  const navigate = useNavigate();
  const { authHeader } = useContext(AuthContext);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Fetch user's albums
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/albums/user/albums', {
        headers: authHeader()
      });

      if (response.data.success) {
        setAlbums(response.data.albums);
      } else {
        setError('Failed to load your albums');
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
      setError('Failed to load your albums. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Load albums on component mount
  useEffect(() => {
    fetchAlbums();
  }, []);

  // Handle album deletion
  const handleDeleteAlbum = async (id) => {
    try {
      setDeleting(id);

      // Make sure withCredentials is included and headers are properly set
      const response = await axios.post(
        'http://localhost:4000/api/albums/remove',
        { id },
        {
          headers: authHeader(),
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Album deleted successfully');
        // Update albums list
        setAlbums(albums.filter(album => album._id !== id));
      } else {
        toast.error('Failed to delete album');
      }
    } catch (error) {
      console.error('Error deleting album:', error);

      // More specific error message based on response
      const errorMessage = error.response?.data?.message || 'Failed to delete album';
      toast.error(errorMessage);

      // If unauthorized, could prompt user to login again
      if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this album");
      }
    } finally {
      setDeleting(null);
    }
  };

  // Handle navigation to album detail
  const handleViewAlbum = (id) => {
    navigate(`/album/${id}`);
  };

  return (
    <div className='flex flex-col gap-5 min-h-full bg-gradient-to-b from-[#121212] to-[#191414] pb-12'>
      <Navbar />
      <ToastContainer theme="dark" />

      <div className='text-white max-w-6xl mx-auto px-6 w-full'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>Your Albums</h1>
          <button
            onClick={() => navigate('/add-album')}
            className='bg-[#E91429] hover:bg-[#fa1b38] text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 transition-colors'
          >
            <FiPlus /> Create Album
          </button>
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <FiLoader size={32} className="animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className='bg-[#282828] rounded-lg shadow-lg p-8 text-center'>
            <p className='text-red-400 mb-4'>{error}</p>
            <button
              onClick={fetchAlbums}
              className='bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors'
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {albums.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {albums.map((album) => (
                  <div
                    key={album._id}
                    className='bg-[#282828] rounded-lg shadow-lg overflow-hidden hover:bg-[#3E3E3E] transition-colors group'
                  >
                    <div className='relative'>
                      <div 
                        className='cursor-pointer'
                        onClick={() => handleViewAlbum(album._id)}
                      >
                        {album.image ? (
                          <img 
                            src={album.image} 
                            alt={album.name} 
                            className='w-full aspect-square object-cover'
                          />
                        ) : (
                          <div className='w-full aspect-square flex items-center justify-center bg-gray-700'>
                            <FiMusic size={48} className='text-gray-300' />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAlbum(album._id)}
                        disabled={deleting === album._id}
                        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-red-900 ${deleting === album._id ? 'opacity-100' : ''}`}
                        title="Delete album"
                      >
                        {deleting === album._id ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                    <div 
                      className='p-4 cursor-pointer'
                      onClick={() => handleViewAlbum(album._id)}
                    >
                      <h3 className='font-bold text-xl truncate'>{album.name}</h3>
                      <p className='text-gray-400 text-sm mt-1 line-clamp-2'>{album.desc}</p>
                      <div className='flex justify-between items-center mt-3 text-sm text-gray-400'>
                        <div>{formatDate(album.releaseDate)}</div>
                        <div className='flex items-center gap-1'>
                          <FiDatabase className="text-xs" />
                          <span>{album.songs?.length || 0} songs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='bg-[#282828] rounded-lg shadow-lg p-12 text-center'>
                <p className='text-xl mb-4'>You haven't created any albums yet</p>
                <button
                  onClick={() => navigate('/add-album')}
                  className='bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors'
                >
                  Create Your First Album
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ListAlbum;