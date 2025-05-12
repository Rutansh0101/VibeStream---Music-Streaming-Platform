import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { FiMusic, FiDisc, FiLoader, FiPlay, FiUser } from 'react-icons/fi';
import { PlayerContext } from '../context/PlayerContext';
import { format } from 'date-fns';

function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playWithId, setCurrentPlaylist } = useContext(PlayerContext);
  
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        
        // Fetch artist details
        const artistResponse = await axios.get(`http://localhost:4000/api/users/${id}`);
        
        if (artistResponse.data.success) {
          setArtist(artistResponse.data.user);
        } else {
          setError('Artist not found');
          return;
        }
        
        // Fetch artist's songs
        const songsResponse = await axios.get(`http://localhost:4000/api/songs/by-user/${id}`);
        if (songsResponse.data.success) {
          setSongs(songsResponse.data.songs);
        }
        
        // Fetch artist's albums
        const albumsResponse = await axios.get(`http://localhost:4000/api/albums/by-user/${id}`);
        if (albumsResponse.data.success) {
          setAlbums(albumsResponse.data.albums);
        }
        
      } catch (error) {
        console.error('Error fetching artist data:', error);
        setError('Failed to load artist details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtistData();
  }, [id]);
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  const handlePlaySong = (song) => {
    setCurrentPlaylist([song]);
    playWithId(song._id);
  };
  
  const playAllSongs = () => {
    if (songs.length > 0) {
      setCurrentPlaylist(songs);
      playWithId(songs[0]._id);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-b from-[#121212] to-[#191414]">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <FiLoader size={40} className="animate-spin text-[#E91429]" />
        </div>
      </div>
    );
  }
  
  if (error || !artist) {
    return (
      <div className="min-h-full bg-gradient-to-b from-[#121212] to-[#191414]">
        <Navbar />
        <div className="text-center py-10">
          <p className="text-white text-xl mb-4">{error || 'Artist not found'}</p>
          <button 
            onClick={() => navigate('/search')}
            className="px-4 py-2 bg-[#E91429] text-white rounded-full"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-full bg-gradient-to-b from-[#121212] to-[#191414]">
      <Navbar />
      
      <div className="px-6 py-8">
        {/* Artist Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-10">
          <div className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden bg-[#282828] flex-shrink-0">
            {artist.profilePic ? (
              <img 
                src={artist.profilePic} 
                alt={artist.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <FiUser className="text-gray-400 text-6xl" />
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left">
            <p className="text-white text-sm font-medium mb-2">Artist</p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">{artist.name}</h1>
            <p className="text-gray-300">
              Joined {formatDate(artist.createdAt)} • {songs.length} songs • {albums.length} albums
            </p>
            {artist.bio && (
              <p className="text-gray-300 mt-2 max-w-3xl">{artist.bio}</p>
            )}
          </div>
        </div>
        
        {/* Play Button */}
        {songs.length > 0 && (
          <div className="mb-10">
            <button 
              onClick={playAllSongs}
              className="bg-[#E91429] text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#fa1b38] transition-colors shadow-lg"
            >
              <FiPlay size={20} className="ml-1" />
            </button>
          </div>
        )}
        
        {/* Popular Songs */}
        {songs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Popular</h2>
            <div className="grid grid-cols-1 gap-2">
              {songs.slice(0, 5).map((song, index) => (
                <div 
                  key={song._id}
                  onClick={() => handlePlaySong(song)}
                  className="flex items-center p-3 rounded-md hover:bg-[#ffffff1a] cursor-pointer"
                >
                  <div className="w-6 text-center text-gray-400 mr-4">{index + 1}</div>
                  <div className="w-12 h-12 bg-[#282828] rounded overflow-hidden mr-3">
                    {song.image ? (
                      <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <FiMusic className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{song.name}</p>
                    <p className="text-gray-400 text-sm truncate">{song.desc}</p>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {song.duration || '0:00'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Albums */}
        {albums.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {albums.map(album => (
                <div 
                  key={album._id}
                  onClick={() => navigate(`/album/${album._id}`)}
                  className="bg-[#181818] hover:bg-[#282828] p-4 rounded-md cursor-pointer transition-colors"
                >
                  <div className="aspect-square bg-[#282828] mb-4 rounded overflow-hidden">
                    {album.image ? (
                      <img src={album.image} alt={album.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <FiDisc className="text-gray-400 text-4xl" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-bold truncate">{album.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{formatDate(album.releaseDate || album.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* All Songs */}
        {songs.length > 5 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">All Songs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {songs.slice(5).map(song => (
                <div 
                  key={song._id}
                  onClick={() => handlePlaySong(song)}
                  className="flex items-center p-3 rounded-md bg-[#181818] hover:bg-[#282828] cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[#282828] rounded overflow-hidden mr-3">
                    {song.image ? (
                      <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <FiMusic className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{song.name}</p>
                    <p className="text-gray-400 text-sm truncate">{song.desc}</p>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {song.duration || '0:00'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArtistProfile;