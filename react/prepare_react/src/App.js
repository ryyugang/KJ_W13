// warning 무시해주는 코드
/* eslint-disable */

// React와 React Router 라이브러리 호출
import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';

// local storage에 저장할 키 값을 정의 
const LOCAL_STORAGE_KEY = '글제목';

// App Routing 설정
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
          <Route path="/write" element={<Write />} />
        </Routes>
      </div>
    </Router>
  );
}

/* Hook 
  : 함수 Component에서 state와 같은 기능들을 사용할 수 있게 하는 기능
    -> 데이터의 변동에 '함수 Component' 또한 유연하게 동작할 수 있게 한다
    -> 데이터의 변동이 있어도 해당 Component Rerendering -> UI update
    
  - useState : Component에서 state 관리할 수 있게 함
  - useEffect : Component의 Rendering 이후 특정 작업 수행하게 함
  - useContext : React Context API 구독하게 함 (?)
  - useReducer : Component의 state update logic을 Component에서 분리 
*/

// Main Page Component
function Home() {
  
  // navigate 함수를 가져와 페이지 이동 가능하게 함
  const navigate = useNavigate();
  
  // 현재 URL 정보 가져옴
  const location = useLocation();
  
  // 게시물 상태와 함수 정의
  /* posts 상태 초기값을 빈 배열로 설정 */
  const [posts, setPosts] = useState([]);
  
  // 선택된 게시물 상태와 함수 정의
  const [selectedPost, setSelectedPost] = useState(null);

  // Component가 처음 Rendering 될 때 Local Storage에서 게시물 데이터를 가져와 상태에 저장
  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    /* storedData True 
      -> storedData : local storage에 저장된 데이터 (일반적으로 JSON 문자열)
      -> JSON.parse() : 문자열을 객체로 변환
      => local storage에 저장된 문자열을 JS 객체로 변환 => storedPosts에 할당
      
       storedData False
      => storedPosts에 빈 배열 할당
    */
    const storedPosts = storedData ? JSON.parse(storedData) : [];
    setPosts(storedPosts);
  }, []);

  /* Dependency Array
    1) []
    - Component Mount 될 때 (= Component 처음으로 Rendering -> DOM Tree Insert) useEffect 내부 코드 실행
    - Component Unmount 될 때 (= Component DOM Tree Delete) cleanup 함수 실행

    2) Value True
    - Component Mount 될 때 useEffect 내부 코드 실행
    - Dependency Array Value 값 변경 시 useEffect 내부 코드 실행
    - Component Unmount 될 때 cleanup 함수 실행

    3) Value False
    - Component Mount 될 때 useEffect 내부 코드 실행
    - Component Update 시 useEffect 내부 코드 실행
    - Component Unmount 될 때 cleanup 함수 실행
  */

  // URL 변경 시 업데이트된 게시물 데이터를 상태에 저장
  useEffect(() => {
    const { state } = location;
    if (state && state.updatedPosts) {
      setPosts(state.updatedPosts);
    }
  }, [location]);

  // ESC를 누를 때 모달 창 닫게 함
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 모달창 열고 선택된 게시물 상태 업데이트
  const openModal = (post) => {
    setSelectedPost(post);
  };

  // 모달창 닫고 선택된 게시물 상태 초기화
  const closeModal = () => {
    setSelectedPost(null);
  };

  // 게시물 삭제
  const deletePost = (index) => {
    if (window.confirm('진짜 삭제함 ?')) {
      const updatedPosts = [...posts];
      updatedPosts.splice(index, 1);
      setPosts(updatedPosts);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
      } catch (error) {
        console.error("삭제 실패함 ;;", error);
      }
    }
  };

  // 게시물 수정
  const updatePost = (updatedPost) => {
    const updatedPosts = posts.map((p) => (p === selectedPost ? updatedPost : p));
    setPosts(updatedPosts);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
    } catch (error) {
      console.error("수정 실패함 ;;", error);
    }
  };

  // 선택된 게시물의 좋아요 수 증가
  const toggleLike = (post) => {
    const updatedPosts = posts.map((p) =>
      p === post ? { ...p, likes: p.likes ? p.likes + 1 : 1 } : p
    );
    setPosts(updatedPosts);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
    } catch (error) {
      console.error("좋아요 업데이트 실패함 ;;", error);
    }
  };

// 선택된 게시물의 싫어요 수 증가
  const toggleDislike = (post) => {
    const updatedPosts = posts.map((p) =>
      p === post ? { ...p, dislikes: p.dislikes ? p.dislikes + 1 : 1 } : p
    );
    setPosts(updatedPosts);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
    } catch (error) {
      console.error("싫어요 업데이트 실패함 ;;", error);
    }
  };


  // 선택된 게시물에 댓글 추가
  const addComment = (comment) => {
    const updatedPost = {
      ...selectedPost,
      comments: selectedPost.comments ? [...selectedPost.comments, comment] : [comment],
    };
    updatePost(updatedPost);
    setSelectedPost(updatedPost);
  };

  // Main Page UI Rendering
  return (
    <>
      <div className="write-button-container">
        <Link to="/write" className="write-button">
          글쓰기
        </Link>
      </div>
      <div className='album'>
        {posts.map((post, i) => (
          <div className='album-item' key={i} onClick={() => openModal(post)} style={{ cursor: 'pointer' }}>
            {post.image ? (
              <img src={post.image} alt={post.title} />
            ) : (
              <img src={`https://via.placeholder.com/200x200?text=No+Image`} alt="No Image" />
            )}
            <h4>{post.title}</h4>
            <p>{post.date} 작성</p>
            <div className="album-item-buttons">
              <div className="like-dislike-buttons">
                <button
                  className={`like-button ${post.likes ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(post);
                  }}
                >
                  <span role="img" aria-label="likes">❤️</span>
                  {post.likes || 0}
                </button>
                <button
                  className={`dislike-button ${post.dislikes ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDislike(post);
                  }}
                >
                  <span role="img" aria-label="dislikes">👎</span>
                  {post.dislikes || 0}
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
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  navigate(`/write?postId=${posts.indexOf(selectedPost)}`);
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
                  addComment(e.target.value.trim());
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

// 글쓰기 페이지 Component
function Write() {

  // 제목, 내용, 이미지 상태와 함수 정의
  const [titleValue, setTitleValue] = useState('');
  const [contentValue, setContentValue] = useState('');
  const [imageValue, setImageValue] = useState('');

  // navigate 함수 가져와 페이지 이동 가능하게 함
  const navigate = useNavigate();
  // 현재 URL 정보 가져옴
  const location = useLocation();
  // 글 수정 모드 상태와 함수 정의
  const [isEditing, setIsEditing] = useState(false);
  // 수정할 게시물 상태와 함수 정의
  const [editingPost, setEditingPost] = useState(null);

  // URL 변경 시 게시물 수정 모드로 전환, 수정할 게시물 데이터를 상태에 저장
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const postId = searchParams.get('postId');
    if (postId) {
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        const posts = storedData ? JSON.parse(storedData) : [];
        const selectedPost = posts[parseInt(postId, 10)];
        if (selectedPost) {
          setIsEditing(true);
          setEditingPost(selectedPost);
          setTitleValue(selectedPost.title);
          setContentValue(selectedPost.content);
          setImageValue(selectedPost.image);
        }
      } catch (error) {
        console.error("Failed to retrieve post for editing", error);
      }
    }
  }, [location]);

  // 이미지 파일을 변경할 때 호출
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

  // 게시물을 저장하고 메인 페이지로 이동
  const savePost = (updatedPosts) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
      navigate('/', { state: { updatedPosts } });
    } catch (error) {
      console.error("Failed to save post", error);
    }
  };

  // 새 글을 작성하고 메인 페이지로 이동
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
      const posts = storedData ? JSON.parse(storedData) : [];
      const updatedPosts = [...posts, newPost];
      savePost(updatedPosts);
    } catch (error) {
      console.error("Failed to save new post", error);
    }
  };

  // 게시물을 수정하고 메인 페이지로 이동
  const handleUpdate = () => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const posts = storedData ? JSON.parse(storedData) : [];
      const updatedPosts = posts.map((p) =>
        p === editingPost
          ? {
              ...p,
              title: titleValue,
              content: contentValue,
              image: imageValue,
              date: new Date().toLocaleDateString(),
            }
          : p
      );
      savePost(updatedPosts);
    } catch (error) {
      console.error("Failed to update post", error);
    }
  };

  // 글쓰기 페이지와 UI Rendering
  return (
    <div className="write-container">
      <h4>{isEditing ? '글 수정' : '새 글 작성'}</h4>
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
      {isEditing ? (
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

export default App;