import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiLoader, FiMusic, FiUpload, FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';

function EditPlaylist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authHeader } = useContext(AuthContext);
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`http://localhost:4000/api/playlists/${id}`, {
          headers: authHeader(),
          withCredentials: true
        });
        
        if (response.data.success && response.data.playlist) {
          const playlist = response.data.playlist;
          setPlaylist(playlist);
          setPlaylistName(playlist.name);
          setPlaylistDesc(playlist.desc || '');
          setImagePreview(playlist.image || null);
        } else {
          setError('Playlist not found');
        }
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setError('Failed to load playlist. Please try again later.');
        toast.error('Error loading playlist');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id, authHeader]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
        toast.error('Only JPEG, PNG and GIF images are allowed');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image and revert to original
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(playlist?.image || null);
  };

  // Save playlist changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!playlistName.trim()) {
      toast.error('Playlist name is required');
      return;
    }
    
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', playlistName);
      formData.append('desc', playlistDesc);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await axios.put(
        `http://localhost:4000/api/playlists/${id}`,
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
        toast.success('Playlist updated successfully');
        // Navigate back to playlist view after short delay
        setTimeout(() => {
          navigate(`/playlist/${id}`);
        }, 1500);
      } else {
        toast.error(response.data.message || 'Failed to update playlist');
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast.error('Error updating playlist');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    navigate(`/playlist/${id}`);
  };

  if (loading) {
    return (
      <div className='min-h-full bg-gradient-to-b from-[#121212] to-[#191414]'>
        <Navbar />
        <div className='flex justify-center items-center h-[70vh]'>
          <FiLoader size={40} className="animate-spin text-[#E91429]" />
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className='min-h-full bg-gradient-to-b from-[#121212] to-[#191414]'>
        <Navbar />
        <div className='flex flex-col items-center justify-center h-[70vh] text-white'>
          <p className='text-xl mb-4'>{error || 'Playlist not found'}</p>
          <button
            onClick={() => navigate('/playlists')}
            className='bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors'
          >
            Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-full bg-gradient-to-b from-[#121212] to-[#191414] text-white'>
      <Navbar />
      <ToastContainer theme="dark" />
      
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold mb-8'>Edit Playlist</h1>
        
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Playlist Image */}
          <div className='mb-6'>
            <label className='block text-gray-300 mb-2'>Playlist Image</label>
            <div className='flex items-end space-x-4'>
              {/* Image Preview */}
              <div className='w-32 h-32 bg-[#282828] rounded overflow-hidden'>
                {imagePreview ? (
                  <img src={imagePreview} alt="Playlist cover" className='w-full h-full object-cover' />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <FiMusic size={40} className='text-gray-500' />
                  </div>
                )}
              </div>
              
              <div className='space-y-2'>
                {/* Image Upload Button */}
                <label className='bg-[#E91429] text-white py-2 px-4 rounded-full cursor-pointer hover:bg-opacity-80 inline-flex items-center gap-2'>
                  <FiUpload />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className='hidden'
                  />
                </label>
                
                {/* Remove Image Button */}
                {imagePreview && imageFile && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className='ml-2 text-gray-300 hover:text-white flex items-center gap-1'
                  >
                    <FiX size={16} />
                    Remove
                  </button>
                )}
                <p className='text-xs text-gray-400'>Recommended: Square image, at least 300x300px</p>
              </div>
            </div>
          </div>
          
          {/* Playlist Name */}
          <div className='mb-6'>
            <label htmlFor='playlistName' className='block text-gray-300 mb-2'>Name</label>
            <input
              id='playlistName'
              type='text'
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className='w-full bg-[#3E3E3E] p-3 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E91429]'
              placeholder='My Playlist'
              required
            />
          </div>
          
          {/* Playlist Description */}
          <div className='mb-6'>
            <label htmlFor='playlistDesc' className='block text-gray-300 mb-2'>Description (optional)</label>
            <textarea
              id='playlistDesc'
              value={playlistDesc}
              onChange={(e) => setPlaylistDesc(e.target.value)}
              className='w-full bg-[#3E3E3E] p-3 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E91429] min-h-[100px]'
              placeholder='Add an optional description'
            />
          </div>
          
          {/* Action Buttons */}
          <div className='flex justify-end space-x-3 mt-8'>
            <button
              type='button'
              onClick={handleCancel}
              className='bg-[#333333] text-white py-2 px-6 rounded-full hover:bg-opacity-80 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={saving}
              className='bg-[#E91429] text-white py-2 px-6 rounded-full hover:bg-opacity-80 transition-colors flex items-center gap-2'
            >
              {saving ? (
                <>
                  <FiLoader className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPlaylist;