import React, {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router-dom';
import API_URL from '../../config';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {MdDragIndicator, MdClose} from 'react-icons/md';
import PropTypes from 'prop-types'; // 添加PropTypes验证
import './CurrentList.css'; // 引入样式文件

function CurrentList({pid, setMusicId, handleNextSong, toggleVisable}) {
    const [data, setData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // 获取播放列表数据
    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/userSongList?pid=${pid}`);
            const responseData = await res.json();
            const convertedData = convertData(responseData);
            setData(convertedData);
            localStorage.setItem('currentPlaylist', JSON.stringify(convertedData));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [pid]);

    // 转换数据格式
    const convertData = (data) => ({
        "播放列表": data["播放列表"].map(([id, title, artist]) => ({
            id,
            title: title || "Unknown Title",
            artist: artist || "Unknown Artist",
        })),
    });

    // 初始化数据
    useEffect(() => {
        const cachedData = localStorage.getItem('currentPlaylist');
        if (cachedData) {
            setData(JSON.parse(cachedData));
        } else {
            fetchData();
        }
    }, [fetchData]);

    // 删除歌曲
    const handleRemove = (id) => {
        setData((prev) => {
            const updated = {
                ...prev,
                播放列表: prev.播放列表.filter((item) => item.id !== id),
            };
            localStorage.setItem('currentPlaylist', JSON.stringify(updated));
            return updated;
        });
    };

    // 处理拖动结束事件
    const handleDragEnd = (result) => {
        if (!result.destination || !isEditing) return;
        if (result.source.index === result.destination.index) return;

        const items = [...data.播放列表]; // 创建新的数组副本
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const newData = {...data, 播放列表: items};
        setData(newData);
        localStorage.setItem('currentPlaylist', JSON.stringify(newData));
    };

    return (
        <div className="playlist-container">
            <div className="edit-control">
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`edit-button ${isEditing ? 'active' : ''}`}
                >
                    {isEditing ? '完成编辑' : '编辑列表'}
                </button>
                {isEditing && <span className="edit-hint">长按拖动歌曲排序</span>}
            </div>

            {data ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="songs">
                        {(provided) => (
                            <ul
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="song-list"
                            >
                                {data.播放列表.map((item, index) => (
                                    <Draggable
                                        key={item.id}
                                        draggableId={String(item.id)}
                                        index={index}
                                        isDragDisabled={!isEditing}
                                    >
                                        {(provided, snapshot) => (
                                            <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`song-item ${
                                                    snapshot.isDragging ? 'dragging' : ''
                                                } ${isEditing ? 'editing' : ''}`}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    background: snapshot.isDragging ? '#f0f0f0' : 'white',
                                                    transition: 'background-color 0.2s ease',
                                                }}
                                            >
                                                <div className="song-content">
                                                    {/* 拖拽手柄 */}
                                                    {isEditing && (
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="drag-handle"
                                                            style={{touchAction: 'none', cursor: 'grab'}}
                                                        >
                                                            <MdDragIndicator size={20}/>
                                                        </div>
                                                    )}

                                                    <Link
                                                        to={`/song?id=${item.id}`}
                                                        onClick={() => {
                                                            setMusicId(item.id);
                                                            handleNextSong(item.id);
                                                        }}
                                                        className="song-info"
                                                    >
                                                        <h3>{item.title}</h3>
                                                        <p>{item.artist}</p>
                                                    </Link>

                                                    {/* 删除按钮 */}
                                                    {isEditing && (
                                                        <button
                                                            onClick={() => handleRemove(item.id)}
                                                            className="delete-button"
                                                        >
                                                            <MdClose size={18}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </li>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
            ) : (
                <p>加载中...</p>
            )}
        </div>
    );
}

// PropTypes验证
CurrentList.propTypes = {
    pid: PropTypes.string.isRequired,
    setMusicId: PropTypes.func.isRequired,
    handleNextSong: PropTypes.func.isRequired,
    toggleVisable: PropTypes.func,
};

export default CurrentList;