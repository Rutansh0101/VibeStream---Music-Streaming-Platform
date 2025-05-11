import { createContext, useEffect } from "react";
import { useRef, useState } from "react";
import { songsData } from "../assets/frontend-assets/assets";

export const PlayerContext = createContext();

const PlayerConetextProvider = (props) => {
    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const [track, setTrack] = useState(songsData[0]);
    const [playStatus, setPlayStatus] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hoverPosition, setHoverPosition] = useState(null);
    const [time, setTime] = useState({
        currentTime: {
            second: 0,
            minute: 0,
        },
        totalTime: {
            second: 0,
            minute: 0,
        },
    });

    const play = () => {
        audioRef.current.play();
        setPlayStatus(true);
    }

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false);
    }

    const playWithId = async(id) => {
        await setTrack(songsData[id]);
        await audioRef.current.play();
        await setPlayStatus(true);
    }

    const previous = async() => {
        if(track.id > 0){
            await setTrack(songsData[track.id - 1]);
            await audioRef.current.play();
            await setPlayStatus(true);
        }
        else{
            await setTrack(songsData[0]);
            await audioRef.current.play();
            await setPlayStatus(true);
        }
    }

    const next = async() => {
        if(track.id < songsData.length - 1){
            await setTrack(songsData[track.id + 1]);
            await audioRef.current.play();
            await setPlayStatus(true);
        }
        else{
            await setTrack(songsData[songsData.length - 1]);
            await audioRef.current.play();
            await setPlayStatus(true);
        }
    }

    const updateSeekPosition = (e) => {
        const rect = seekBg.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, offsetX / width));
        
        audioRef.current.currentTime = percentage * audioRef.current.duration;
    };

    const handleDragStart = (e) => {
        setIsDragging(true);
        updateSeekPosition(e);
        
        // Add event listeners to track mouse movement
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };

    const handleDragMove = (e) => {
        if (isDragging) {
            updateSeekPosition(e);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        // Remove event listeners when done
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
    };

    const handleSeekHover = (e) => {
        const rect = seekBg.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, offsetX / width));
        setHoverPosition(percentage);
    };

    const handleSeekLeave = () => {
        setHoverPosition(null);
    };

    const seekSong = (e) => {
        if (!isDragging) {
            updateSeekPosition(e);
        }
    };

    useEffect(() => {
        setTimeout(()=>{
            audioRef.current.ontimeupdate = () => {
                // Only update width if duration is available
                if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
                    seekBar.current.style.width = `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%`;
                } else {
                    seekBar.current.style.width = '0%';
                }
                
                setTime({
                    currentTime: {
                        second: Math.floor(audioRef.current.currentTime % 60) || 0,
                        minute: Math.floor(audioRef.current.currentTime / 60) || 0,
                    },
                    totalTime: {
                        second: !isNaN(audioRef.current.duration) ? Math.floor(audioRef.current.duration % 60) : 0,
                        minute: !isNaN(audioRef.current.duration) ? Math.floor(audioRef.current.duration / 60) : 0,
                    },
                });
            }
            
            audioRef.current.onloadedmetadata = () => {
                setTime(prevTime => ({
                    ...prevTime,
                    totalTime: {
                        second: Math.floor(audioRef.current.duration % 60),
                        minute: Math.floor(audioRef.current.duration / 60),
                    },
                }));
            };
        }, 1000)
    }, [audioRef]);

    const contextValue = {
        audioRef,
        seekBg,
        seekBar,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId,
        previous, next,
        seekSong,
        isDragging,
        hoverPosition,
        handleDragStart,
        handleDragMove,
        handleDragEnd,
        handleSeekHover,
        handleSeekLeave,
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerConetextProvider;