import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { FiLoader, FiMusic, FiClock, FiMoreHorizontal, FiPlay, FiHeart, FiEdit2 } from 'react-icons/fi';
import { MdDelete, MdClose } from 'react-icons/md';
import axios from 'axios';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import SongDetailsModal from './SongDetailsModal';

function DisplayPlaylist() {
  const { id } = useParams();
  const { playWithId, setCurrentPlaylist } = useContext(PlayerContext);
  const { authHeader } = useContext(AuthContext);
  
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserPlaylist, setIsUserPlaylist] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  
  // State for song removal confirmation
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [songToRemove, setSongToRemove] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Get total duration of all songs
  const getTotalDuration = () => {
    if (!songs || songs.length === 0) return '0 min';
    
    let totalSeconds = songs.reduce((total, song) => {
      // Convert duration string "3:45" to seconds
      const parts = song.duration ? song.duration.split(':') : ['0', '0'];
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return total + (minutes * 60) + seconds;
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    } else {
      return `${minutes} min`;
    }
  };

  // Play all songs in playlist
  const playAllSongs = () => {
    if (songs.length > 0) {
      setCurrentPlaylist(songs);
      playWithId(songs[0]._id);
    }
  };

  // Show song details modal
  const handleSongClick = (song) => {
    setSelectedSong(song);
  };

  // Play song from modal
  const handlePlaySong = (song) => {
    // Make sure playlist is set as current playlist
    setCurrentPlaylist(songs);
    // Play the selected song
    playWithId(song._id);
  };

  // Check if user owns this playlist
  const checkUserOwnership = (playlist) => {
    // You'd need to compare the playlist's user ID with current user ID
    // For now using a simple check - implement based on your authContext structure
    return playlist?.user?._id === localStorage.getItem('userId');
  };

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`http://localhost:4000/api/playlists/${id}`);
        
        if (response.data.success && response.data.playlist) {
          setPlaylist(response.data.playlist);
          setSongs(response.data.playlist.songs);
          setIsUserPlaylist(checkUserOwnership(response.data.playlist));
        } else {
          setError('Playlist not found');
        }
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setError('Failed to load playlist. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  // Handle click on remove button
  const handleRemoveClick = (song, e) => {
    e.stopPropagation(); // Prevent opening song modal
    setSongToRemove(song);
    setShowRemoveConfirm(true);
  };

  // Handle actual removal after confirmation
  const removeSongFromPlaylist = async () => {
    try {
      const response = await axios.post(
        'http://localhost:4000/api/playlists/remove-song',
        { playlistId: id, songId: songToRemove._id },
        { 
          headers: authHeader(),
          withCredentials: true 
        }
      );
      
      if (response.data.success) {
        // Update the songs list
        setSongs(songs.filter(song => song._id !== songToRemove._id));
        toast.success('Song removed from playlist');
        setShowRemoveConfirm(false);
        setSongToRemove(null);
      } else {
        toast.error(response.data.message || 'Failed to remove song');
      }
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      toast.error('Error removing song');
    }
  };

  if (loading) {
    return (
      <div className='min-h-full bg-gradient-to-b from-[#121212] to-[#191414]'>
        <Navbar />
        <div className='flex justify-center items-center h-[70vh]'>
          <FiLoader size={40} className="animate-spin text-[#E91429]" />
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className='min-h-full bg-gradient-to-b from-[#121212] to-[#191414]'>
        <Navbar />
        <div className='flex flex-col items-center justify-center h-[70vh]'>
          <p className='text-white text-xl mb-4'>{error || 'Playlist not found'}</p>
          <Link
            to="/playlists"
            className='bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors'
          >
            Back to Playlists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-full bg-gradient-to-b from-[#121212] to-[#191414]'>
      <Navbar />
      <ToastContainer theme="dark" />
      
      <div className='mt-10 px-6 flex gap-8 flex-col md:flex-row md:items-end'>
        {playlist.image ? (
          <img src={playlist.image} alt={playlist.name} className='rounded shadow-2xl w-48 md:w-60 h-60 object-cover'/>
        ) : (
          <div className='w-48 md:w-60 aspect-square flex items-center justify-center bg-gray-800 rounded shadow-2xl'>
            <FiMusic size={48} className='text-gray-600' />
          </div>
        )}
        
        <div className='flex flex-col'>
          <p className='text-white opacity-80'>Playlist</p>
          <h2 className='text-4xl sm:text-5xl md:text-7xl font-bold mb-4 text-white'>{playlist.name}</h2>
          {playlist.desc && <p className='text-white opacity-80 line-clamp-2'>{playlist.desc}</p>}
          <p className='mt-2 text-white opacity-80'>
            <span className='font-medium'>{playlist.user?.name || 'Unknown user'}</span>
            {' • '}
            <span>{formatDate(playlist.createdAt)}</span>
            {' • '}
            <span>{songs.length} songs, {getTotalDuration()}</span>
          </p>
        </div>
      </div>
      
      <div className='px-6 mt-10'>
        <div className='flex gap-4 mb-8'>
          {songs.length > 0 && (
            <button 
              onClick={playAllSongs}
              className='bg-[#E91429] cursor-pointer text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#fa1b38] transition-colors shadow-lg'
            >
              <FiPlay size={20} className="ml-1" />
            </button>
          )}
          
            <Link 
              to={`/edit-playlist/${playlist._id}`}
              className='bg-[#282828] text-white px-4 py-2 rounded-full hover:bg-[#3E3E3E] transition-colors flex items-center gap-2'
            >
              <FiEdit2 size={16} />
            </Link>
          
        </div>
        
        <div className='mb-4'>
          <div className='grid grid-cols-12 text-[#a7a7a7] text-sm py-2 border-b border-gray-700'>
            <div className='col-span-1 text-center'>#</div>
            <div className='col-span-5'>TITLE</div>
            <div className='col-span-4 hidden sm:block'>DATE ADDED</div>
            <div className='col-span-1 text-center'>
              <FiClock className="inline" />
            </div>
            <div className='col-span-1'></div>
          </div>
          
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <div 
                key={song._id}
                onClick={() => handleSongClick(song)}
                className='grid grid-cols-12 p-2 items-center text-white hover:bg-[#ffffff1a] rounded cursor-pointer group'
              >
                <div className='col-span-1 text-center text-[#a7a7a7] group-hover:text-white'>
                  {index + 1}
                </div>
                <div className='col-span-5 flex items-center gap-3'>
                  <div className='w-10 h-10 bg-[#282828] flex-shrink-0 rounded overflow-hidden'>
                    {song.image ? (
                      <img src={song.image} alt={song.name} className='w-full h-full object-cover' />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center bg-gray-700'>
                        <FiMusic className='text-gray-300' />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className='font-medium line-clamp-1'>{song.name}</p>
                    <p className='text-sm text-gray-400 line-clamp-1'>{song.desc}</p>
                  </div>
                </div>
                <div className='col-span-4 text-sm text-gray-400 hidden sm:block'>
                  {formatDate(song.createdAt)}
                </div>
                <div className='col-span-1 text-sm text-gray-400 text-center'>
                  {song.duration || '0:00'}
                </div>
                <div className='col-span-1 flex justify-end'>
                  
                    <button 
                      onClick={(e) => handleRemoveClick(song, e)}
                      className='opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-opacity flex items-center gap-1'
                      title="Remove from playlist"
                    >
                      <MdDelete size={18} />
                    </button>
                  
                </div>
              </div>
            ))
          ) : (
            <div className='py-16 text-center text-gray-400'>
              <p className='mb-2'>This playlist doesn't have any songs yet.</p>
              <p>Find songs you like and add them to this playlist!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Song Details Modal */}
      {selectedSong && (
        <SongDetailsModal
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
          onPlay={handlePlaySong}
        />
      )}

      {/* Song Removal Confirmation Modal */}
      {showRemoveConfirm && songToRemove && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRemoveConfirm(false)}></div>
          <div className="relative bg-[#282828] p-6 rounded-md shadow-lg max-w-md w-full mx-4">
            <button 
              onClick={() => setShowRemoveConfirm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <MdClose size={20} />
            </button>
            <h3 className="text-white text-lg font-bold mb-4">Remove Song</h3>
            <p className="text-gray-200 mb-6">
              Are you sure you want to remove "{songToRemove.name}" from this playlist?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 bg-[#333333] text-white rounded-full hover:bg-opacity-80 transition"
              >
                Cancel
              </button>
              <button
                onClick={removeSongFromPlaylist}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-opacity-80 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplayPlaylist;