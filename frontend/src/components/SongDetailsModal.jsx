import React, { useState, useEffect, useContext, useRef } from 'react';
import { FiMusic, FiX, FiPlay, FiPlusCircle, FiCheck, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import { toast } from 'react-toastify';

function SongDetailsModal({ song, onClose, onPlay }) {
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const { authHeader } = useContext(AuthContext);
  const { playWithId } = useContext(PlayerContext);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showPlaylists && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          buttonRef.current && 
          !buttonRef.current.contains(event.target)) {
        setShowPlaylists(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPlaylists]);

  // Fetch user's playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get(
          'http://localhost:4000/api/playlists/user',
          {
            headers: authHeader(),
            withCredentials: true
          }
        );

        if (response.data.success) {
          setPlaylists(response.data.playlists);
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
        toast.error("Couldn't load your playlists");
      } finally {
        setLoadingPlaylists(false);
      }
    };

    fetchPlaylists();
  }, [authHeader]);

  // Handle add to playlist
  const handleAddToPlaylist = async (playlistId) => {
    setAddingToPlaylist(true);
    setSelectedPlaylist(playlistId);

    try {
      const response = await axios.post(
        `http://localhost:4000/api/playlists/${playlistId}/add-song`,
        { songId: song._id },
        {
          headers: authHeader(),
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success(`Added to playlist successfully!`);
        // Close the playlists dropdown after successful addition
        setShowPlaylists(false);
      } else {
        toast.error(response.data.message || "Failed to add to playlist");
      }
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error(error.response?.data?.message || "Error adding to playlist");
    } finally {
      setAddingToPlaylist(false);
      setSelectedPlaylist(null);
    }
  };

  // Handle play button click
  const handlePlay = () => {
    if (onPlay) {
      onPlay(song);
    } else if (playWithId) {
      playWithId(song._id);
    }
    onClose();
  };

  // Format song duration if available
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-[#282828] w-full max-w-md rounded-lg shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Song Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Song info */}
        <div className="p-6">
          <div className="flex mb-6">
            <div className="w-24 h-24 bg-[#333] rounded overflow-hidden flex-shrink-0">
              {song.image ? (
                <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiMusic size={36} className="text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="ml-4">
              <h3 className="text-xl font-bold text-white">{song.name}</h3>
              <p className="text-gray-400">{song.user?.name || "Unknown artist"}</p>
              {song.duration && (
                <p className="text-gray-500 text-sm mt-1">
                  Duration: {song.duration}
                </p>
              )}
            </div>
          </div>
          
          {song.desc && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-1">About this song</h4>
              <p className="text-white text-sm">{song.desc}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={handlePlay}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white py-2.5 rounded-full font-medium flex items-center justify-center gap-2"
            >
              <FiPlay /> Play Song
            </button>
            
            {/* Fixed positioning for dropdown menu */}
            <div className="relative" style={{ zIndex: 9999 }}>
              <button 
                ref={buttonRef}
                onClick={() => setShowPlaylists(!showPlaylists)}
                className="w-full bg-transparent hover:bg-[#ffffff1a] border border-[#ffffff4d] text-white py-2.5 rounded-full font-medium flex items-center justify-center gap-2"
              >
                <FiPlusCircle /> Add to Playlist
              </button>
              
              {showPlaylists && (
                <div 
                  ref={dropdownRef}
                  className="fixed mt-2 bg-[#282828] rounded-md shadow-lg border border-[#ffffff1a] max-h-60 overflow-y-auto z-[9999]"
                  style={{ 
                    width: buttonRef.current ? buttonRef.current.offsetWidth : 'auto',
                    left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left : 'auto',
                    top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 5 : 'auto'
                  }}
                >
                  {loadingPlaylists ? (
                    <div className="flex items-center justify-center p-4">
                      <FiLoader className="animate-spin text-gray-400" size={20} />
                    </div>
                  ) : playlists.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-gray-400 text-sm">No playlists found</p>
                      <button 
                        onClick={() => {
                          onClose();
                          window.location.href = '/create-playlist';
                        }}
                        className="mt-2 text-[#1DB954] text-sm hover:underline"
                      >
                        Create a playlist
                      </button>
                    </div>
                  ) : (
                    <div className="py-1">
                      {playlists.map((playlist) => (
                        <button
                          key={playlist._id}
                          onClick={() => handleAddToPlaylist(playlist._id)}
                          disabled={addingToPlaylist}
                          className="w-full flex items-center px-4 py-3 hover:bg-[#ffffff1a] text-left border-b border-[#ffffff1a] last:border-b-0"
                        >
                          <div className="w-8 h-8 bg-[#333] rounded overflow-hidden mr-3 flex-shrink-0">
                            {playlist.image ? (
                              <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiMusic size={16} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <span className="flex-1 text-white truncate">{playlist.name}</span>
                          {selectedPlaylist === playlist._id && addingToPlaylist ? (
                            <FiLoader className="animate-spin text-gray-400 ml-2" size={16} />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Add padding at bottom to ensure space for dropdown if needed */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
}

export default SongDetailsModal;