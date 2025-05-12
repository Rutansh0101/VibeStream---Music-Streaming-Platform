import React, { useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';
import DisplayHome from './DisplayHome';
import DisplayAlbum from './DisplayAlbum';
import { albumsData } from '../assets/frontend-assets/assets';
import AddSong from './AddSong';
import AddAlbum from './AddAlbum';
import ListAlbum from './ListAlbum';
import Profile from './Profile';
import YourSongs from './YourSongs';
import Settings from './Settings';
import Logout from './Logout';


function Display() {

  const displayref = useRef();
  const location = useLocation();
  const isAlbum = location.pathname.includes("album");
  
  // Fix: Properly extract album ID from path
  let albumId = "";
  if (isAlbum) {
    // Extract the ID from paths like /album/123
    const pathParts = location.pathname.split('/');
    albumId = pathParts[pathParts.length - 1];
  }
  
  // Fix: Check if albumData exists before accessing bgColor
  const defaultBgColor = "#121212";
  const albumData = albumsData[Number(albumId)];
  const bgColor = albumData ? albumData.bgColor : defaultBgColor;
  const isAddSong = location.pathname.includes("/add-song");

  useEffect(() => {
    if (isAlbum && albumData) {
      displayref.current.style.background = `linear-gradient(${bgColor}, #121212)`;
    } else {
      displayref.current.style.background = defaultBgColor;
    }
  }, [location.pathname, bgColor, albumData, isAlbum]);

  return (
    <div ref={displayref} className={`w-[100%] rounded bg-[#121212] text-white overflow-auto ${isAddSong ? "lg:w-[100%]" : "lg:w-[75%] lg:ml-0  px-6 pt-4"} m-2`}>
        <Routes>
            <Route path='/' element={<DisplayHome/>} />
            <Route path='/album/:id' element={<DisplayAlbum/>} />
            <Route path='/add-song' element={<AddSong/>} />
            <Route path='/add-album' element={<AddAlbum/>} />
            <Route path='/list-albums' element={<ListAlbum/>}/>
            <Route path='/profile' element={<Profile/>} />
            <Route path='/your-songs' element={<YourSongs/>} />
            <Route path='/settings' element={<Settings/>} />
            <Route path='/logout' element={<Logout/>} />
        </Routes>
    </div>
  )
}

export default Display;