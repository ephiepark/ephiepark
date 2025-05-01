import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FirebaseApi from '../firebase/FirebaseApi';
import { useFirebase } from '../firebase/FirebaseContext';
import { BoardPost, UserData } from '../shared/types';
import './Board.css';

const Board: React.FC = () => {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const { user } = useFirebase();
  const api = FirebaseApi.getInstance();

  useEffect(() => {
    const loadPosts = async () => {
      const fetchedPosts = await api.getBoardPosts();
      setPosts(fetchedPosts);
    };

    loadPosts();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const data = await api.getUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
    };

    loadUserData();
  }, [user]);

  const handleHidePost = async (postId: string, currentlyHidden: boolean) => {
    try {
      await api.hideBoardPost(postId, !currentlyHidden);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, isHidden: !currentlyHidden }
          : post
      ));
    } catch (error) {
      console.error('Error hiding post:', error);
      alert('Failed to hide post. Only admins can perform this action.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await api.deleteBoardPost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Only admins can perform this action.');
    }
  };

  const canEditPost = (post: BoardPost) => {
    return user && (user.uid === post.authorId || userData?.isAdmin);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <h1>Board</h1>
        {user && (
          <Link to="/board/new" className="new-post-button">
            New Post
          </Link>
        )}
      </div>

      {posts.map(post => (
        <div key={post.id} className={`board-post ${post.isHidden ? 'hidden' : ''}`}>
          <Link to={`/board/${post.id}`} className="board-post-title-link">
            <h2 className="board-post-title">{post.title}</h2>
          </Link>
          <div className="board-post-meta">
            Posted by {post.authorName} • {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
            {post.isHidden && <span> (Hidden)</span>}
          </div>
        </div>
      ))}

      {posts.length === 0 && (
        <p>No posts yet. {user ? 'Create the first one!' : 'Sign in to create a post!'}</p>
      )}
    </div>
  );
};

export default Board;
