import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import NewBlogPost from './components/NewBlogPost';
import EditBlogPost from './components/EditBlogPost';
import Projects from './components/Projects';
import Profile from './components/Profile';
import { FirebaseProvider, useFirebase } from './firebase/FirebaseContext';
import LoginButton from './components/LoginButton';
import RequireAuth from './components/RequireAuth';
import './App.css';

const Navigation = () => {
  const { user } = useFirebase();
  
  return (
    <nav className="nav-tabs">
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/blog" className="nav-link">Blog</Link>
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
              <Route path="/projects" element={<Projects />} />
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
    </FirebaseProvider>
  );
}

export default App;
