import React, { useContext } from 'react'
import { assets } from '../assets/frontend-assets/assets';
import { PlayerContext } from '../context/PlayerContext';
import { FiRepeat, FiRefreshCw, FiVolume, FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi';

function Player() {
    const { 
        track, 
        seekBg, 
        seekBar,
        volumeBarRef,
        playStatus, 
        play, 
        pause, 
        time, 
        previous, 
        next, 
        seekSong,
        isDragging,
        hoverPosition,
        handleDragStart,
        handleSeekHover,
        handleSeekLeave,
        shuffleMode,
        toggleShuffle,
        loopMode,
        toggleLoop,
        volume,
        handleVolumeChange,
        isMuted,
        toggleMute,
        toggleQueue,
        toggleFullscreen,
        toggleMiniPlayer
    } = useContext(PlayerContext);

    // Helper function to get volume icon based on current volume
    const getVolumeIcon = () => {
        if (isMuted || volume === 0) {
            return <FiVolumeX className="w-4 h-4" />;
        } else if (volume < 0.4) {
            return <FiVolume className="w-4 h-4" />;
        } else if (volume < 0.7) {
            return <FiVolume1 className="w-4 h-4" />;
        } else {
            return <FiVolume2 className="w-4 h-4" />;
        }
    };

    // Helper function to get the loop icon with correct styling
    const getLoopIcon = () => {
        if (loopMode === 0) {
            return <FiRepeat className="w-4 h-4 opacity-60" />;
        } else if (loopMode === 1) {
            return <FiRefreshCw className="w-4 h-4 text-red-600" />;
        } else {
            return (
                <div className="relative">
                    <FiRepeat className="w-4 h-4 text-red-600" />
                    <span className="absolute -top-2 -right-2 text-xs bg-red-600 rounded-full w-3 h-3 flex items-center justify-center text-white">1</span>
                </div>
            );
        }
    };

    // Helper function to get loop mode title
    const getLoopTitle = () => {
        if (loopMode === 0) return "Enable repeat all";
        if (loopMode === 1) return "Enable repeat one";
        return "Disable repeat";
    };

    return (
        <div className='h-[10%] bg-black flex justify-between items-center text-white px-4'>
            <div className='hidden lg:flex items-center gap-4'>
                <img src={track.image} alt='img' className='w-12' />
                <div>
                    <p>
                        {track.name}
                    </p>
                    <p>
                        {track.desc.slice(0, 12)}
                    </p>
                </div>
            </div>
            <div className='flex flex-col items-center gap-1 m-auto'>
                <div className='flex gap-4'>
                    <img 
                        onClick={toggleShuffle} 
                        src={assets.shuffle_icon} 
                        alt='shuffle' 
                        title={shuffleMode ? "Disable shuffle" : "Enable shuffle"}
                        className={`w-4 cursor-pointer ${shuffleMode ? 'text-red-600' : ''}`} 
                    />
                    <img 
                        onClick={previous} 
                        src={assets.prev_icon} 
                        alt='prev' 
                        title="Previous track"
                        className='w-4 cursor-pointer' 
                    />
                    {
                        playStatus ?
                            <img 
                                onClick={pause} 
                                src={assets.pause_icon} 
                                alt='pause' 
                                title="Pause"
                                className='w-4 cursor-pointer' 
                            />
                            :
                            <img 
                                onClick={play} 
                                src={assets.play_icon} 
                                alt='play' 
                                title="Play"
                                className='w-4 cursor-pointer' 
                            />
                    }
                    <img 
                        onClick={next} 
                        src={assets.next_icon} 
                        alt='next' 
                        title="Next track"
                        className='w-4 cursor-pointer' 
                    />
                    <span 
                        onClick={toggleLoop} 
                        className='cursor-pointer'
                        title={getLoopTitle()}
                    >
                        {loopMode === 0 && <img src={assets.loop_icon} alt='loop' className='w-4' />}
                        {loopMode === 1 && <FiRefreshCw className="w-4 h-4 text-red-600" />}
                        {loopMode === 2 && (
                            <div className="relative">
                                <FiRepeat className="w-4 h-4 text-red-600" />
                                <span className="absolute -top-2 -right-2 text-xs bg-red-600 rounded-full w-3 h-3 flex items-center justify-center text-white">1</span>
                            </div>
                        )}
                    </span>
                </div>
                <div className='flex items-center gap-5'>
                    <p>{time.currentTime.minute}:{time.currentTime.second < 10 ? '0' : ''}{time.currentTime.second}</p>
                    <div 
                        ref={seekBg} 
                        onClick={(e) => seekSong(e)}
                        onMouseDown={(e) => handleDragStart(e)}
                        onMouseMove={(e) => handleSeekHover(e)}
                        onMouseLeave={handleSeekLeave}
                        className='group relative h-1 w-[60vw] max-w-[500px] bg-gray-300 rounded-full cursor-pointer'
                        title="Seek"
                    >
                        {/* Progress bar */}
                        <div ref={seekBar} className='h-full border-none w-0 bg-red-800 rounded-full' />
                        
                        {/* Preview position indicator (appears on hover) */}
                        {hoverPosition !== null && (
                            <div className='absolute top-0 left-0 h-full bg-red-600 opacity-30 rounded-full'
                                style={{
                                    width: `${hoverPosition * 100}%`,
                                    display: isDragging ? 'none' : 'block'
                                }}>
                            </div>
                        )}
                        
                        {/* Seek knob */}
                        <div className='relative bottom-0.5 h-2.5 w-2.5 bg-red-800 rounded-full shadow-md transition-all pointer-events-none'
                            style={{
                                left: `${seekBar.current ? seekBar.current.clientWidth : 0}px`,
                                transform: `translate(-50%, -50%) scale(${isDragging || hoverPosition !== null ? 1.3 : 1})`,
                                opacity: isDragging || hoverPosition !== null ? 1 : 1,
                            }}>
                        </div>
                    </div>
                    <p>{time.totalTime.minute}:{time.totalTime.second < 10 ? '0' : ''}{time.totalTime.second}</p>
                </div>
            </div>
            <div className='hidden lg:flex items-center gap-2 opacity-75'>
                <img 
                    onClick={toggleQueue} 
                    src={assets.plays_icon} 
                    alt='plays' 
                    title="Now playing"
                    className='w-4 cursor-pointer' 
                />
                <img 
                    onClick={toggleQueue} 
                    src={assets.queue_icon} 
                    alt='queue' 
                    title="Show queue"
                    className='w-4 cursor-pointer' 
                />
                <img 
                    onClick={toggleMute} 
                    src={assets.speaker_icon} 
                    alt='speaker' 
                    title={isMuted ? "Unmute" : "Mute"}
                    className='w-4 cursor-pointer' 
                />
                <div 
                    onClick={toggleMute} 
                    className='cursor-pointer'
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {getVolumeIcon()}
                </div>
                <div 
                    ref={volumeBarRef}
                    onClick={handleVolumeChange}
                    className='w-20 bg-slate-50 h-1 rounded cursor-pointer'
                    title="Adjust volume"
                >
                    <div 
                        className='h-full bg-red-800 rounded'
                        style={{ width: `${volume * 100}%` }}
                    ></div>
                </div>
                <img 
                    onClick={toggleMiniPlayer} 
                    src={assets.mini_player_icon} 
                    alt='mini player' 
                    title="Toggle mini player"
                    className='w-4 cursor-pointer' 
                />
                <img 
                    onClick={toggleFullscreen} 
                    src={assets.zoom_icon} 
                    alt='fullscreen' 
                    title="Toggle fullscreen"
                    className='w-4 cursor-pointer' 
                />
            </div>
        </div>
    )
}

export default Player;