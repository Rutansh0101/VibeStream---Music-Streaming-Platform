import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';
import { FiMusic, FiUser, FiDisc, FiList, FiSearch, FiLoader } from 'react-icons/fi';
import { PlayerContext } from '../context/PlayerContext';
import SongDetailsModal from './SongDetailsModal';

function Search() {
    const navigate = useNavigate();
    const location = useLocation();
    const { playWithId, setCurrentPlaylist } = useContext(PlayerContext);

    // Get query parameter from URL
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [searchResults, setSearchResults] = useState({
        songs: [],
        albums: [],
        playlists: [],
        artists: []
    });
    const [loading, setLoading] = useState(true);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedSong, setSelectedSong] = useState(null);

    // Fetch default content on initial load
    useEffect(() => {
        if (!searchQuery) {
            fetchDefaultContent();
        } else {
            performSearch(searchQuery);
        }
    }, []);

    // Fetch default popular content
    const fetchDefaultContent = async () => {
        setLoading(true);
        
        try {
            // Initialize with empty arrays
            let songsList = [];
            let playlistsList = [];
            let artistsList = [];
            
            try {
                // Fetch popular songs
                const songsResponse = await axios.get('http://localhost:4000/api/songs/list?limit=10');
                if (songsResponse.data.success) {
                    songsList = songsResponse.data.songs;
                }
            } catch (error) {
                console.warn('Error fetching songs:', error);
            }
            
            try {
                // Fetch playlists
                const playlistsResponse = await axios.get('http://localhost:4000/api/playlists/public');
                if (playlistsResponse.data.success) {
                    playlistsList = playlistsResponse.data.playlists;
                }
            } catch (error) {
                console.warn('Error fetching playlists:', error);
            }
            
            try {
                // Fetch artists
                const artistsResponse = await axios.get('http://localhost:4000/api/user/artists');
                if (artistsResponse.data.success) {
                    artistsList = artistsResponse.data.artists;
                }
            } catch (error) {
                console.warn('Error fetching artists:', error);
            }
            
            // Set results even if some requests failed
            setSearchResults({
                songs: songsList,
                playlists: playlistsList,
                artists: artistsList,
                albums: [] // We can fetch popular albums too if needed
            });
            
        } catch (error) {
            console.error('Error fetching default content:', error);
        } finally {
            setLoading(false);
        }
    };

    // Perform search when query changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim() !== '') {
                performSearch(searchQuery);
            }
        }, 500); // 500ms delay for typing

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Update URL when search query changes
    useEffect(() => {
        if (searchQuery) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`, { replace: true });
            setHasSearched(true);
        } else {
            navigate('/search', { replace: true });
            // Don't set hasSearched to false here - we still want to show results
        }
    }, [searchQuery, navigate]);

    const performSearch = async (query) => {
        if (!query.trim()) {
            fetchDefaultContent();
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const response = await axios.get(`http://localhost:4000/api/search?query=${encodeURIComponent(query)}`);

            if (response.data.success) {
                setSearchResults(response.data.results);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySong = (song) => {
        // Create a one-song playlist
        setCurrentPlaylist([song]);
        playWithId(song._id);
    };

    // New handler for song click to show modal instead of playing directly
    const handleSongClick = (song) => {
        setSelectedSong(song);
    };

    // Filter results based on active tab
    const getFilteredResults = () => {
        if (activeTab === 'all') {
            return searchResults;
        }

        const filteredResults = {
            songs: [],
            albums: [],
            playlists: [],
            artists: []
        };

        filteredResults[activeTab] = searchResults[activeTab];
        return filteredResults;
    };

    const filteredResults = getFilteredResults();
    const hasResults = Object.values(filteredResults).some(arr => arr && arr.length > 0);

    const getTitle = () => {
        if (searchQuery) {
            return `Results for "${searchQuery}"`;
        }
        return "Browse Music";
    };

    return (
        <div className="min-h-full bg-gradient-to-b from-[#121212] to-[#191414]">
            <Navbar />

            <div className="px-6 py-4">
                <div className="mb-6 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-6">{getTitle()}</h1>

                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for Songs, Albums, Artists..."
                            className="w-full bg-white py-3 pl-10 pr-4 rounded-full text-black placeholder-gray-500 focus:outline-none"
                        />
                        {loading && (
                            <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 animate-spin" size={20} />
                        )}
                    </div>
                </div>

                <div className="mb-6 flex gap-4 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-full ${activeTab === 'all' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white hover:bg-[#323232]'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('songs')}
                        className={`px-4 py-2 rounded-full flex items-center gap-2 ${activeTab === 'songs' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white hover:bg-[#323232]'}`}
                    >
                        <FiMusic /> Songs
                    </button>
                    <button
                        onClick={() => setActiveTab('artists')}
                        className={`px-4 py-2 rounded-full flex items-center gap-2 ${activeTab === 'artists' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white hover:bg-[#323232]'}`}
                    >
                        <FiUser /> Artists
                    </button>
                    <button
                        onClick={() => setActiveTab('albums')}
                        className={`px-4 py-2 rounded-full flex items-center gap-2 ${activeTab === 'albums' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white hover:bg-[#323232]'}`}
                    >
                        <FiDisc /> Albums
                    </button>
                </div>

                <div className="pb-20">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <FiLoader size={40} className="animate-spin text-[#E91429]" />
                        </div>
                    ) : !hasResults ? (
                        <div className="text-center py-10">
                            <p className="text-white text-xl mb-2">No results found</p>
                            <p className="text-gray-400">Try searching for something else</p>
                        </div>
                    ) : (
                        <>
                            {/* Songs Results */}
                            {(activeTab === 'all' || activeTab === 'songs') && filteredResults.songs?.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-4">Songs</h2>
                                    <div className="grid grid-cols-1 gap-2">
                                        {filteredResults.songs.map(song => (
                                            <div
                                                key={song._id}
                                                onClick={() => handleSongClick(song)}
                                                className="flex items-center p-3 rounded-md bg-[#181818] hover:bg-[#282828] cursor-pointer"
                                            >
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
                                                    <p className="text-gray-400 text-sm truncate">
                                                        {song.desc} • {song.user?.name || 'Unknown artist'}
                                                    </p>
                                                </div>
                                                <div className="text-gray-400 text-sm">
                                                    {song.duration || '0:00'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {activeTab === 'all' && filteredResults.songs.length > 5 && (
                                        <button
                                            onClick={() => setActiveTab('songs')}
                                            className="mt-2 text-gray-400 hover:text-white"
                                        >
                                            See all songs
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Playlists Results */}
                            {(activeTab === 'all' || activeTab === 'playlists') && filteredResults.playlists?.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-4">Playlists</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {filteredResults.playlists.slice(0, activeTab === 'all' ? 5 : undefined).map(playlist => (
                                            <div
                                                key={playlist._id}
                                                onClick={() => navigate(`/playlist/${playlist._id}`)}
                                                className="bg-[#181818] hover:bg-[#282828] p-4 rounded-md cursor-pointer transition-colors"
                                            >
                                                <div className="aspect-square bg-[#282828] mb-4 rounded overflow-hidden">
                                                    {playlist.image ? (
                                                        <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                                            <FiList className="text-gray-400 text-4xl" />
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-white font-bold truncate">{playlist.name}</h3>
                                                <p className="text-gray-400 text-sm truncate">
                                                    By {playlist.user?.name || 'Unknown user'} • {playlist.songs.length} songs
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {activeTab === 'all' && filteredResults.playlists.length > 5 && (
                                        <button
                                            onClick={() => setActiveTab('playlists')}
                                            className="mt-2 text-gray-400 hover:text-white"
                                        >
                                            See all playlists
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Artists Results */}
                            {(activeTab === 'all' || activeTab === 'artists') && filteredResults.artists?.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-4">Artists</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {filteredResults.artists.slice(0, activeTab === 'all' ? 5 : undefined).map(artist => (
                                            <div
                                                key={artist._id}
                                                onClick={() => navigate(`/artist/${artist._id}`)}
                                                className="bg-[#181818] hover:bg-[#282828] p-4 rounded-md cursor-pointer transition-colors text-center"
                                            >
                                                <div className="aspect-square bg-[#282828] mb-4 rounded-full overflow-hidden mx-auto w-3/4">
                                                    {artist.profilePic ? (
                                                        <img src={artist.profilePic} alt={artist.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400">
                                                            <FiUser className="text-4xl" />
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-white font-bold truncate">{artist.name}</h3>
                                                <p className="text-gray-400 text-sm">Artist</p>
                                            </div>
                                        ))}
                                    </div>
                                    {activeTab === 'all' && filteredResults.artists.length > 5 && (
                                        <button
                                            onClick={() => setActiveTab('artists')}
                                            className="mt-2 text-gray-400 hover:text-white"
                                        >
                                            See all artists
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Albums Results */}
                            {(activeTab === 'all' || activeTab === 'albums') && filteredResults.albums?.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {filteredResults.albums.slice(0, activeTab === 'all' ? 5 : undefined).map(album => (
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
                                                <p className="text-gray-400 text-sm truncate">{album.user?.name || 'Unknown artist'}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {activeTab === 'all' && filteredResults.albums.length > 5 && (
                                        <button
                                            onClick={() => setActiveTab('albums')}
                                            className="mt-2 text-gray-400 hover:text-white"
                                        >
                                            See all albums
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            {/* Show song details modal if a song is selected */}
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

export default Search;