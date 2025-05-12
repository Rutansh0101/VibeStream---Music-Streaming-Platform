import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { FiPlus, FiMusic, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';

function UserPlaylists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authHeader } = useContext(AuthContext);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'http://localhost:4000/api/playlists/user', 
          { 
            headers: authHeader(),
            withCredentials: true 
          }
        );

        if (response.data.success) {
          setPlaylists(response.data.playlists);
        } else {
          toast.error('Failed to load playlists');
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
        toast.error('Error loading playlists');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div className='min-h-full bg-gradient-to-b from-[#121212] to-[#191414]'>
      <Navbar />
      <ToastContainer theme="dark" />
      
      <div className='container mx-auto px-6 py-8'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-3xl font-bold text-white'>Your Playlists</h1>
          <Link 
            to='/create-playlist' 
            className='flex items-center gap-2 bg-[#E91429] hover:bg-[#fa1b38] text-white px-4 py-2 rounded-full transition-colors'
          >
            <FiPlus /> Create Playlist
          </Link>
        </div>
        
        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <FiLoader size={40} className="animate-spin text-[#E91429]" />
          </div>
        ) : playlists.length > 0 ? (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
            {playlists.map(playlist => (
              <Link 
                key={playlist._id} 
                to={`/playlist/${playlist._id}`}
                className='bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-colors'
              >
                <div className='aspect-square bg-[#282828] mb-4 rounded-md overflow-hidden'>
                  {playlist.image ? (
                    <img 
                      src={playlist.image} 
                      alt={playlist.name} 
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-[#181818]'>
                      <FiMusic size={40} className='text-gray-400' />
                    </div>
                  )}
                </div>
                <h3 className='text-white font-bold truncate'>{playlist.name}</h3>
                <p className='text-gray-400 text-sm mt-1'>
                  {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className='bg-[#181818] rounded-lg p-10 text-center'>
            <FiMusic size={60} className='mx-auto mb-4 text-gray-400' />
            <h2 className='text-white text-xl font-bold mb-2'>No playlists yet</h2>
            <p className='text-gray-400 mb-6'>Create your first playlist to start organizing your music</p>
            <Link 
              to='/create-playlist' 
              className='bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors inline-flex items-center gap-2'
            >
              <FiPlus /> Create Playlist
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPlaylists;