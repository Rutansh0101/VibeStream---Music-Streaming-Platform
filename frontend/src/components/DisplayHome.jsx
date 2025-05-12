import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import AlbumItem from "./AlbumItem";
import SongItem from "./SongItem";
import axios from "axios";

function DisplayHome() {
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch albums
        const albumsResponse = await axios.get("http://localhost:4000/api/albums/list");
        if (albumsResponse.data.success) {
          setAlbums(albumsResponse.data.albums);
        }

        // Fetch songs with better error handling
        try {
          const songsResponse = await axios.get("http://localhost:4000/api/songs/list");
          if (songsResponse.data.success) {
            setSongs(songsResponse.data.songs);
          }
        } catch (songError) {
          console.error("Error fetching songs:", songError);
          // Still show the page with albums but no songs
          setSongs([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="mb-4">
        <h1 className="my-5 font-bold text-2xl">Featured Charts</h1>
        <div className="flex overflow-auto">
          {loading ? (
            <p className="text-gray-400 px-4">Loading albums...</p>
          ) : albums.length > 0 ? (
            albums.map((item) => (
              <AlbumItem
                image={item.image}
                name={item.name}
                desc={item.desc}
                id={item._id}
                key={item._id}
              />
            ))
          ) : (
            <p className="text-gray-400 px-4">No albums found</p>
          )}
        </div>
      </div>
      <div className="mb-4">
        <h1 className="my-5 font-bold text-2xl">Today's Biggest Hits</h1>
        <div className="flex overflow-auto">
          {loading ? (
            <p className="text-gray-400 px-4">Loading songs...</p>
          ) : songs.length > 0 ? (
            songs.map((item) => (
              <SongItem
                image={item.image}
                name={item.name}
                desc={item.desc}
                id={item._id}
                audio={item.file}
                key={item._id}
              />
            ))
          ) : (
            <p className="text-gray-400 px-4">No songs found</p>
          )}
        </div>
      </div>
    </>
  );
}

export default DisplayHome;