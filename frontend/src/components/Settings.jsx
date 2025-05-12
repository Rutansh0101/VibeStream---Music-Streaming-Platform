import React, { useState } from 'react'
import Navbar from './Navbar'
import { FiSave } from 'react-icons/fi'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Settings() {
  // Sample state for settings
  const [audioQuality, setAudioQuality] = useState('high');
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('english');
  const [isPrivate, setIsPrivate] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would save these settings to backend/localStorage
    toast.success("Settings saved successfully!", {
      position: "top-center",
      autoClose: 2000
    });
  };

  return (
    <div className='flex flex-col gap-5 min-h-full bg-gradient-to-b from-[#121212] to-[#191414] pb-12'>
      <Navbar />
      <ToastContainer theme="dark" />
      
      <div className='text-white max-w-4xl mx-auto px-6 w-full'>
        <h1 className='text-3xl font-bold mb-8'>Settings</h1>
        
        <form onSubmit={handleSubmit}>
          <div className='bg-[#282828] p-6 rounded-lg shadow-lg mb-6'>
            <h2 className='text-xl font-bold mb-6'>Playback</h2>
            
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Audio Quality
              </label>
              <select
                value={audioQuality}
                onChange={(e) => setAudioQuality(e.target.value)}
                className='bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91429] w-full'
              >
                <option value="low" className='bg-[#3E3E3E]'>Low (96 kbps)</option>
                <option value="medium" className='bg-[#3E3E3E]'>Medium (160 kbps)</option>
                <option value="high" className='bg-[#3E3E3E]'>High (320 kbps)</option>
                <option value="lossless" className='bg-[#3E3E3E]'>Lossless (CD quality)</option>
              </select>
            </div>
            
            <div className='mb-6 flex items-center'>
              <input
                type="checkbox"
                id="downloadEnabled"
                checked={downloadEnabled}
                onChange={() => setDownloadEnabled(!downloadEnabled)}
                className='mr-2 h-4 w-4 accent-[#E91429]'
              />
              <label htmlFor="downloadEnabled" className='text-sm font-medium text-gray-300'>
                Enable downloads for offline listening
              </label>
            </div>
          </div>
          
          <div className='bg-[#282828] p-6 rounded-lg shadow-lg mb-6'>
            <h2 className='text-xl font-bold mb-6'>Appearance</h2>
            
            <div className='mb-6 flex items-center'>
              <input
                type="checkbox"
                id="darkMode"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className='mr-2 h-4 w-4 accent-[#E91429]'
              />
              <label htmlFor="darkMode" className='text-sm font-medium text-gray-300'>
                Dark Mode
              </label>
            </div>
            
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className='bg-[#3E3E3E] border-none text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91429] w-full'
              >
                <option value="english" className='bg-[#3E3E3E]'>English</option>
                <option value="spanish" className='bg-[#3E3E3E]'>Spanish</option>
                <option value="french" className='bg-[#3E3E3E]'>French</option>
                <option value="german" className='bg-[#3E3E3E]'>German</option>
                <option value="japanese" className='bg-[#3E3E3E]'>Japanese</option>
              </select>
            </div>
          </div>
          
          <div className='bg-[#282828] p-6 rounded-lg shadow-lg mb-6'>
            <h2 className='text-xl font-bold mb-6'>Privacy</h2>
            
            <div className='mb-6 flex items-center'>
              <input
                type="checkbox"
                id="notifications"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className='mr-2 h-4 w-4 accent-[#E91429]'
              />
              <label htmlFor="notifications" className='text-sm font-medium text-gray-300'>
                Enable notifications
              </label>
            </div>
            
            <div className='mb-6 flex items-center'>
              <input
                type="checkbox"
                id="privateAccount"
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
                className='mr-2 h-4 w-4 accent-[#E91429]'
              />
              <label htmlFor="privateAccount" className='text-sm font-medium text-gray-300'>
                Make my profile private
              </label>
            </div>
          </div>
          
          <div className='flex justify-center mt-6'>
            <button
              type='submit'
              className='bg-[#E91429] text-white font-bold py-3 px-10 rounded-full hover:bg-[#fa1b38] transition-colors focus:outline-none focus:ring-2 focus:ring-white flex items-center justify-center min-w-[180px] gap-2'
            >
              <FiSave /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings