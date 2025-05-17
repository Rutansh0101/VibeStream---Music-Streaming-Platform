import React, { useState, useEffect, useContext } from 'react';
import Navbar from './Navbar';
import { FiClock, FiDownload, FiTrash2, FiMoreHorizontal, FiMusic, FiPlus, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import SongDetailsModal from './SongDetailsModal';

function YourSongs() {
  const navigate = useNavigate();
  const { authHeader } = useContext(AuthContext);
  const { playWithId } = useContext(PlayerContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Fetch user's songs
  const fetchSongs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/songs/user-songs', {
        headers: authHeader()
      });

      if (response.data.success) {
        console.log('Fetched songs:', response.data.songs);
        setSongs(response.data.songs);
      } else {
        setError('Failed to load your songs');
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      setError('Failed to load your songs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Load songs on component mount
  useEffect(() => {
    fetchSongs();
  }, []);

  // Handle song deletion
  const handleDeleteSong = async (id, event) => {
    // Prevent click from opening the modal
    event.stopPropagation();
    
    try {
      setDeleting(id);

      // Make sure withCredentials is included and headers are properly set
      const response = await axios.post(
        'http://localhost:4000/api/songs/remove',
        { id },
        {
          headers: authHeader(),
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Song deleted successfully');
        // Update songs list
        setSongs(songs.filter(song => song._id !== id));
      } else {
        toast.error('Failed to delete song');
      }
    } catch (error) {
      console.error('Error deleting song:', error);

      // More specific error message based on response
      const errorMessage = error.response?.data?.message || 'Failed to delete song';
      toast.error(errorMessage);

      // If unauthorized, could prompt user to login again
      if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this song");
      }
    } finally {
      setDeleting(null);
    }
  };

  // Handle song click to show details
  const handleSongClick = (song) => {
    setSelectedSong(song);
  };

  // Handle play from modal
  const handlePlaySong = (song) => {
    playWithId(song._id);
  };

  return (
    <div className='flex flex-col gap-5 min-h-full bg-gradient-to-b from-[#121212] to-[#191414] pb-12'>
      <Navbar />
      <ToastContainer theme="dark" />

      <div className='text-white max-w-6xl mx-auto px-6 w-full'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>Your Songs</h1>
          <button
            onClick={() => navigate('/add-song')}
            className='bg-[#E91429] hover:bg-[#fa1b38] text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 transition-colors'
          >
            <FiPlus /> Add New Song
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
              onClick={fetchSongs}
              className='bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors'
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className='bg-[#282828] rounded-lg shadow-lg overflow-hidden'>
            <div className='grid grid-cols-12 bg-[#3E3E3E] p-4 text-sm font-medium text-gray-400'>
              <div className='col-span-1'>#</div>
              <div className='col-span-5'>TITLE</div>
              <div className='col-span-2'>ALBUM</div>
              <div className='col-span-2'>DATE ADDED</div>
              <div className='col-span-1 flex justify-center'><FiClock /></div>
              <div className='col-span-1'></div>
            </div>

            {songs.length > 0 ? (
              <>
                {songs.map((song, index) => (
                  <div
                    key={song._id}
                    onClick={() => handleSongClick(song)}
                    className='grid grid-cols-12 p-4 hover:bg-[#3E3E3E] transition-colors items-center border-b border-[#3E3E3E] last:border-b-0 group cursor-pointer'
                  >
                    <div className='col-span-1 text-gray-400'>{index + 1}</div>
                    <div className='col-span-5 font-medium flex items-center gap-3'>
                      <div className='w-12 h-12 bg-[#3E3E3E] rounded overflow-hidden'>
                        {song.image ? (
                          <img src={song.image} alt={song.name} className='w-full h-full object-cover' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center bg-gray-700'>
                            <FiMusic className='text-gray-300' />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className='font-medium'>{song.name}</p>
                        <p className='text-sm text-gray-400 truncate max-w-[300px]'>{song.desc}</p>
                      </div>
                    </div>
                    <div className='col-span-2 text-gray-400 truncate max-w-[140px]'>{song.album}</div>
                    <div className='col-span-2 text-gray-400'>{formatDate(song.createdAt)}</div>
                    <div className='col-span-1 flex justify-center text-gray-400'>{song.duration}</div>
                    <div className='col-span-1 flex justify-end'>
                      <button
                        onClick={(e) => handleDeleteSong(song._id, e)}
                        disabled={deleting === song._id}
                        className={`opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-[#4e4e4e] ${deleting === song._id ? 'opacity-100' : ''}`}
                        title="Delete song"
                      >
                        {deleting === song._id ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className='p-12 text-center text-gray-400'>
                <p className='text-xl mb-4'>You haven't added any songs yet</p>
                <button
                  onClick={() => navigate('/add-song')}
                  className='bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors'
                >
                  Add Your First Song
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Song Details Modal */}
      {selectedSong && (
        <SongDetailsModal
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
          onPlay={handlePlaySong}
        />
      )}
    </div>
  );
}

export default YourSongs;