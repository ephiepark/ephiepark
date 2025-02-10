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
import { ProjectsProvider } from './projects/ProjectsContext';
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
      <ProjectsProvider>
        <Router>
          <div className="App">
            <Navigation />

            <main className="main-content">
              <Routes>
                <Route path="/" element={
                  <div className="home-container">
                    <h1>Welcome to My Website</h1>
                    <p>Hi, I'm Ephraim Park. Welcome to my personal website!</p>
                  </div>
                } />
                <Route path="/blog" element={<Blog />} />
                <Route 
                  path="/blog/new" 
                  element={
                    <RequireAuth>
                      <NewBlogPost />
                    </RequireAuth>
                  } 
                />
                <Route path="/blog/:postId" element={<BlogPost />} />
                <Route 
                  path="/blog/:postId/edit" 
                  element={
                    <RequireAuth>
                      <EditBlogPost />
                    </RequireAuth>
                  } 
                />
                <Route path="/board" element={<Board />} />
                <Route path="/board/:postId" element={<BoardPost />} />
                <Route 
                  path="/board/new" 
                  element={
                    <RequireAuth>
                      <NewBoardPost />
                    </RequireAuth>
                  } 
                />
                <Route 
                  path="/board/:postId/edit" 
                  element={
                    <RequireAuth>
                      <EditBoardPost />
                    </RequireAuth>
                  } 
                />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId" element={<ProjectPage />} />
                <Route 
                  path="/profile" 
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      </ProjectsProvider>
    </FirebaseProvider>
  );
}

export default App;
