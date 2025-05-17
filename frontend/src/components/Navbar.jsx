import React, { useState, useEffect, useRef } from 'react'
import { assets } from '../assets/frontend-assets/assets'
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiPlus } from 'react-icons/fi'; // Import the plus icon

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const { currentUser, logout } = useContext(AuthContext);

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };
  
    const handleLogoutClick = async () => {
        navigate('/logout');
        setShowDropdown(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle navigation for dropdown items
    const handleProfileClick = () => {
        navigate('/profile');
        setShowDropdown(false);
    };

    const handleYourSongsClick = () => {
        navigate('/your-songs');
        setShowDropdown(false);
    };

    const handleSettingsClick = () => {
        navigate('/settings');
        setShowDropdown(false);
    };
    
    // Handler for Add Album button
    const handleAddAlbumClick = () => {
        navigate('/add-album');
    };

    // Get user's first letter for avatar fallback
    const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

    return (
        <>
            <div className='w-full flex justify-between items-center text-white font-semibold px-2'>
                <div className='flex items-center gap-2'>
                    <img onClick={() => navigate(-1)} src={assets.arrow_left} alt='arrow_left' className='w-8 bg-black p-2 rounded-2xl cursor-pointer' />
                    <img onClick={() => navigate(+1)} src={assets.arrow_right} alt='arrow_right' className='w-8 bg-black p-2 rounded-2xl cursor-pointer' />
                </div>
                <div className='flex items-center gap-4'>
                    {/* Add Album Button */}
                    {currentUser && location.pathname !== "/add-album" && (
                        <button 
                            onClick={handleAddAlbumClick}
                            className='bg-[#E91429] cursor-pointer hover:bg-[#fa1b38] text-white text-[15px] px-4 py-1 rounded-2xl flex items-center gap-1 transition-colors'
                        >
                            <FiPlus /> Add Album
                        </button>
                    )}
                    <p className='bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer'>Explore Premium</p>
                    <div className='relative' ref={dropdownRef}>
                        <div
                            onClick={toggleDropdown}
                            className='w-7 h-7 rounded-full flex items-center justify-center cursor-pointer overflow-hidden'
                        >
                            {currentUser?.profileImage ? (
                                <img 
                                    src={currentUser.profileImage} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="bg-purple-500 text-white w-full h-full flex items-center justify-center">
                                    {userInitial}
                                </div>
                            )}
                        </div>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className='absolute right-0 mt-2 w-48 bg-[#282828] rounded-md shadow-lg py-1 z-10'>
                                <div className='px-4 py-2 border-b border-gray-700'>
                                    <p className="text-sm font-medium text-white truncate">{currentUser?.name || 'User'}</p>
                                    <p className="text-xs text-gray-400 truncate">{currentUser?.email || ''}</p>
                                </div>
                                <div
                                    onClick={handleProfileClick}
                                    className='px-4 py-2 text-sm text-white hover:bg-[#3E3E3E] cursor-pointer flex items-center'
                                >
                                    Profile
                                </div>
                                <div
                                    onClick={handleYourSongsClick}
                                    className='px-4 py-2 text-sm text-white hover:bg-[#3E3E3E] cursor-pointer flex items-center'
                                >
                                    Your Songs
                                </div>
                                <div
                                    onClick={() => navigate('/playlists')}
                                    className='px-4 py-2 text-sm text-white hover:bg-[#3E3E3E] cursor-pointer flex items-center'
                                >
                                    Your Playlists
                                </div>
                                <div
                                    onClick={()=> navigate('/list-albums')}
                                    className='px-4 py-2 text-sm text-white hover:bg-[#3E3E3E] cursor-pointer flex items-center'
                                >
                                    Your Albums
                                </div>
                                <div
                                    onClick={handleSettingsClick}
                                    className='px-4 py-2 text-sm text-white hover:bg-[#3E3E3E] cursor-pointer flex items-center'
                                >
                                    Settings
                                </div>
                                <hr className='my-1 border-gray-700' />
                                <div
                                    onClick={handleLogoutClick}
                                    className='px-4 py-2 text-sm text-white hover:bg-[#3E3E3E] cursor-pointer flex items-center'
                                >
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navbar