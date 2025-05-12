import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { FiMusic, FiImage, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { BsCheckCircleFill } from 'react-icons/bs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function AddSong() {
  const navigate = useNavigate();
  const { authHeader } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [userAlbums, setUserAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  // Form data states remain the same
  const [songFile, setSongFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [songName, setSongName] = useState('');
  const [songDesc, setSongDesc] = useState('');
  const [album, setAlbum] = useState('');

  // Error states
  const [errors, setErrors] = useState({
    songFile: null,
    imageFile: null,
    songName: null,
    songDesc: null,
    album: null
  });

  // Validation functions
  const validateSongFile = (file) => {
    if (!file) return "Audio file is required";
    if (file.size > 20 * 1024 * 1024) return "File size exceeds 20MB limit";
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav'];
    if (!validTypes.includes(file.type)) return "Only MP3 and WAV files are supported";
    return null;
  };

  useEffect(() => {
    const fetchUserAlbums = async () => {
      try {
        setLoadingAlbums(true);
        const response = await axios.get('http://localhost:4000/api/albums/user/albums', {
          headers: authHeader(),
          withCredentials: true
        });

        if (response.data.success) {
          setUserAlbums(response.data.albums);
        } else {
          console.error("Failed to fetch user albums:", response.data);
        }
      } catch (error) {
        console.error("Error fetching user albums:", error);
      } finally {
        setLoadingAlbums(false);
      }
    };

    fetchUserAlbums();
  }, []);

  const validateImageFile = (file) => {
    if (!file) return "Artwork image is required";
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) return "Only JPG and PNG images are supported";

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 300 || img.height < 300) {
          resolve("Image must be at least 300×300px");
        } else {
          resolve(null);
        }
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const validateSongName = (name) => {
    if (!name.trim()) return "Track name is required";
    if (name.length > 100) return "Track name cannot exceed 100 characters";
    return null;
  };

  const validateAlbum = (selectedAlbum) => {
    if (!selectedAlbum) return "Please select an album or 'None'";
    return null;
  };

  const validateSongDesc = (desc) => {
    if (!desc.trim()) return "Description is required";
    if (desc.length > 500) return "Description cannot exceed 500 characters";
    return null;
  };

  // Handle file changes with validation
  const handleSongFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSongFile(file);
      const error = validateSongFile(file);
      setErrors(prev => ({ ...prev, songFile: error }));
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const error = await validateImageFile(file);
      setErrors(prev => ({ ...prev, imageFile: error }));
    }
  };

  // Handle input changes with validation
  const handleSongNameChange = (e) => {
    const value = e.target.value;
    setSongName(value);
    setErrors(prev => ({ ...prev, songName: validateSongName(value) }));
  };

  const handleAlbumChange = (e) => {
    const value = e.target.value;
    setAlbum(value);
    setErrors(prev => ({ ...prev, album: validateAlbum(value) }));
  };

  const handleDescChange = (e) => {
    const value = e.target.value;
    setSongDesc(value);
    setErrors(prev => ({ ...prev, songDesc: validateSongDesc(value) }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const songFileError = validateSongFile(songFile);
    const imageFileError = await validateImageFile(imageFile);
    const songNameError = validateSongName(songName);
    const albumError = validateAlbum(album);
    const songDescError = validateSongDesc(songDesc);

    const newErrors = {
      songFile: songFileError,
      imageFile: imageFileError,
      songName: songNameError,
      album: albumError,
      songDesc: songDescError
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
      formData.append('name', songName);
      formData.append('desc', songDesc);

      // Send the album ID if a real album is selected, otherwise send "none"
      formData.append('album', album);

      formData.append('audio', songFile);
      formData.append('image', imageFile);

      // Send POST request to backend API with authentication header
      const response = await axios.post('http://localhost:4000/api/songs/add', formData, {
        headers: {
          ...authHeader(),
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        timeout: 30000 // 30 seconds
      });

      // Handle successful response
      toast.success("Track added successfully!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClose: () => {
          // Redirect to home page after toast closes
          navigate('/your-songs');
        }
      });

      console.log("Song created:", response.data);

      // Clear form after success
      setSongFile(null);
      setImageFile(null);
      setSongName('');
      setSongDesc('');
      setAlbum('');

    } catch (error) {
      console.error("Error adding track:", error);

      // Handle error response with more specific messages
      let errorMessage = "Failed to upload track. Please try again.";

      if (error.message && error.message.includes('Cannot connect to server')) {
        // Special case for server connection issues
        errorMessage = "Cannot connect to the server. Please make sure the backend server is running at http://localhost:4000";
      } else if (error.response) {
        // Server responded with an error status
        if (error.response.status === 413) {
          errorMessage = "Files are too large. Please reduce file size and try again.";
        } else if (error.response.status === 415) {
          errorMessage = "Unsupported file format. Please use supported formats only.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Upload timed out. Your files may be too large or your connection is slow.";
      } else if (error.request) {
        // Request was made but no response received
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
        <h1 className='text-3xl font-bold text-white mb-8'>Add New Track</h1>

        <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Audio Upload Container */}
            <div className='bg-[#282828] rounded-lg p-6 flex flex-col items-center justify-center transition-all hover:bg-[#2a2a2a]'>
              <div
                className={`mb-4 w-full aspect-square flex items-center justify-center rounded-md border-2 border-dashed 
                  ${errors.songFile ? 'border-red-500' : songFile ? 'border-[#E91429]' : 'border-gray-600'}`}
              >
                <input
                  type='file'
                  id='song'
                  accept='audio/mp3,audio/mpeg,audio/wav'
                  hidden
                  onChange={handleSongFileChange}
                />
                <label htmlFor='song' className='w-full h-full flex flex-col items-center justify-center cursor-pointer'>
                  {songFile ? (
                    <div className='flex justify-center items-center flex-col'>
                      <div className={`text-5xl mb-2 ${errors.songFile ? 'text-red-500' : 'text-[#E91429]'}`}>
                        {errors.songFile ? <FiAlertCircle /> : <FiMusic />}
                      </div>
                      <p className='text-white font-medium text-center px-4 truncate w-full'>{songFile.name}</p>
                      <p className='text-gray-400 text-sm mt-2'>Click to change</p>
                      {errors.songFile ? (
                        <p className='text-red-500 text-sm mt-2'>{errors.songFile}</p>
                      ) : (
                        <p className='text-[#E91429] text-sm mt-2 flex items-center'>
                          <BsCheckCircleFill className="mr-1" /> Valid audio file
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className='flex justify-center items-center flex-col'>
                      <div className='text-gray-400 text-5xl mb-4'><FiMusic /></div>
                      <p className='text-white font-medium'>Drop your audio file here</p>
                      <p className='text-gray-400 text-sm mt-2'>or click to browse</p>
                      {errors.songFile && (
                        <p className='text-red-500 text-sm mt-2'>{errors.songFile}</p>
                      )}
                    </div>
                  )}
                </label>
              </div>
              <p className='text-sm text-gray-400 mt-2'>Supports MP3, WAV (Max 20MB)</p>
            </div>

            {/* Image Upload Container */}
            <div className='bg-[#282828] rounded-lg p-6 flex flex-col items-center justify-center transition-all hover:bg-[#2a2a2a]'>
              <div
                className={`mb-4 w-full aspect-square flex items-center justify-center rounded-md border-2 border-dashed
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
                        alt='Track artwork'
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
                      <p className='text-white font-medium'>Drop track artwork here</p>
                      <p className='text-gray-400 text-sm mt-2'>or click to browse</p>
                      {errors.imageFile && (
                        <p className='text-red-500 text-sm mt-2'>{errors.imageFile}</p>
                      )}
                    </div>
                  )}
                </label>
              </div>
              <p className='text-sm text-gray-400 mt-2'>JPG or PNG (Min 300×300px)</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className='bg-[#282828] rounded-lg p-6 mt-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-gray-300'>
                  Track Name
                  <span className='text-[#E91429]'>*</span>
                </label>
                <input
                  type='text'
                  value={songName}
                  onChange={handleSongNameChange}
                  className={`bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none 
                    ${errors.songName
                      ? 'ring-2 ring-red-500 focus:ring-red-500'
                      : songName
                        ? 'ring-1 ring-[#E91429] focus:ring-2 focus:ring-[#E91429]'
                        : 'focus:ring-2 focus:ring-[#E91429]'}`}
                  placeholder='Enter track name'
                  required
                />
                {errors.songName && (
                  <p className='text-red-500 text-xs mt-1'>{errors.songName}</p>
                )}
                <p className='text-gray-400 text-xs'>
                  {songName.length}/100 characters
                </p>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-gray-300'>
                  Album
                  <span className='text-[#E91429]'>*</span>
                </label>
                <select
                  value={album}
                  onChange={handleAlbumChange}
                  className={`bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none
            ${errors.album
                      ? 'ring-2 ring-red-500 focus:ring-red-500'
                      : album
                        ? 'ring-1 ring-[#E91429] focus:ring-2 focus:ring-[#E91429]'
                        : 'focus:ring-2 focus:ring-[#E91429]'}`}
                  required
                >
                  <option value="" disabled>Select album</option>
                  <option value="none" className='bg-[#3E3E3E]'>None (Single)</option>

                  {loadingAlbums ? (
                    <option disabled className='bg-[#3E3E3E]'>Loading albums...</option>
                  ) : userAlbums.length > 0 ? (
                    userAlbums.map(album => (
                      <option
                        key={album._id}
                        value={album._id}
                        className='bg-[#3E3E3E]'
                      >
                        {album.name}
                      </option>
                    ))
                  ) : (
                    <option disabled className='bg-[#3E3E3E]'>No albums found</option>
                  )}
                </select>
                {errors.album && (
                  <p className='text-red-500 text-xs mt-1'>{errors.album}</p>
                )}
              </div>

              <div className='flex flex-col gap-2 md:col-span-2'>
                <label className='text-sm font-medium text-gray-300'>
                  Description
                  <span className='text-[#E91429]'>*</span>
                </label>
                <textarea
                  value={songDesc}
                  onChange={handleDescChange}
                  className={`bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none min-h-[100px] resize-y
                    ${errors.songDesc
                      ? 'ring-2 ring-red-500 focus:ring-red-500'
                      : songDesc
                        ? 'ring-1 ring-[#E91429] focus:ring-2 focus:ring-[#E91429]'
                        : 'focus:ring-2 focus:ring-[#E91429]'}`}
                  placeholder='Add a description for your track'
                  required
                />
                {errors.songDesc && (
                  <p className='text-red-500 text-xs mt-1'>{errors.songDesc}</p>
                )}
                <p className='text-gray-400 text-xs'>
                  {songDesc.length}/500 characters
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
                  <FiLoader className="animate-spin mr-2" /> UPLOADING...
                </>
              ) : (
                'ADD TRACK'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSong;