/* eslint-disable */

import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';

const LOCAL_STORAGE_KEY = '글제목';

function App() {
  return (
    <Router>
      <div className='App'>
        <div className='black-nav'>
          <h4>
            <Link to='/'>유사게시판</Link>
          </h4>
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/write" element={<WriteWrapper />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  const navigate = useNavigate();
  const location = useLocation(); // location 추가
  const [글제목, 글제목변경] = useState([]);

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const 저장된글제목 = storedData ? JSON.parse(storedData) : [];
    글제목변경(저장된글제목);
  }, []);

  useEffect(() => {
    const { state } = location;
    if (state && state.updatedPosts) {
      글제목변경(state.updatedPosts);
    }
  }, [location]); // location 의존성 추가

  const [selectedPost, setSelectedPost] = useState(null);

  const openModal = (post) => {
    setSelectedPost(post);
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  const deletePost = (index) => {
    if (window.confirm('진짜 삭제함 ?')) {
      const updatedPosts = [...글제목];
      updatedPosts.splice(index, 1);
      글제목변경(updatedPosts);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
      } catch (error) {
        console.error("Failed to update local storage", error);
      }
    }
  };

  const updatePost = (post, updateFn) => {
    const updatedPosts = 글제목.map((p) => {
      if (p === post) {
        return updateFn(p);
      }
      return p;
    });
    글제목변경(updatedPosts);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
    } catch (error) {
      console.error("실패함 ;;", error);
    }
  };

  const handlePostClick = (post, index) => {
    navigate(`/write?postId=${index}`);
  };
  
  const toggleLike = (post) => {
    updatePost(post, (p) => ({
      ...p,
      likes: p.likes ? p.likes + 1 : 1,
    }));
  };

  const toggleDislike = (post) => {
    updatePost(post, (p) => ({
      ...p,
      dislikes: p.dislikes ? p.dislikes + 1 : 1,
    }));
  };

  const addComment = (post, comment) => {
    updatePost(post, (p) => ({
      ...p,
      comments: p.comments ? [...p.comments, comment] : [comment],
    }));
    setSelectedPost({ ...post, comments: post.comments ? [...post.comments, comment] : [comment] });
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className="write-button-container">
        <Link to="/write" className="write-button">
          글쓰기
        </Link>
      </div>
      <div className='album'>
        {글제목.map((글, i) => (
          <div className='album-item' key={i} onClick={() => openModal(글)} style={{ cursor:'pointer'}}>
            {글.image ? (
              <img src={글.image} alt={글.title} />
            ) : (
              <img src={`https://via.placeholder.com/200x200?text=No+Image`} alt="No Image" />
            )}
            <h4>{글.title}</h4>
            <p>{글.date} 작성</p>
            <div className="album-item-buttons">
              <div className="like-dislike-buttons">
                <button
                  className={`like-button ${글.likes ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(글);
                  }}
                >
                  <span role="img" aria-label="likes">❤️</span>
                  {글.likes || 0}
                </button>
                <button
                  className={`dislike-button ${글.dislikes ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDislike(글);
                  }}
                >
                  <span role="img" aria-label="dislikes">👎</span>
                  {글.dislikes || 0}
                </button>
              </div>
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePost(i);
                }}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedPost && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <div className="write-preview">
              {selectedPost.image && (
                <img src={selectedPost.image} alt={selectedPost.title} className="write-image-preview" />
              )}
              <h4>{selectedPost.title}</h4>
              <p>{selectedPost.content}</p>
              <p>{selectedPost.date} 작성</p>
              <div className="like-dislike-buttons">
                <button
                  className={`like-button ${selectedPost.likes ? 'active' : ''}`}
                  onClick={() => toggleLike(selectedPost)}
                >
                  <span role="img" aria-label="likes">❤️</span>
                  {selectedPost.likes || 0}
                </button>
                <button
                  className={`dislike-button ${selectedPost.dislikes ? 'active' : ''}`}
                  onClick={() => toggleDislike(selectedPost)}
                >
                  <span role="img" aria-label="dislikes">👎</span>
                  {selectedPost.dislikes || 0}
                </button>
              </div>
              <button
                className="edit-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick(selectedPost, 글제목.indexOf(selectedPost));
                }}
              >
                수정
              </button>
              <div className='comment-section'></div>
              <h3>===== 댓글 =====</h3>
              {selectedPost.comments && selectedPost.comments.map((comment, index) => (
                <div key={index} className='comment'>
                  <p>{comment}</p>
                </div>
              ))}
              <input type="text" placeholder="댓글 작성" onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                  addComment(selectedPost, e.target.value.trim());
                  e.target.value = '';
                }
              }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Write({ mode, post }) {
  const [titleValue, setTitleValue] = useState(mode === 'edit' ? post.title : '');
  const [contentValue, setContentValue] = useState(mode === 'edit' ? post.content : '');
  const [imageValue, setImageValue] = useState(mode === 'edit' ? post.image : '');
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImageValue(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const now = new Date();
    const newPost = {
      title: titleValue,
      content: contentValue,
      image: imageValue,
      date: now.toLocaleDateString(),
      likes: 0,
      dislikes: 0,
      comments: [],
    };
  
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const 글제목 = storedData ? JSON.parse(storedData) : [];
      const updatedPosts = [...글제목, newPost];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
      navigate('/', { state: { updatedPosts } });
    } catch (error) {
      console.error("Failed to save new post", error);
    }
  };

  const handleUpdate = () => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const 글제목 = storedData ? JSON.parse(storedData) : [];
      const updatedPosts = 글제목.map((p, index) =>
        p === post
          ? {
              ...p,
              title: titleValue,
              content: contentValue,
              image: imageValue,
              date: new Date().toLocaleDateString(),
            }
          : p
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
      navigate('/', { state: { updatedPosts } });
    } catch (error) {
      console.error("Failed to update post", error);
    }
  };

  return (
    <div className="write-container">
      <h4>{mode === 'edit' ? '글 수정' : '새 글 작성'}</h4>
      <div className="write-preview">
        <div className="write-image-container">
          <label htmlFor="image-input">
            {imageValue ? (
              <img src={imageValue} alt="Preview" className="write-image-preview" />
            ) : (
              <div className="image-placeholder">
                <span>이미지 선택</span>
              </div>
            )}
          </label>
          <input
            id="image-input"
            type="file"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>
        <input
          className="write-title-input"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          placeholder="제목"
        />
        <textarea
          className="write-content-input"
          value={contentValue}
          onChange={(e) => setContentValue(e.target.value)}
          placeholder="내용"
        ></textarea>
      </div>
      {mode === 'edit' ? (
        <button className="write-submit-button" onClick={handleUpdate}>
          Update
        </button>
      ) : (
        <button className="write-submit-button" onClick={handleSubmit}>
          Save
        </button>
      )}
    </div>
  );
}

function WriteWrapper() {
  const [mode, setMode] = useState('create');
  const [post, setPost] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const postId = searchParams.get('postId');
    if (postId) {
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        const 글제목 = storedData ? JSON.parse(storedData) : [];
        const selectedPost = 글제목[parseInt(postId, 10)];
        if (selectedPost) {
          setMode('edit');
          setPost(selectedPost);
        }
      } catch (error) {
        console.error("Failed to retrieve post for editing", error);
      }
    }
  }, [location]);

  return <Write mode={mode} post={post} />;
}

export default App; 