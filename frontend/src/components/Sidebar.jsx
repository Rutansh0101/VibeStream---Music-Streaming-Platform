import {assets} from '../assets/frontend-assets/assets'
import { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiPlus, FiMusic } from 'react-icons/fi';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { authHeader } = useContext(AuthContext);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    
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
    
    if(location.pathname === '/add-song' || location.pathname === '/create-playlist'){
        return null;
    }
    
    return (
        <div className='w-[25%] h-full p-2 flex-col gap-2 text-white hidden lg:flex'>
            <div className='bg-[#121212] h-[15%] rounded flex flex-col justify-around'>
                <div onClick={()=>navigate('/')} className='flex items-center gap-3 pl-8 cursor-pointer'>
                    <img src={assets.home_icon} className='w-6'/>
                    <p className='font-bold'>Home</p>
                </div>
                <div onClick={()=>navigate('/search')} className='flex items-center gap-3 pl-8 cursor-pointer'>
                    <img src={assets.search_icon} className='w-6'/>
                    <p className='font-bold'>Search</p>
                </div>
            </div>
            <div className='bg-[#121212] h-[85%] rounded flex flex-col overflow-hidden'>
                <div className='p-4 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <img src={assets.stack_icon} alt='stack' className='w-8'/>
                        <p className='font-semibold'>Your Library</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <button onClick={()=>navigate('/create-playlist')} title="Create playlist">
                            <img src={assets.plus_icon} alt='plus' className='w-5'/>
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
                                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                                    className="flex items-center gap-3 p-2 hover:bg-[#282828] rounded cursor-pointer"
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
                            ))}
                        </div>
                    ) : !loading ? (
                        <div className='p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4'>
                            <h1>Create Your First Playlist</h1>
                            <p className='font-light'>it's easy, we'll help you</p>
                            <button onClick={()=>navigate('/create-playlist')} className='px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4 cursor-pointer'>Create Playlist</button>
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Loading playlists...
                        </div>
                    )}
                    
                    <div className='p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4'>
                        <h1>Upload A New Song</h1>
                        <p className='font-light'>Make Yourself A Part Of VibeStream Community</p>
                        <button onClick={()=>navigate('/add-song')} className='px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4 cursor-pointer'>Continue</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;