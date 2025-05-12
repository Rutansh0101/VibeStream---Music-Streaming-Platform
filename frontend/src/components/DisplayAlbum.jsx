import React, { useState, useEffect, useContext, useCallback } from 'react';
import Navbar from './Navbar';
import { useParams } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import { FiLoader, FiMusic, FiClock } from 'react-icons/fi';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';

function DisplayAlbum() {
    const { id } = useParams();
    const { playWithId, setCurrentPlaylist } = useContext(PlayerContext);
    const { authHeader } = useContext(AuthContext);
    
    const [album, setAlbum] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bgColor, setBgColor] = useState("#121212"); // Default background color
    
    const memoizedSetPlaylist = useCallback((playlist) => {
      setCurrentPlaylist(playlist);
    }, [setCurrentPlaylist]);

    // Format date for display
    const formatDate = (dateString) => {
      try {
        return format(new Date(dateString), 'MMM d, yyyy');
      } catch (error) {
        return 'Unknown date';
      }
    };

    // Calculate total duration
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

    // Fetch album and its songs
    const fetchAlbumData = useCallback(async () => {
      try {
        setLoading(true);
        
        // Fetch album details
        const albumResponse = await axios.get(`http://localhost:4000/api/albums/${id}`);
        
        if (albumResponse.data.success && albumResponse.data.album) {
          setAlbum(albumResponse.data.album);
          
          // If album has a background color, set it
          if (albumResponse.data.album.bgColor) {
            setBgColor(albumResponse.data.album.bgColor);
          }
          
          // If album has songs, use them directly
          if (albumResponse.data.album.songs && albumResponse.data.album.songs.length > 0) {
            setSongs(albumResponse.data.album.songs);
            
            // Set this album's songs as the current playlist for continuous play
            memoizedSetPlaylist(albumResponse.data.album.songs);
          }
        } else {
          setError('Album not found');
        }
      } catch (error) {
        console.error('Error fetching album:', error);
        setError('Failed to load album. Please try again later.');
        toast.error('Failed to load album data');
      } finally {
        setLoading(false);
      }
    }, [id, memoizedSetPlaylist]);

    // Load album data on mount
    useEffect(() => {
      fetchAlbumData();
    }, []);

    // Handle song click to play it
    const handlePlaySong = (songId) => {
      if (songs.length > 0) {
        playWithId(songId);
      }
    };

    const gradientStyle = {
      background: `linear-gradient(to bottom, ${bgColor}, #191414)`
    };

    if (loading) {
      return (
        <div className="min-h-full" style={gradientStyle}>
          <Navbar />
          <div className='flex justify-center items-center h-[70vh]'>
            <FiLoader size={40} className="animate-spin text-[#E91429]" />
          </div>
        </div>
      );
    }

    if (error || !album) {
      return (
        <div className='min-h-full bg-gradient-to-b from-[#121212] to-[#191414]'>
          <Navbar />
          <div className='flex flex-col items-center justify-center h-[70vh]'>
            <p className='text-white text-xl mb-4'>{error || 'Album not found'}</p>
            <button
              onClick={fetchAlbumData}
              className='bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors'
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }


    return (
      <div className={`min-h-full bg-gradient-to-b from-[${bgColor}] to-[#191414]`}>
        <Navbar />
        <ToastContainer theme="dark" />
        
        <div className='mt-10 px-6 flex gap-8 flex-col md:flex-row md:items-end'>
          {album.image ? (
            <img src={album.image} alt={album.name} className='rounded shadow-2xl w-48 md:w-60'/>
          ) : (
            <div className='w-48 md:w-60 aspect-square flex items-center justify-center bg-gray-800 rounded shadow-2xl'>
              <FiMusic size={48} className='text-gray-600' />
            </div>
          )}
          
          <div className='flex flex-col'>
            <p className='text-white opacity-80'>Album</p>
            <h2 className='text-4xl sm:text-5xl md:text-7xl font-bold mb-4 text-white'>{album.name}</h2>
            <p className='text-white opacity-80 line-clamp-2'>{album.desc}</p>
            <p className='mt-2 text-white opacity-80'>
              <span className='font-medium'>{album.user?.name || 'Unknown artist'}</span>
              {' • '}
              <span>{formatDate(album.releaseDate)}</span>
              {' • '}
              <span>{songs.length} songs, {getTotalDuration()}</span>
            </p>
          </div>
        </div>
        
        <div className='px-6 mt-10 mb-4'>
          <div className='grid grid-cols-12 text-[#a7a7a7] text-sm py-2 border-b border-gray-700'>
            <div className='col-span-1 text-center'>#</div>
            <div className='col-span-5'>TITLE</div>
            <div className='col-span-4 hidden sm:block'>DATE ADDED</div>
            <div className='col-span-2 text-center'>
              <FiClock className="inline" />
            </div>
          </div>
          
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <div 
                key={song._id}
                onClick={() => handlePlaySong(song._id)}
                className='grid grid-cols-12 p-2 items-center text-white hover:bg-[#ffffff1a] rounded cursor-pointer group'
              >
                <div className='col-span-1 text-center text-[#a7a7a7] group-hover:text-white'>{index + 1}</div>
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
                <div className='col-span-2 text-sm text-gray-400 text-center'>
                  {song.duration || '0:00'}
                </div>
              </div>
            ))
          ) : (
            <div className='py-16 text-center text-gray-400'>
              <p className='mb-2'>This album doesn't have any songs yet.</p>
            </div>
          )}
        </div>
      </div>
    );
}

export default DisplayAlbum;