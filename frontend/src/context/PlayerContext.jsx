import { createContext, useEffect } from "react";
import { useRef, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const PlayerContext = createContext();

export const PlayerContextProvider = (props) => {
    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();
    const volumeBarRef = useRef();

    const [isDragging, setIsDragging] = useState(false);
    const [hoverPosition, setHoverPosition] = useState(null);
    const [shuffleMode, setShuffleMode] = useState(false);
    const [loopMode, setLoopMode] = useState(0); // 0: no loop, 1: loop all, 2: loop one
    const [volume, setVolume] = useState(0.7); // Default volume 70%
    const [prevVolume, setPrevVolume] = useState(0.7); // For mute/unmute
    const [isMuted, setIsMuted] = useState(false);
    const [queueVisible, setQueueVisible] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMiniPlayer, setIsMiniPlayer] = useState(false);
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

    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [track, setTrack] = useState({
        name: 'No Track Selected',
        desc: '',
        image: '/logo.png',
        file: '',
        duration: '0:00'
    });
    const [playlist, setPlaylist] = useState([]);
    const [playStatus, setPlayStatus] = useState(false);

    const setCurrentPlaylist = (newPlaylist) => {
        if (!newPlaylist || newPlaylist.length === 0) {
            console.warn("Empty playlist provided");
            return;
        }
        setPlaylist(newPlaylist);
    };

    // Basic playback controls
    const play = () => {
        if (audioRef.current) {
            if (!audioRef.current.src) {
                console.warn("No audio source available");
                toast.warn("No track selected");
                return;
            }

            const playPromise = audioRef.current.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setPlayStatus(true);
                    })
                    .catch(err => {
                        console.error("Play error:", err);
                        setPlayStatus(false);
                    });
            } else {
                setPlayStatus(true);
            }
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setPlayStatus(false);
        }
    }

    // Update the playWithId function to properly handle play promises

    const playWithId = (songId) => {
        // Find the song in our current playlist
        const songIndex = playlist.findIndex(song => song._id === songId);

        if (songIndex !== -1) {
            setCurrentTrackIndex(songIndex);
            setTrack(playlist[songIndex]);
            setPlayStatus(true);

            // Reset audio element to play the new track
            if (audioRef.current) {
                // Store current play promise to avoid race conditions
                const audio = audioRef.current;

                // Cancel any ongoing play operations
                if (audio.currentSrc) {
                    audio.pause();
                }

                // Set new source and load
                audio.src = playlist[songIndex].file;
                audio.load();

                // Play with proper error handling and delay
                setTimeout(() => {
                    const playPromise = audio.play();

                    // Only handle the promise if it exists (some browsers might not return a promise)
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            // Only show error if this is still the current track
                            if (currentTrackIndex === songIndex) {
                                console.error("Error playing audio:", err);
                                toast.error("Error playing this track");
                            }
                        });
                    }
                }, 100); // Small delay to ensure loading has started
            }
        } else {
            // If song not found in current playlist, fetch it from backend
            axios.get(`http://localhost:4000/api/songs/${songId}`)
                .then(response => {
                    if (response.data.success) {
                        const song = response.data.song;
                        setPlaylist([song]);
                        setCurrentTrackIndex(0);
                        setTrack(song);
                        setPlayStatus(true);

                        if (audioRef.current) {
                            const audio = audioRef.current;

                            // Cancel any ongoing play operations
                            if (audio.currentSrc) {
                                audio.pause();
                            }

                            audio.src = song.file;
                            audio.load();

                            setTimeout(() => {
                                const playPromise = audio.play();
                                if (playPromise !== undefined) {
                                    playPromise.catch(err => {
                                        console.error("Error playing audio:", err);
                                        toast.error("Error playing this track");
                                    });
                                }
                            }, 100);
                        }
                    }
                })
                .catch(err => {
                    console.error("Error fetching song:", err);
                    toast.error("Could not play this song");
                });
        }
    };

    // Update previous function
    const previous = async () => {
        if (!playlist.length) return;

        if (shuffleMode) {
            playRandomTrack();
            return;
        }

        let newIndex = currentTrackIndex - 1;
        if (newIndex < 0) newIndex = playlist.length - 1;

        setCurrentTrackIndex(newIndex);
        setTrack(playlist[newIndex]);

        if (audioRef.current) {
            const audio = audioRef.current;

            if (audio.currentSrc) {
                audio.pause();
            }

            audio.src = playlist[newIndex].file;
            audio.load();

            setTimeout(() => {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.error("Error playing previous track:", err);
                    });
                }
                setPlayStatus(true);
            }, 100);
        }
    }

    // Update next function
    const next = async () => {
        if (!playlist.length) return;

        if (shuffleMode) {
            playRandomTrack();
            return;
        }

        let newIndex = currentTrackIndex + 1;
        if (newIndex >= playlist.length) newIndex = 0;

        setCurrentTrackIndex(newIndex);
        setTrack(playlist[newIndex]);

        if (audioRef.current) {
            const audio = audioRef.current;

            if (audio.currentSrc) {
                audio.pause();
            }

            audio.src = playlist[newIndex].file;
            audio.load();

            setTimeout(() => {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.error("Error playing next track:", err);
                    });
                }
                setPlayStatus(true);
            }, 100);
        }
    }

    // New functionality
    const toggleShuffle = () => {
        setShuffleMode(!shuffleMode);
    }

    const toggleLoop = () => {
        // Cycle through loop modes: no loop -> loop all -> loop one -> no loop
        setLoopMode((prevMode) => (prevMode + 1) % 3);
    }

    const playRandomTrack = async () => {
        if (!playlist.length) return;

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * playlist.length);
        } while (randomIndex === currentTrackIndex && playlist.length > 1);

        setCurrentTrackIndex(randomIndex);
        setTrack(playlist[randomIndex]);

        if (audioRef.current) {
            const audio = audioRef.current;

            if (audio.currentSrc) {
                audio.pause();
            }

            audio.src = playlist[randomIndex].file;
            audio.load();

            setTimeout(() => {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.error("Error playing random track:", err);
                    });
                }
                setPlayStatus(true);
            }, 100);
        }
    }

    const handleVolumeChange = (e) => {
        if (volumeBarRef.current && audioRef.current) {
            const rect = volumeBarRef.current.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const width = rect.width;
            const newVolume = Math.max(0, Math.min(1, offsetX / width));

            setVolume(newVolume);
            setIsMuted(newVolume === 0);
            audioRef.current.volume = newVolume;
        }
    }

    const toggleMute = () => {
        if (!audioRef.current) return;

        if (isMuted) {
            // Unmute
            setIsMuted(false);
            setVolume(prevVolume > 0 ? prevVolume : 0.5);
            audioRef.current.volume = prevVolume > 0 ? prevVolume : 0.5;
        } else {
            // Mute
            setPrevVolume(volume);
            setIsMuted(true);
            setVolume(0);
            audioRef.current.volume = 0;
        }
    }

    const toggleQueue = () => {
        setQueueVisible(!queueVisible);
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }

    const toggleMiniPlayer = () => {
        setIsMiniPlayer(!isMiniPlayer);
        // Additional logic for mini player would go here
    }

    // Seek functionality
    const updateSeekPosition = (e) => {
        if (!seekBg.current || !audioRef.current) return;

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
        if (!seekBg.current) return;

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
        // This effect runs whenever track changes
        if (audioRef.current && track) {
            // Set up a listener for when the new audio is ready to play
            const handleCanPlay = () => {
                if (playStatus) {
                    audioRef.current.play()
                        .catch(error => console.error("Error auto-playing track:", error));
                }
            };

            audioRef.current.addEventListener('canplaythrough', handleCanPlay);

            // Clean up listener
            return () => {
                if (audioRef.current) {
                    audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
                }
            };
        }
    }, [track, playStatus]);

    // Set up audio event handlers
    useEffect(() => {
        // Set initial volume if audio element exists
        if (audioRef.current) {
            audioRef.current.volume = volume;

            // Set up event listeners
            const setupAudioListeners = () => {
                // Time update handler
                audioRef.current.ontimeupdate = () => {
                    // Only update width if seekBar exists and duration is available
                    if (seekBar.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
                        seekBar.current.style.width = `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%`;
                    } else if (seekBar.current) {
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
                };

                // Track end handler
                audioRef.current.onended = () => {
                    if (!playlist.length) return;

                    if (loopMode === 2) {
                        // Loop one song
                        audioRef.current.currentTime = 0;
                        audioRef.current.play();
                    } else if (loopMode === 1) {
                        // Loop all - play next song or go back to first
                        const newIndex = (currentTrackIndex + 1) % playlist.length;
                        setCurrentTrackIndex(newIndex);
                        setTrack(playlist[newIndex]);
                        // The useEffect will handle the play()
                    } else {
                        // No loop mode
                        if (shuffleMode) {
                            // Shuffle - play random song
                            playRandomTrack();
                        } else if (currentTrackIndex < playlist.length - 1) {
                            // Not at the end - play next song
                            const newIndex = currentTrackIndex + 1;
                            setCurrentTrackIndex(newIndex);
                            setTrack(playlist[newIndex]);
                        } else {
                            // At the end of playlist
                            setPlayStatus(false);
                        }
                    }
                };

                // Metadata loaded handler
                audioRef.current.onloadedmetadata = () => {
                    setTime(prevTime => ({
                        ...prevTime,
                        totalTime: {
                            second: Math.floor(audioRef.current.duration % 60),
                            minute: Math.floor(audioRef.current.duration / 60),
                        },
                    }));
                };
            };

            // Set up event listeners with a small delay to ensure audio element is fully ready
            const timeoutId = setTimeout(setupAudioListeners, 100);

            return () => {
                clearTimeout(timeoutId);

                // Clean up event handlers on unmount or when track changes
                if (audioRef.current) {
                    audioRef.current.ontimeupdate = null;
                    audioRef.current.onended = null;
                    audioRef.current.onloadedmetadata = null;
                }
            };
        }
    }, [audioRef, currentTrackIndex, shuffleMode, loopMode]);

    const contextValue = {
        audioRef,
        seekBg,
        seekBar,
        volumeBarRef,
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
        shuffleMode,
        toggleShuffle,
        loopMode,
        toggleLoop,
        volume,
        handleVolumeChange,
        isMuted,
        toggleMute,
        queueVisible,
        toggleQueue,
        isFullscreen,
        toggleFullscreen,
        isMiniPlayer,
        toggleMiniPlayer,
        playlist,
        setCurrentPlaylist,
        currentTrackIndex
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
            <audio ref={audioRef} />
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;