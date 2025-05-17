import { assets } from '../assets/frontend-assets/assets'
import { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiMusic } from 'react-icons/fi';
import { MdDelete, MdClose } from 'react-icons/md';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { authHeader } = useContext(AuthContext);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Popup states
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [playlistToDelete, setPlaylistToDelete] = useState(null);
    
    useEffect(() => {
        const fetchUserPlaylists = async () => {
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
            } finally {
                setLoading(false);
            }
        };

        fetchUserPlaylists();
    }, []);

    const handleDeleteClick = (playlistId) => {
        setPlaylistToDelete(playlistId);
        setPopupMessage("Are you sure you want to delete this playlist?");
        setShowConfirmPopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(
                `http://localhost:4000/api/playlists/${playlistToDelete}`,
                {
                    headers: authHeader(),
                    withCredentials: true
                }
            );
            setPlaylists(prev => prev.filter(p => p._id !== playlistToDelete));
            setShowConfirmPopup(false);
        } catch (error) {
            setShowConfirmPopup(false);
            setPopupMessage("Failed to delete playlist.");
            setShowErrorPopup(true);
            console.error("Delete error:", error);
        }
    };

    if (location.pathname === '/add-song' || location.pathname === '/create-playlist') {
        return null;
    }

    return (
        <>
            <div className='w-[25%] h-full p-2 flex-col gap-2 text-white hidden lg:flex'>
                <div className='bg-[#121212] h-[15%] rounded flex flex-col justify-around'>
                    <div onClick={() => navigate('/')} className='flex items-center gap-3 pl-8 cursor-pointer'>
                        <img src={assets.home_icon} className='w-6' />
                        <p className='font-bold'>Home</p>
                    </div>
                    <div onClick={() => navigate('/search')} className='flex items-center gap-3 pl-8 cursor-pointer'>
                        <img src={assets.search_icon} className='w-6' />
                        <p className='font-bold'>Search</p>
                    </div>
                </div>
                <div className='bg-[#121212] h-[85%] rounded flex flex-col overflow-hidden'>
                    <div className='p-4 flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <img src={assets.stack_icon} alt='stack' className='w-8' />
                            <p className='font-semibold'>Your Library</p>
                        </div>
                        <div className='flex items-center gap-3'>
                            <button onClick={() => navigate('/create-playlist')} title="Create playlist">
                                <img src={assets.plus_icon} alt='plus' className='w-5' />
                            </button>
                        </div>
                    </div>

                    {/* Playlists Section */}
                    <div className="flex-1 overflow-y-auto pb-4">
                        {playlists.length > 0 ? (
                            <div className="px-2">
                                <h3 className="font-bold text-sm text-gray-400 px-2 mt-2 mb-3">YOUR PLAYLISTS</h3>
                                {playlists.map(playlist => (
                                    <div
                                        key={playlist._id}
                                        className="flex items-center gap-3 p-2 hover:bg-[#282828] rounded cursor-pointer group"
                                    >
                                        <div
                                            onClick={() => navigate(`/playlist/${playlist._id}`)}
                                            className="flex items-center gap-3 flex-1"
                                        >
                                            <div className="w-10 h-10 bg-[#282828] rounded overflow-hidden flex-shrink-0">
                                                {playlist.image ? (
                                                    <img
                                                        src={playlist.image}
                                                        alt={playlist.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#333333]">
                                                        <FiMusic className="text-gray-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-medium truncate">{playlist.name}</p>
                                                <p className="text-xs text-gray-400">Playlist • {playlist.songs.length} songs</p>
                                            </div>
                                        </div>
                                        <button
                                            title="Delete Playlist"
                                            onClick={() => handleDeleteClick(playlist._id)}
                                            className="text-gray-400 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <MdDelete />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : !loading ? (
                            <div className='p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4'>
                                <h1>Create Your First Playlist</h1>
                                <p className='font-light'>it's easy, we'll help you</p>
                                <button onClick={() => navigate('/create-playlist')} className='px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4 cursor-pointer'>Create Playlist</button>
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                Loading playlists...
                            </div>
                        )}
                        {location.pathname !== '/playlists' &&
                            <div className='bg-[#121212] py-2 px-3 hover:bg-[#303030] border w-fit rounded-full border-[#343333] m-3 font-semibold flex items-center justify-between cursor-pointer' onClick={() => navigate('/playlists')}>
                                <h2 className=''>
                                    View All Playlists
                                </h2>
                            </div>
                        }

                        <div className='p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4'>
                            <h1>Upload A New Song</h1>
                            <p className='font-light'>Make Yourself A Part Of VibeStream Community</p>
                            <button onClick={() => navigate('/add-song')} className='px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4 cursor-pointer'>Continue</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Popup */}
            {showConfirmPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmPopup(false)}></div>
                    <div className="relative bg-[#282828] p-6 rounded-md shadow-lg max-w-md w-full mx-4">
                        <button 
                            onClick={() => setShowConfirmPopup(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white"
                        >
                            <MdClose size={20} />
                        </button>
                        <h3 className="text-white text-lg font-bold mb-4">Confirm Deletion</h3>
                        <p className="text-gray-200 mb-6">{popupMessage}</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmPopup(false)}
                                className="px-4 py-2 bg-[#333333] text-white rounded-full hover:bg-opacity-80 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-opacity-80 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Popup */}
            {showErrorPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowErrorPopup(false)}></div>
                    <div className="relative bg-[#282828] p-6 rounded-md shadow-lg max-w-md w-full mx-4">
                        <button 
                            onClick={() => setShowErrorPopup(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white"
                        >
                            <MdClose size={20} />
                        </button>
                        <h3 className="text-white text-lg font-bold mb-2">Error</h3>
                        <p className="text-gray-200 mb-4">{popupMessage}</p>
                        <button
                            onClick={() => setShowErrorPopup(false)}
                            className="px-4 py-2 bg-[#1DB954] text-white rounded-full hover:bg-opacity-80 transition float-right"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Sidebar;