import React, {useState} from 'react';
import axios from 'axios';
import API_URL from "../../config";
import './SearchPage.css'; // 引入 CSS 文件
import {Link} from 'react-router-dom';
import addToPlaylist from "../func/addToPlaylist";

function SearchPage() {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [visibleItems, setVisibleItems] = useState(20); // 初始可见项数

    const handleSearch = async () => {
        if (!keyword) return;

        setLoading(true);
        setError('');
        setResults([]); // 清空之前的结果

        try {
            const response = await axios.get(`${API_URL}/api/search?keyword=${keyword}`);
            if (response.data.code === 200) {
                setResults(response.data.result.songs);
            } else {
                setError('未找到结果');
            }
        } catch (err) {
            setError('请求失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const loadMoreItems = () => {
        setVisibleItems(prev => Math.min(prev + 20, results.length)); // 每次加载20个
    };

    return (
        <div className="search-page" style={{padding: '20px', height: '80%', overflow: 'auto'}}>
            <h1>音乐搜索</h1>
            <div className="search-input">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="输入歌曲或艺术家名称"
                />
                <button onClick={handleSearch}>搜索</button>
            </div>

            {loading && <p>加载中...</p>}
            {error && <p className="error">{error}</p>}

            {results.length > 0 && (
                <div className="results-grid" style={{display: 'flex', flexDirection: 'column'}}>
                    <h2>搜索结果:</h2>
                    <ul style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%'}}>
                        {results.slice(0, visibleItems).map((song) => (
                            <li key={song.id} className="result-item" style={{width: '24%', marginBottom: '10px'}}>
                                {song.album.artist.img1v1Url && (
                                    <img
                                        className="cover_img"
                                        src={`${API_URL}/music_cover/${song.id}.png`}
                                        alt={song.album.artist.name}
                                        style={{width: '100%', margin: '3px'}}
                                    />
                                )}
                                <Link to={`/song?id=${song.id}`} onClick={() => { /* setMusicId(song.id); */
                                }}>
                                    <p>{song.artists.map(artist => artist.name).join(', ')} - {song.name}</p>
                                </Link>
                                <p>专辑: {song.album.name}</p>
                                <p>时长: {Math.floor(song.duration / 1000)} 秒</p>
                                <button onClick={() => addToPlaylist({
                                    id: song.id,
                                    artist: song.artists.map(artist => artist.name).join(', '),
                                    title: song.name
                                })} className='addWebSong'>添加
                                </button>
                            </li>
                        ))}
                    </ul>
                    {visibleItems < results.length && (
                        <button onClick={loadMoreItems} id='btn_load_more' style={{marginBottom: '45px'}}>
                            查看更多
                        </button>
                    )}
                </div>
            )}

            {results.length === 0 && !loading && !error && <p>没有搜索结果</p>}
        </div>
    );
}

export default SearchPage;