import React from "react";
import Navbar from "./Navbar";
import { albumsData, songsData } from "../assets/frontend-assets/assets";
import AlbumItem from "./AlbumItem";
import SongItem from "./SongItem";

function DisplayHome() {
  return (
    <>
      <Navbar />
      <div className="mb-4">
        <h1 className="my-5 font-bold text-2xl">Featured Charts</h1>
        <div className="flex overflow-auto">
          {albumsData.map((item, index) => (
            <AlbumItem
              image={item.image}
              name={item.name}
              desc={item.desc}
              id={index}
              key={index}
            />
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h1 className="my-5 font-bold text-2xl">Today's Biggest Hits</h1>
        <div className="flex overflow-auto">
          {songsData.map((item, index) => (
            <SongItem
              image={item.image}
              name={item.name}
              desc={item.desc}
              id={index}
              key={index}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default DisplayHome;
