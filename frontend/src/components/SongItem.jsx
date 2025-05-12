import React, { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';

const SongItem = ({name, image, desc, id, audio}) => {
    const {playWithId, setCurrentPlaylist} = useContext(PlayerContext);

    const handlePlay = () => {
        // Set current song as a one-item playlist if needed
        if (audio) {
            setCurrentPlaylist([{
                _id: id,
                name,
                desc,
                image,
                file: audio
            }]);
        }
        
        // Play the song
        playWithId(id);
    };

    return (
        <div onClick={handlePlay} className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
            <img className='rounded' src={image} alt='song_image'/>
            <p className='font-bold mt-2 mb-1'>{name}</p>
            <p className='text-slate-200 text-sm'>{desc}</p>
        </div>
    );
};

export default SongItem;