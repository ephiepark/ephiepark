import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import Projects from './components/Projects';
import { FirebaseProvider } from './firebase/FirebaseContext';
import './App.css';

function App() {
  return (
    <FirebaseProvider>
      <Router>
        <div className="App">
          <nav className="nav-tabs">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/blog" className="nav-link">Blog</Link>
            <Link to="/projects" className="nav-link">Projects</Link>
          </nav>

          <main className="main-content">
            <Routes>
              <Route path="/" element={
                <div className="home-container">
                  <h1>Welcome to My Website</h1>
                  <p>Hi, I'm Ephraim Park. Welcome to my personal website!</p>
                </div>
              } />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:postId" element={<BlogPost />} />
              <Route path="/projects" element={<Projects />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FirebaseProvider>
  );
}

export default App;
