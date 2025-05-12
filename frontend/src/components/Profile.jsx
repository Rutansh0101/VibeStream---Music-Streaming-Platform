import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { FiCheck, FiX, FiEdit2, FiCamera, FiLoader } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

function Profile() {
  // Add authHeader to the destructured values from AuthContext
  const { currentUser, updateProfile, isLoading, authHeader } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(currentUser.profileImage || null);
  
  // Stats state
  const [stats, setStats] = useState({
    songsAdded: 0,
    playlistsCreated: 0,
    albumsCreated: 0,
    isLoading: true
  });
  
  // User data state
  const [userData, setUserData] = useState({
    name: currentUser.name || "User",
    email: currentUser.email || "",
    isPremium: currentUser.isPremium || false,
    bio: currentUser.bio || "",
    phone: currentUser.phone || "",
    location: currentUser.location || ""
  });
  
  // Form values state
  const [formValues, setFormValues] = useState({...userData});
  
  // Fetch user stats
  useEffect(() => {
  const fetchUserStats = async () => {
    try {
      // Add withCredentials: true to send cookies along with the request
      const response = await axios.get('http://localhost:4000/api/user/stats', {
        headers: authHeader(),
        withCredentials: true // Add this line
      });
      
      if (response.data) {
        setStats({
          songsAdded: response.data.songsCount || 0,
          playlistsCreated: response.data.playlistsCount || 0,
          albumsCreated: response.data.albumsCount || 0,
          isLoading: false
        });
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setStats(prev => ({...prev, isLoading: false}));
      toast.error("Failed to load user statistics", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  fetchUserStats();
}, [currentUser._id, authHeader]);
  
  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(true);
    setFormValues({...userData}); // Reset form to current data
    setPreviewImage(currentUser.profileImage || null);
    setSelectedImage(null);
  };
  
  // Cancel edit mode
  const cancelEdit = () => {
    setIsEditing(false);
    setFormValues({...userData});
    
    // Clean up any created object URLs
    if (previewImage && !previewImage.includes('http')) {
      URL.revokeObjectURL(previewImage);
    }
    
    setPreviewImage(currentUser.profileImage || null);
    setSelectedImage(null);
  };
  
  // Save changes
  const saveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Call the updateProfile function from AuthContext
      const result = await updateProfile(formValues, selectedImage);
      
      if (result.success) {
        // Update local state with new data
        setUserData({...formValues});
        setIsEditing(false);
        
        toast.success("Profile updated successfully!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(result.error || "Failed to update profile", {
          position: "top-center",
          autoClose: 4000,
        });
      }
    } catch (error) {
      toast.error("An error occurred while saving your profile", {
        position: "top-center",
        autoClose: 4000,
      });
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
      
      // Clean up object URLs if they were created
      if (previewImage && selectedImage && !previewImage.includes('http')) {
        URL.revokeObjectURL(previewImage);
      }
    }
  };

  return (
    <div className='flex flex-col gap-5 min-h-full bg-gradient-to-b from-[#121212] to-[#191414] pb-12'>
      <Navbar />
      <ToastContainer theme="dark" />
      
      <div className='text-white max-w-4xl mx-auto px-6 w-full'>
        <h1 className='text-3xl font-bold mb-8'>
          {isEditing ? 'Edit Profile' : 'Your Profile'}
        </h1>
        
        {isEditing ? (
          <form onSubmit={saveChanges} className='bg-[#282828] p-8 rounded-lg shadow-lg'>
            <div className='flex flex-col md:flex-row items-center gap-8'>
              <div className='relative'>
                <div className='bg-purple-500 w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden'>
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userData.name.charAt(0)}</span>
                  )}
                </div>
                <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-[#E91429] rounded-full p-2 cursor-pointer">
                  <FiCamera className="text-white" />
                </label>
                <input 
                  type="file" 
                  id="profile-image" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>
              
              <div className='flex flex-col gap-4 w-full'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-1'>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    className='bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91429] w-full'
                    required
                  />
                </div>
                
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-1'>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    className='bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91429] w-full'
                    required
                  />
                </div>
                
                <div className='flex items-center mt-1'>
                  <input
                    type="checkbox"
                    id="premium-status"
                    checked={formValues.isPremium}
                    disabled={true} // Premium status can't be changed directly by user
                    className='mr-2 h-4 w-4 accent-[#E91429]'
                  />
                  <label htmlFor="premium-status" className='text-sm font-medium text-gray-300'>
                    Premium Membership (managed by subscription)
                  </label>
                </div>
              </div>
            </div>
            
            <div className='mt-8'>
              <label className='block text-sm font-medium text-gray-300 mb-1'>
                Bio
              </label>
              <textarea
                name="bio"
                value={formValues.bio}
                onChange={handleInputChange}
                className='bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91429] w-full min-h-[100px] resize-y'
              />
            </div>
            
            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-1'>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  className='bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91429] w-full'
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-1'>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formValues.location}
                  onChange={handleInputChange}
                  className='bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91429] w-full'
                />
              </div>
            </div>
            
            <div className='mt-8 flex gap-4'>
              <button
                type="submit"
                disabled={isSaving}
                className={`bg-[#E91429] text-white font-bold py-2 px-6 rounded-full hover:bg-[#fa1b38] transition-colors flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <>
                    <FiLoader className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <FiCheck /> Save Changes
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
                className={`bg-transparent border border-white text-white font-bold py-2 px-6 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <FiX /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className='bg-[#282828] p-8 rounded-lg shadow-lg'>
            <div className='flex flex-col md:flex-row items-center gap-8'>
              <div className='bg-purple-500 w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden'>
                {currentUser.profileImage ? (
                  <img src={currentUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userData.name.charAt(0)
                )}
              </div>
              
              <div className='flex flex-col gap-2'>
                <h2 className='text-2xl font-bold'>{userData.name}</h2>
                <p className='text-gray-400'>{userData.email}</p>
                <p className='text-gray-400'>{userData.isPremium ? 'Premium Member' : 'Free Account'}</p>
                
                {userData.bio && (
                  <p className='text-gray-300 mt-2 text-sm'>{userData.bio}</p>
                )}
                
                <div className='flex flex-wrap gap-4 mt-2'>
                  {userData.phone && (
                    <p className='text-gray-400 text-sm'>{userData.phone}</p>
                  )}
                  
                  {userData.location && (
                    <p className='text-gray-400 text-sm'>{userData.location}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className='mt-8 pt-8 border-t border-gray-700'>
              <h3 className='text-xl font-bold mb-4'>Account Stats</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-[#3E3E3E] p-4 rounded-lg'>
                  <p className='text-gray-400 text-sm'>Songs Added</p>
                  {stats.isLoading ? (
                    <div className="flex items-center justify-start">
                      <FiLoader className="animate-spin text-2xl font-bold" />
                    </div>
                  ) : (
                    <p className='text-2xl font-bold'>{stats.songsAdded}</p>
                  )}
                </div>
                <div className='bg-[#3E3E3E] p-4 rounded-lg'>
                  <p className='text-gray-400 text-sm'>Playlists Created</p>
                  {stats.isLoading ? (
                    <div className="flex items-center justify-start">
                      <FiLoader className="animate-spin text-2xl font-bold" />
                    </div>
                  ) : (
                    <p className='text-2xl font-bold'>{stats.playlistsCreated}</p>
                  )}
                </div>
                <div className='bg-[#3E3E3E] p-4 rounded-lg'>
                  <p className='text-gray-400 text-sm'>Albums Created</p>
                  {stats.isLoading ? (
                    <div className="flex items-center justify-start">
                      <FiLoader className="animate-spin text-2xl font-bold" />
                    </div>
                  ) : (
                    <p className='text-2xl font-bold'>{stats.albumsCreated}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className='mt-8'>
              <button 
                onClick={toggleEditMode}
                disabled={isLoading}
                className={`bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <FiEdit2 /> Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;