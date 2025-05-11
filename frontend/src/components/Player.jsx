import React, { useContext } from 'react'
import { assets } from '../assets/frontend-assets/assets';
import { PlayerContext } from '../context/PlayerContext';

function Player() {
    const { 
        track, 
        seekBg, 
        seekBar, 
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
        handleSeekLeave
    } = useContext(PlayerContext);

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
                    <img src={assets.shuffle_icon} alt='shuffle' className='w-4 cursor-pointer' />
                    <img onClick={previous} src={assets.prev_icon} alt='prev' className='w-4 cursor-pointer' />
                    {
                        playStatus ?
                            <img onClick={pause} src={assets.pause_icon} alt='play' className='w-4 cursor-pointer' />
                            :
                            <img onClick={play} src={assets.play_icon} alt='play' className='w-4 cursor-pointer' />
                    }
                    <img onClick={next} src={assets.next_icon} alt='next' className='w-4 cursor-pointer' />
                    <img src={assets.loop_icon} alt='loop' className='w-4 cursor-pointer' />
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
                <img src={assets.plays_icon} alt='plays' className='w-4' />
                <img src={assets.mic_icon} alt='plays' className='w-4' />
                <img src={assets.queue_icon} alt='plays' className='w-4' />
                <img src={assets.speaker_icon} alt='plays' className='w-4' />
                <img src={assets.volume_icon} alt='plays' className='w-4' />
                <div className='w-20 bg-slate-50 h-1 rounded'>

                </div>
                <img src={assets.mini_player_icon} alt='plays' className='w-4' />
                <img src={assets.zoom_icon} alt='plays' className='w-4' />
            </div>
        </div>
    )
}

export default Player;