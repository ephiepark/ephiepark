import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import Board from './components/Board';
import BoardPost from './components/BoardPost';
import NewBoardPost from './components/NewBoardPost';
import EditBoardPost from './components/EditBoardPost';
import NewBlogPost from './components/NewBlogPost';
import EditBlogPost from './components/EditBlogPost';
import Projects from './components/Projects';
import Profile from './components/Profile';
import { FirebaseProvider, useFirebase } from './firebase/FirebaseContext';
import LoginButton from './components/LoginButton';
import RequireAuth from './components/RequireAuth';
import ProjectPage from './components/ProjectPage';
import './App.css';

const Navigation = () => {
  const { user } = useFirebase();

  return (
    <nav className="nav-tabs">
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/blog" className="nav-link">Blog</Link>
        <Link to="/board" className="nav-link">Board</Link>
        <Link to="/projects" className="nav-link">Projects</Link>
      </div>
      <div className="auth-section">
        {user && <Link to="/profile" className="nav-link">Profile</Link>}
        <LoginButton />
      </div>
    </nav>
  );
};

function App() {
  return (
    <FirebaseProvider>
      <Router>
        <div className="App">
          <Navigation />

          <main>
            <Routes>
              <Route path="/" element={
                <div className="main-content">
                  <div className="home-container">
                    <h1>Welcome to My Website</h1>
                    <p>Hi, I'm Ephraim Park. Welcome to my personal website!</p>
                  </div>
                </div>
              } />
              <Route path="/blog" element={
                <div className="main-content">
                  <Blog />
                </div>
              } />
              <Route
                path="/blog/new"
                element={
                  <div className="main-content">
                    <RequireAuth>
                      <NewBlogPost />
                    </RequireAuth>
                  </div>
                }
              />
              <Route path="/blog/:postId" element={
                <div className="main-content">
                  <BlogPost />
                </div>
              } />
              <Route
                path="/blog/:postId/edit"
                element={
                  <div className="main-content">
                    <RequireAuth>
                      <EditBlogPost />
                    </RequireAuth>
                  </div>
                }
              />
              <Route path="/board" element={
                <div className="main-content">
                  <Board />
                </div>
              } />
              <Route path="/board/:postId" element={
                <div className="main-content">
                  <BoardPost />
                </div>
              } />
              <Route
                path="/board/new"
                element={
                  <div className="main-content">
                    <RequireAuth>
                      <NewBoardPost />
                    </RequireAuth>
                  </div>
                }
              />
              <Route
                path="/board/:postId/edit"
                element={
                  <div className="main-content">
                    <RequireAuth>
                      <EditBoardPost />
                    </RequireAuth>
                  </div>
                }
              />
              <Route path="/projects" element={
                <div className="main-content">
                  <Projects />
                </div>
              } />
              <Route path="/projects/:projectId" element={
                <div className="main-content-wide">
                  <ProjectPage />
                </div>
              } />
              <Route path="/projects/:projectId/:tab" element={
                <div className="main-content-wide">
                  <ProjectPage />
                </div>
              } />
              <Route
                path="/profile"
                element={
                  <div className="main-content">
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </FirebaseProvider>
  );
}

export default App;
