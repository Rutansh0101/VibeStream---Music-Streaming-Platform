import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { FiImage, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { BsCheckCircleFill } from 'react-icons/bs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function CreatePlaylist() {
  const navigate = useNavigate();
  const { authHeader } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');

  const [errors, setErrors] = useState({
    imageFile: null,
    playlistName: null,
    playlistDesc: null
  });

  // Validation functions
  const validateImageFile = (file) => {
    if (file && file.size > 2 * 1024 * 1024) return "File size exceeds 2MB limit";
    if (file && !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      return "Only JPG and PNG files are supported";
    }
    return null;
  };

  const validateName = (name) => {
    if (!name.trim()) return "Playlist name is required";
    if (name.length > 100) return "Name must be less than 100 characters";
    return null;
  };

  const validateDesc = (desc) => {
    if (desc.length > 500) return "Description must be less than 500 characters";
    return null;
  };

  // Handle file change for image
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateImageFile(file);
      setImageFile(file);
      setErrors(prev => ({ ...prev, imageFile: error }));
    }
  };

  // Handle playlist name change
  const handleNameChange = (e) => {
    const value = e.target.value;
    setPlaylistName(value);
    setErrors(prev => ({ ...prev, playlistName: validateName(value) }));
  };

  // Handle description change
  const handleDescChange = (e) => {
    const value = e.target.value;
    setPlaylistDesc(value);
    setErrors(prev => ({ ...prev, playlistDesc: validateDesc(value) }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const nameError = validateName(playlistName);
    const descError = validateDesc(playlistDesc);
    const imageError = validateImageFile(imageFile);

    setErrors({
      playlistName: nameError,
      playlistDesc: descError,
      imageFile: imageError
    });

    // If any errors, prevent submission
    if (nameError || descError || imageError) {
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData object for multipart/form-data
      const formData = new FormData();
      formData.append('name', playlistName);
      formData.append('desc', playlistDesc);
      if (imageFile) formData.append('image', imageFile);

      // Send request to create playlist
      const response = await axios.post(
        'http://localhost:4000/api/playlists/create',
        formData,
        {
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Playlist created successfully!');

        // Redirect to the playlist page after a short delay
        setTimeout(() => {
          navigate(`/playlist/${response.data.playlist._id}`);
        }, 1500);
      } else {
        toast.error(response.data.message || 'Failed to create playlist');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      console.error('Response data:', error.response?.data);

      // Show more helpful error message
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.error ||
        'Server error creating playlist';

      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-5 items-center min-h-full bg-gradient-to-b from-[#121212] to-[#191414] pb-12'>
      <ToastContainer theme="dark" />
      <Navbar />
      <div className='w-full max-w-2xl px-6'>
        <h1 className='text-3xl font-bold text-white mb-8'>Create New Playlist</h1>

        <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
          {/* Image Upload */}
          <div className='bg-[#282828] rounded-lg p-6 flex flex-col items-center justify-center transition-all hover:bg-[#2a2a2a]'>
            <div
              className={`mb-4 w-full max-w-xs aspect-square flex items-center justify-center rounded-md border-2 border-dashed 
                ${errors.imageFile ? 'border-red-500' : imageFile ? 'border-[#E91429]' : 'border-gray-600'}`}
            >
              <input
                type='file'
                id='image'
                accept='image/jpeg,image/jpg,image/png'
                hidden
                onChange={handleImageFileChange}
              />
              <label htmlFor='image' className='w-full h-full flex flex-col items-center justify-center cursor-pointer'>
                {imageFile ? (
                  <div className='w-full h-full relative'>
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt='Playlist cover'
                      className='w-full h-full object-cover rounded-md'
                    />
                    {errors.imageFile ? (
                      <div className='absolute bottom-2 left-0 right-0 bg-red-500 bg-opacity-80 p-2 text-white text-center'>
                        <FiAlertCircle className="inline mr-1" /> {errors.imageFile}
                      </div>
                    ) : (
                      <div className='absolute bottom-2 left-0 right-0 bg-[#E91429] bg-opacity-80 p-2 text-white text-center'>
                        <BsCheckCircleFill className="inline mr-1" /> Image looks good
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='flex justify-center items-center flex-col'>
                    <div className='text-gray-400 text-5xl mb-4'><FiImage /></div>
                    <p className='text-white font-medium'>Drop playlist cover here</p>
                    <p className='text-gray-400 text-sm mt-2'>or click to browse</p>
                    {errors.imageFile && (
                      <p className='text-red-500 text-sm mt-2'>{errors.imageFile}</p>
                    )}
                  </div>
                )}
              </label>
            </div>
            <p className='text-sm text-gray-400 mt-2'>JPG or PNG (Optional, Max 2MB)</p>
          </div>

          {/* Form Fields */}
          <div className='bg-[#282828] rounded-lg p-6'>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-gray-300'>
                  Playlist Name
                  <span className='text-[#E91429]'>*</span>
                </label>
                <input
                  type='text'
                  value={playlistName}
                  onChange={handleNameChange}
                  className={`bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none 
                    ${errors.playlistName
                      ? 'ring-2 ring-red-500 focus:ring-red-500'
                      : playlistName
                        ? 'ring-1 ring-[#E91429] focus:ring-2 focus:ring-[#E91429]'
                        : 'focus:ring-2 focus:ring-[#E91429]'}`}
                  placeholder='Enter playlist name'
                  required
                />
                {errors.playlistName && (
                  <p className='text-red-500 text-xs mt-1'>{errors.playlistName}</p>
                )}
                <p className='text-gray-400 text-xs'>
                  {playlistName.length}/100 characters
                </p>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-gray-300'>
                  Description
                </label>
                <textarea
                  value={playlistDesc}
                  onChange={handleDescChange}
                  className={`bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none min-h-[100px] resize-y
                    ${errors.playlistDesc
                      ? 'ring-2 ring-red-500 focus:ring-red-500'
                      : playlistDesc
                        ? 'ring-1 ring-[#E91429] focus:ring-2 focus:ring-[#E91429]'
                        : 'focus:ring-2 focus:ring-[#E91429]'}`}
                  placeholder='Add a description for your playlist (optional)'
                />
                {errors.playlistDesc && (
                  <p className='text-red-500 text-xs mt-1'>{errors.playlistDesc}</p>
                )}
                <p className='text-gray-400 text-xs'>
                  {playlistDesc.length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex justify-center mt-4'>
            <button
              type='submit'
              disabled={isLoading}
              className={`${isLoading
                ? 'bg-opacity-70 cursor-not-allowed'
                : 'hover:bg-[#fa1b38]'
                } bg-[#E91429] text-white font-bold py-3 px-10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white flex items-center justify-center min-w-[180px]`}
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin mr-2" /> CREATING...
                </>
              ) : (
                'CREATE PLAYLIST'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePlaylist;