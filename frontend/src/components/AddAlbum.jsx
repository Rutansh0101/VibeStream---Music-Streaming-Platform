import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { FiImage, FiAlertCircle, FiLoader, FiMusic } from 'react-icons/fi';
import { BsCheckCircleFill } from 'react-icons/bs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function AddAlbum() {
  const navigate = useNavigate();
  const { authHeader } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  // Form data states
  const [imageFile, setImageFile] = useState(null);
  const [albumName, setAlbumName] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseDate, setReleaseDate] = useState('');

  // Error states
  const [errors, setErrors] = useState({
    imageFile: null,
    albumName: null,
    albumDesc: null,
    genre: null,
    releaseDate: null
  });

  // Validation functions
  const validateImageFile = (file) => {
    if (!file) return "Album artwork is required";
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) return "Only JPG and PNG images are supported";
    return null; // Remove size validation
  };

  const validateAlbumName = (name) => {
    if (!name.trim()) return "Album name is required";
    if (name.length > 100) return "Album name cannot exceed 100 characters";
    return null;
  };

  const validateAlbumDesc = (desc) => {
    if (!desc.trim()) return "Description is required";
    if (desc.length > 500) return "Description cannot exceed 500 characters";
    return null;
  };

  const validateGenre = (selectedGenre) => {
    if (!selectedGenre) return "Please select a genre";
    return null;
  };

  const validateReleaseDate = (date) => {
    if (!date) return "Release date is required";
    return null;
  };

  // Handle file changes with validation
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const error = await validateImageFile(file);
      setErrors(prev => ({ ...prev, imageFile: error }));
    }
  };

  // Handle input changes with validation
  const handleAlbumNameChange = (e) => {
    const value = e.target.value;
    setAlbumName(value);
    setErrors(prev => ({ ...prev, albumName: validateAlbumName(value) }));
  };

  const handleDescChange = (e) => {
    const value = e.target.value;
    setAlbumDesc(value);
    setErrors(prev => ({ ...prev, albumDesc: validateAlbumDesc(value) }));
  };

  const handleGenreChange = (e) => {
    const value = e.target.value;
    setGenre(value);
    setErrors(prev => ({ ...prev, genre: validateGenre(value) }));
  };

  const handleReleaseDateChange = (e) => {
    const value = e.target.value;
    setReleaseDate(value);
    setErrors(prev => ({ ...prev, releaseDate: validateReleaseDate(value) }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const imageFileError = await validateImageFile(imageFile);
    const albumNameError = validateAlbumName(albumName);
    const albumDescError = validateAlbumDesc(albumDesc);
    const genreError = validateGenre(genre);
    const releaseDateError = validateReleaseDate(releaseDate);

    const newErrors = {
      imageFile: imageFileError,
      albumName: albumNameError,
      albumDesc: albumDescError,
      genre: genreError,
      releaseDate: releaseDateError
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== null)) {
      toast.error("Please fix the errors before submitting", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return; // Stop submission if there are errors
    }

    setIsLoading(true);

    try {
      // First check if the backend is reachable
      try {
        // Try a quick GET request to check if server is running
        await axios.get('http://localhost:4000/');
      } catch (connectionError) {
        if (connectionError.code === 'ERR_NETWORK') {
          throw new Error('Cannot connect to server. Please make sure the backend is running on http://localhost:4000');
        }
      }

      // Create FormData object to send multipart/form-data
      const formData = new FormData();
      formData.append('name', albumName);
      formData.append('desc', albumDesc);
      formData.append('genre', genre);
      formData.append('releaseDate', releaseDate);
      formData.append('image', imageFile);

      // Send POST request to backend API with authentication header
      const response = await axios.post('http://localhost:4000/api/albums/add', formData, {
        headers: {
          ...authHeader(),
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        timeout: 30000 // 30 seconds
      });

      // Handle successful response
      toast.success("Album created successfully!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClose: () => {
          // Redirect to albums page after toast closes
          navigate('/list-albums');
        }
      });

      console.log("Album created:", response.data);

      // Clear form after success
      setImageFile(null);
      setAlbumName('');
      setAlbumDesc('');
      setGenre('');
      setReleaseDate('');

    } catch (error) {
      console.error("Error adding album:", error);

      // Handle error response with more specific messages
      let errorMessage = "Failed to create album. Please try again.";

      if (error.response && error.response.status === 401) {
        toast.error("Authentication failed. Please log in again.", {
          position: "top-center",
          autoClose: 3000,
          onClose: () => navigate('/login')
        });
        return;
      }

      if (error.message && error.message.includes('Cannot connect to server')) {
        errorMessage = "Cannot connect to the server. Please make sure the backend server is running at http://localhost:4000";
      } else if (error.response) {
        if (error.response.status === 413) {
          errorMessage = "Image is too large. Please reduce file size and try again.";
        } else if (error.response.status === 415) {
          errorMessage = "Unsupported file format. Please use JPG or PNG only.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.request) {
        errorMessage = "Server not responding. Please check your connection and try again.";
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-5 items-center min-h-full bg-gradient-to-b from-[#121212] to-[#191414] pb-12'>
      <ToastContainer theme="dark" />
      <Navbar />
      <div className='w-full max-w-4xl px-6'>
        <h1 className='text-3xl font-bold text-white mb-8'>Create New Album</h1>

        <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Album Cover Upload */}
            <div className='bg-[#282828] rounded-lg p-6 flex flex-col items-center justify-center transition-all hover:bg-[#2a2a2a]'>
              <div
                className={`mb-4 w-full aspect-square flex items-center justify-center rounded-md border-2 border-dashed
                  ${errors.imageFile ? 'border-red-500' : imageFile ? 'border-[#E91429]' : 'border-gray-600'}`}
              >
                <input
                  type='file'
                  id='albumCover'
                  accept='image/jpeg,image/jpg,image/png'
                  hidden
                  onChange={handleImageFileChange}
                />
                <label htmlFor='albumCover' className='w-full h-full flex flex-col items-center justify-center cursor-pointer'>
                  {imageFile ? (
                    <div className='w-full h-full relative'>
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt='Album artwork'
                        className='w-full h-full object-cover rounded-md'
                      />
                      {errors.imageFile ? (
                        <div className='absolute bottom-2 left-0 right-0 bg-red-500 bg-opacity-80 p-2 text-white text-center'>
                          <FiAlertCircle className="inline mr-1" /> {errors.imageFile}
                        </div>
                      ) : (
                        <div className='absolute bottom-2 left-0 right-0 bg-[#E91429] bg-opacity-80 p-2 text-white text-center'>
                          <BsCheckCircleFill className="inline mr-1" /> Album cover looks good
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='flex justify-center items-center flex-col'>
                      <div className='text-gray-400 text-5xl mb-4'><FiImage /></div>
                      <p className='text-white font-medium'>Drop album cover here</p>
                      <p className='text-gray-400 text-sm mt-2'>or click to browse</p>
                      {errors.imageFile && (
                        <p className='text-red-500 text-sm mt-2'>{errors.imageFile}</p>
                      )}
                    </div>
                  )}
                </label>
              </div>
              <p className='text-sm text-gray-400 mt-2'>JPG or PNG format</p>
            </div>

            {/* Album Information */}
            <div className='bg-[#282828] rounded-lg p-6 flex flex-col justify-center'>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-300'>
                    Album Name
                    <span className='text-[#E91429]'>*</span>
                  </label>
                  <input
                    type='text'
                    value={albumName}
                    onChange={handleAlbumNameChange}
                    className={`bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none 
                      ${errors.albumName
                        ? 'ring-2 ring-red-500 focus:ring-red-500'
                        : albumName
                          ? 'ring-1 ring-[#E91429] focus:ring-2 focus:ring-[#E91429]'
                          : 'focus:ring-2 focus:ring-[#E91429]'}`}
                    placeholder='Enter album name'
                    required
                  />
                  {errors.albumName && (
                    <p className='text-red-500 text-xs mt-1'>{errors.albumName}</p>
                  )}
                  <p className='text-gray-400 text-xs'>
                    {albumName.length}/100 characters
                  </p>
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-300'>
                    Genre
                    <span className='text-[#E91429]'>*</span>
                  </label>
                  <select
                    value={genre}
                    onChange={handleGenreChange}
                    className={`bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none
                      ${errors.genre
                        ? 'ring-2 ring-red-500 focus:ring-red-500'
                        : genre
                          ? 'ring-1 ring-[#E91429] focus:ring-2 focus:ring-[#E91429]'
                          : 'focus:ring-2 focus:ring-[#E91429]'}`}
                    required
                  >
                    <option value="" disabled className='bg-[#3E3E3E]'>Select genre</option>
                    <option value="pop" className='bg-[#3E3E3E]'>Pop</option>
                    <option value="rock" className='bg-[#3E3E3E]'>Rock</option>
                    <option value="hiphop" className='bg-[#3E3E3E]'>Hip Hop</option>
                    <option value="rnb" className='bg-[#3E3E3E]'>R&B</option>
                    <option value="electronic" className='bg-[#3E3E3E]'>Electronic</option>
                    <option value="jazz" className='bg-[#3E3E3E]'>Jazz</option>
                    <option value="classical" className='bg-[#3E3E3E]'>Classical</option>
                    <option value="country" className='bg-[#3E3E3E]'>Country</option>
                    <option value="other" className='bg-[#3E3E3E]'>Other</option>
                  </select>
                  {errors.genre && (
                    <p className='text-red-500 text-xs mt-1'>{errors.genre}</p>
                  )}
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-300'>
                    Release Date
                    <span className='text-[#E91429]'>*</span>
                  </label>
                  <input
                    type='date'
                    value={releaseDate}
                    onChange={handleReleaseDateChange}
                    className={`bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none 
                      ${errors.releaseDate
                        ? 'ring-2 ring-red-500 focus:ring-red-500'
                        : releaseDate
                          ? 'ring-1 ring-[#E91429] focus:ring-2 focus:ring-[#E91429]'
                          : 'focus:ring-2 focus:ring-[#E91429]'}`}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                  {errors.releaseDate && (
                    <p className='text-red-500 text-xs mt-1'>{errors.releaseDate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Album Description */}
          <div className='bg-[#282828] rounded-lg p-6 mt-4'>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-300'>
                Album Description
                <span className='text-[#E91429]'>*</span>
              </label>
              <textarea
                value={albumDesc}
                onChange={handleDescChange}
                className={`bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none min-h-[120px] resize-y
                  ${errors.albumDesc
                    ? 'ring-2 ring-red-500 focus:ring-red-500'
                    : albumDesc
                      ? 'ring-1 ring-[#E91429] focus:ring-2 focus:ring-[#E91429]'
                      : 'focus:ring-2 focus:ring-[#E91429]'}`}
                placeholder='Write a description for your album'
                required
              />
              {errors.albumDesc && (
                <p className='text-red-500 text-xs mt-1'>{errors.albumDesc}</p>
              )}
              <p className='text-gray-400 text-xs'>
                {albumDesc.length}/500 characters
              </p>
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
                'CREATE ALBUM'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAlbum;