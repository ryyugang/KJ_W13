// warning 무시해주는 코드
/* eslint-disable */

// React와 React Router 라이브러리 호출
import './App.css';
import logo from './logo.png';
import video from './doyo.mp4';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';

// local storage에 저장할 키 값을 정의 
const LOCAL_STORAGE_KEY = '글제목';
const USER_STORAGE_KEY = '사용자';

/* App Routing 설정 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 상태와 함수 정의
  const [currentUser, setCurrentUser] = useState(null); // 현재 사용자 상태와 함수 정의

  /* Component mount 시 로그인 상태 확인 및 현재 사용자 정보 가져옴 */ 
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const longinTime = new Date(user.loginTime);
      const currentTime = new Date();
      const loginDuration = 30 * 60 * 1000; // 30분

      // 로그인 시간이 30분 이내일 때 로그인 상태 유지
      if (currentTime.getTime() - longinTime.getTime() < loginDuration) {
        setIsLoggedIn(true);
        setCurrentUser(user);
      } else {
        // 로그인 시간이 30분 이상일 때 로그아웃
        localStorage.removeItem(currentUser);
      }
    }
  }, []);

  /* 로그인 시 로컬 스토리지에 사용자 정보 저장 */
  const handleLogin = (user) => {
    const loginTime = new Date();
    const userWithLoginTime = { ...user, loginTime };
    localStorage.setItem('currentUser', JSON.stringify(userWithLoginTime));
    setIsLoggedIn(true);
    setCurrentUser(userWithLoginTime);
  };

  /* 로그아웃 시 로컬 스토리지에서 사용자 정보 삭제 */
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className='App'>
        <div className='black-nav'>
          <h4>
            <Link to='/'>
              <img src={logo} alt='logo' />
            </Link>
          </h4>
          <div className='video-container'>
            <video src={video} autoPlay loop muted playsInline className='video'/>
          </div>
          <div className='auth-buttons-container'>
            {isLoggedIn ? (
              <button className='auth-button' onClick={handleLogout}>
                로그아웃
              </button>
            ) : (
              <>
                <Link to='/login' className='auth-button'>
                  로그인
                </Link>
                <Link to='/signup' className='auth-button'>
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
          
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} currentUser={currentUser} />} />
          <Route path="/write" element={<Write isLoggedIn={isLoggedIn} currentUser={currentUser} />} />
          <Route path="/login" element={<Login handleLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
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

/* Main Page Component */
function Home({ isLoggedIn, currentUser }) {
  
  // 현재 URL 정보 가져옴
  const location = useLocation();
  
  // 게시물 상태와 함수 정의
  /* posts 상태 초기값을 빈 배열로 설정 */
  const [posts, setPosts] = useState([]);
  
  // 선택된 게시물 상태와 함수 정의
  const [selectedPost, setSelectedPost] = useState(null);

  /* Component가 처음 Rendering 될 때 Local Storage에서 게시물 데이터를 가져와 상태에 저장 */
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

  /* URL 변경 시 업데이트된 게시물 데이터를 상태에 저장 */
  useEffect(() => {
    
    // location.state : URL 변경 시 전달된 state 값
    // { state } : location 객체에서 state 값만 가져옴
    // 둘이 똑같은거임
    const { state } = location;
    
    // state 값이 존재하고 updatedPosts가 존재할 때 게시물 상태 업데이트
    if (state?.updatedPosts) {
      setPosts(state.updatedPosts);
    }
  
    // location이 변경될 때마다 실행
  }, [location]);

  /* ESC를 누를 때 모달 창 닫게 함 */
  useEffect(() => {

    // 키보드 이벤트 핸들러 정의
    // e.key : 눌린 키 값
    const handleKeyDown = (e) => {

      // 눌린 키가 'Escape'일 때 모달 창 닫음
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    // 키보드 이벤트 핸들러 등록
    document.addEventListener('keydown', handleKeyDown);

    // 컴포넌트가 Unmount 될 때 키보드 이벤트 핸들러 해제
    // 컴포넌트가 Unmount 되는건 페이지가 바뀌거나, 컴포넌트가 사라지는 경우
    return () => {
      // 키보드 이벤트 핸들러 해제
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  /* 모달창 열고 선택된 게시물 상태 업데이트 */
  const openModal = (post) => {
    
    // 선택된 게시물 상태 업데이트
    setSelectedPost(post);
  };

  /* 모달창 닫고 선택된 게시물 상태 초기화 */
  const closeModal = () => {

    // 선택된 게시물 상태 초기화
    setSelectedPost(null);
  };

  /* 게시물 삭제 */
  const deletePost = (index) => {

    if (isLoggedIn && currentUser && posts[index].author === currentUser.username) {
      // window.confirm() : 사용자에게 확인 창을 띄워주는 함수
      if (window.confirm('진짜 삭제함 ?')) {
        const updatedPosts = [...posts];

        // splice(index, 1) : index부터 1개의 요소 제거
        updatedPosts.splice(index, 1);
        // 게시물 상태 업데이트
        setPosts(updatedPosts);
        try {
          // local storage에 업데이트된 게시물 데이터 저장
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
        } catch (error) {
          console.error("삭제 실패함 ;;", error);
        }
      }
    } else {
      alert('삭제 권한이 없음 ;;');
    }
  };

  /* 선택된 게시물의 좋아요 수 증가 */
  const toggleLike = (post) => {

    // posts.map() : posts 배열을 순회하며 새로운 배열을 반환
    const updatedPosts = posts.map((p) =>

      // p === post : 선택된 게시물이면 좋아요 수 증가
      p === post ? { ...p, likes: p.likes ? p.likes + 1 : 1 } : p
    );

    // 게시물 상태 업데이트
    setPosts(updatedPosts);
    try {
      
      // local storage에 업데이트된 게시물 데이터 저장
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
    } catch (error) {
      console.error("좋아요 업데이트 실패함 ;;", error);
    }
  };

/* 선택된 게시물의 싫어요 수 증가 */
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


  /* 선택된 게시물에 댓글 추가 */
  const addComment = (comment) => {
    const updatedPost = {
      ...selectedPost,
      
      // 삼항 연산자 : selectedPost.comments가 존재하면 selectedPost.comments 배열에 comment 추가, 아니면 [comment] 배열 생성
      comments: selectedPost.comments ? [...selectedPost.comments, comment] : [comment],
    };

    // 선택된 게시물의 댓글 추가
    const updatedPosts = posts.map((p) => (p === selectedPost ? updatedPost : p));
    setPosts(updatedPosts);
    setSelectedPost(updatedPost);
    try {
      // local storage에 업데이트된 게시물 데이터 저장
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
    } catch (error) {
      console.error("댓글 추가 실패함 ;;", error);
    }
  };

  /* Main Page UI Rendering */
  return (
    <>
      <div className="write-button-container">
        {isLoggedIn && (
        <Link to="/write" className="write-button">
          글쓰기
        </Link>
        )}
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
              {isLoggedIn && currentUser && post.author === currentUser.username && (
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePost(i);
                }}
              >
                삭제
              </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {selectedPost && (
        <div className="modal" onClick={closeModal}>
          <div className='modal-overlay'></div>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <div className="write-preview">
              {selectedPost.image && (
                <img src={selectedPost.image} 
                     alt={selectedPost.title} 
                     className="write-image-preview" 
                />
              )}
              <h4>{selectedPost.title}</h4>
              <p>{selectedPost.content}</p>
              <p>{selectedPost.date} 작성</p>
              <div className="like-dislike-buttons">
                <button
                  className={`like-button ${selectedPost.likes ? 'active' : ''}`}
                  disabled
                >
                  <span role="img" aria-label="likes">❤️</span>
                  {selectedPost.likes || 0}
                </button>
                <button
                  className={`dislike-button ${selectedPost.dislikes ? 'active' : ''}`}
                  disabled
                >
                  <span role="img" aria-label="dislikes">👎</span>
                  {selectedPost.dislikes || 0}
                </button>
              </div>
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

/* 글쓰기 페이지 Component */
function Write({ isLoggedIn, currentUser }) {
  
  // navigate 함수 가져와 페이지 이동 가능하게 함
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인 하셈 ;;");
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // 제목, 내용, 이미지 상태와 함수 정의
  const [titleValue, setTitleValue] = useState('');
  const [contentValue, setContentValue] = useState('');
  const [imageValue, setImageValue] = useState('');


  /* 이미지 파일을 변경할 때 호출 */
  const handleImageChange = (e) => {

    // e.target.files[0] : 파일 선택 시 선택된 파일 정보
    const file = e.target.files[0];
    // FileReader() : 파일을 읽을 수 있는 객체 생성
    const reader = new FileReader();

    // 파일 읽기가 완료되면 이미지 상태 업데이트
    reader.onloadend = () => {
      setImageValue(reader.result);
    };

    // 파일을 읽어 base64 형태로 변환
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  /* 게시물을 저장하고 메인 페이지로 이동 */
  const savePost = (updatedPosts) => {
    try {
      // local storage에 업데이트된 게시물 데이터 저장
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
      
      // 메인 페이지로 이동하며 업데이트된 게시물 데이터 전달
      navigate('/', { state: { updatedPosts } });
    } catch (error) {
      console.error("게시물 저장 실패함 ;;", error);
    }
  };

  /* 새 글을 작성하고 메인 페이지로 이동 */
  const handleSubmit = () => {
    // 현재 시간을 가져와서 게시물 데이터 생성
    const now = new Date();
    const newPost = {
      author: currentUser.username,
      title: titleValue,
      content: contentValue,
      image: imageValue,
      date: now.toLocaleDateString(),
      likes: 0,
      dislikes: 0,
      comments: [],
    };
    
    // try: 예외 발생 시 catch 블록 실행
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const posts = storedData ? JSON.parse(storedData) : [];
      const updatedPosts = [...posts, newPost];
      savePost(updatedPosts);
    } catch (error) {
      console.error("게시물 저장 실패함 ;;", error);
    }
  };

  /* 글쓰기 페이지와 UI Rendering */
  return (
    <div className="write-container">
      <h4>새 글 작성</h4>
      <div className="write-preview">
        <div className="write-image-container">
          <label htmlFor="image-input">
            {imageValue ? (
              <img src={imageValue} alt="Preview" className="write-image-preview" />
            ) : (
              <div className="image-placeholder">
                <span>이미지 첨부할거면 누르셈</span>
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
      <button className="write-submit-button" onClick={handleSubmit}>
        Save
      </button>
    </div>
  );
}

/* 로그인 페이지 Component */
function Login({ handleLogin }) {
  
  // 사용자 이름, 비밀번호 상태와 함수 정의
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const handleLoginSubmit = () => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const users = storedUser ? JSON.parse(storedUser) : [];

    const user = users.find((user) => user.username === username && user.password === password);

    if (user) {
      handleLogin(user);
      alert('로그인 성공 !!');
      navigate('/');
    } else {
      alert('로그인 실패 ;;');
    }
  };

  return (
    <div className="auth-container">
      <h2>로그인</h2>
      <input
        type='text'
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type='password'
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLoginSubmit}>로그인</button>
    </div>
  );
}


/* 회원가입 페이지 Component */
function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = () => {
    const newUser = { username, password };
    
    let users = [];
    const storedUsers = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUsers !== null) {
      users = JSON.parse(storedUsers);
      if (!Array.isArray(users)) {
        users = [];
      }
    }

    users.push(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));

    alert('회원가입 성공 !!');
    navigate('/login', { state: { signupSuccess: true } });
};

  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      <input
        type='text'
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type='password'
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignup}>회원가입</button>
    </div>
  );
}

export default App; 