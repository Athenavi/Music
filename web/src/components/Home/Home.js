import React, {useEffect, useRef, useState} from 'react';
import {useLocation} from "react-router-dom";
import SongDetail from '../SongDetail/SongDetail';
import CurrentList from "../CurrentList/CurrentList";
import API_URL from '../../config';
import './Home.css';
import {likeThisSong, shareThisSong} from "../func/songMenu";
import {FaHeart, FaList, FaMusic} from 'react-icons/fa';

// Playlist component
const Playlist = ({coverUrl, toggleVisable, likeThisSong, shareThisSong, playing, musicId}) => {
    const imgRef = useRef(null);

    useEffect(() => {
        const img = imgRef.current;
        if (img) {
            img.classList.toggle('rotating', playing);
        }
    }, [playing]);

    return (
        <div className="player-panel">
            <div className="album-art-container">
                <img
                    ref={imgRef}
                    src={coverUrl}
                    alt="专辑封面"
                    className={`album-art ${playing ? 'playing' : ''}`}
                />
                <div className="art-overlay"></div>
            </div>

            <div className="control-buttons">
                <button
                    className="icon-btn"
                    onClick={() => likeThisSong()}
                    title="收藏"
                >
                    <FaHeart className="icon"/>
                </button>
                <button
                    className="icon-btn"
                    onClick={() => toggleVisable('lrc_div')}
                    title="歌词"
                >
                    <FaMusic className="icon"/>
                </button>
                <button
                    className="icon-btn"
                    onClick={() => toggleVisable('other_div')}
                    title="播放列表"
                >
                    <FaList className="icon"/>
                </button>
            </div>
        </div>
    )

};

function Home({playing, setPlaying, handleNextSong, token, audioRef}) {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [musicId, setMusicId] = useState(searchParams.get("id") || "0");
    const [playlistId, setPlaylistId] = useState(searchParams.get("pid") || "0");
    const [coverUrl, setCoverUrl] = useState(`${API_URL}/music_cover/${musicId}.png`);
    const lrcDivRef = useRef(null);
    const otherDivRef = useRef(null);
    const songElementRef = useRef(null);

    useEffect(() => {
        setMusicId(searchParams.get("id") || "0");
        setPlaylistId(searchParams.get("pid") || "0");
        setCoverUrl(`${API_URL}/music_cover/${musicId}.png`);
        localStorage.setItem('currentId', musicId);
    }, [location]);

    useEffect(() => {
        if (playing) {
            setCoverUrl(`${API_URL}/music_cover/${musicId}.png`);
        }
    }, [playing, musicId]);


    const toggleVisable = (id) => {
        let element;
        let songElement = songElementRef.current;

        if (id === 'lrc_div') {
            element = lrcDivRef.current;
        } else if (id === 'other_div') {
            element = otherDivRef.current;
        }

        if (element && songElement) {
            const elementDisplay = window.getComputedStyle(element).display;

            if (elementDisplay === 'none') {
                element.style.display = 'block';
                if (id === 'lrc_div') songElement.style.width = '55%';
            } else {
                element.style.display = 'none';
                if (id === 'lrc_div') songElement.style.width = '40%';
            }
        }
    };


    useEffect(() => {
        const audio = audioRef.current;
        const lyricsDiv = document.getElementById('lyrics');
        const lyricLines = lyricsDiv.getElementsByTagName('p');
        let activeLine = null;

        const handleTimeUpdate = () => {
            const url = new URL(audio.src);
            const currentMusicId = url.pathname.split('/')[2].split('.')[0];

            // 检查播放器 URL 中的音乐 ID 是否和歌词页面的 ID 相匹配
            if (currentMusicId !== musicId) {
                return;
            }

            const currentTime = audio.currentTime;

            for (let i = 0; i < lyricLines.length; i++) {
                const timeStr = lyricLines[i].id.split('_')[1];
                const lineTime = parseLyricTime(timeStr);

                if (currentTime >= lineTime) {
                    if (activeLine) {
                        activeLine.classList.remove('active');
                    }
                    activeLine = lyricLines[i];
                    activeLine.classList.add('active');
                } else {
                    break;
                }
            }

            if (activeLine) {
                activeLine.scrollIntoView({behavior: "smooth", block: "center"});
            }
        };

        function parseLyricTime(timeStr) {
            const parts = timeStr.split(':');
            const minutes = parseInt(parts[0], 10);
            const seconds = parseFloat(parts[1]);
            return minutes * 60 + seconds;
        }

        audio.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [musicId, playing, audioRef]);

    return (
        <div className="music-app">
            <div className="app-container">
                <Playlist
                    coverUrl={coverUrl}
                    toggleVisable={toggleVisable}
                    likeThisSong={likeThisSong}
                    shareThisSong={shareThisSong}
                    playing={playing}
                    musicId={musicId}
                />

                <div className="lyrics-panel" id="lrc_div" key={musicId}>
                    <div className="lyrics-container">
                        <SongDetail musicId={musicId} key={musicId}/>
                    </div>
                </div>

                <div className="playlist-panel" id="other_div">
                    <div className="playlist-container">
                        <CurrentList
                            pid={playlistId}
                            setMusicId={setMusicId}
                            handleNextSong={handleNextSong}
                            key={musicId}
                            toggleVisable={toggleVisable}
                        />
                    </div>
                </div>
            </div>

            <footer className="app-footer">
                © {new Date().getFullYear()} 7trees.cn 用音乐感动生活
            </footer>
        </div>
    );
}

export default Home;