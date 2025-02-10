import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import FirebaseApi from '../firebase/FirebaseApi';
import { useFirebase } from '../firebase/FirebaseContext';
import { BoardPost as BoardPostType } from '../types/board';
import { UserData } from '../types/user';
import './Board.css';

const BoardPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<BoardPostType | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const { user } = useFirebase();
  const api = FirebaseApi.getInstance();

  useEffect(() => {
    const loadPost = async () => {
      if (postId) {
        const fetchedPost = await api.getBoardPost(postId);
        setPost(fetchedPost);
      }
    };

    loadPost();
  }, [postId]);

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

  const handleHidePost = async (currentlyHidden: boolean) => {
    if (!post) return;
    
    try {
      await api.hideBoardPost(post.id, !currentlyHidden);
      setPost({ ...post, isHidden: !currentlyHidden });
    } catch (error) {
      console.error('Error hiding post:', error);
      alert('Failed to hide post. Only admins can perform this action.');
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;

    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await api.deleteBoardPost(post.id);
      window.location.href = '/board';
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Only admins can perform this action.');
    }
  };

  const canEditPost = (post: BoardPostType) => {
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

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="board-container">
      <div className="board-post">
        <div className="board-post-header">
          <h2 className="board-post-title">{post.title}</h2>
          {canEditPost(post) && (
            <div className="board-post-actions">
              <Link to={`/board/${post.id}/edit`}>
                <button className="edit-button">Edit</button>
              </Link>
              {userData?.isAdmin && (
                <>
                  <button 
                    className="hide-button"
                    onClick={() => handleHidePost(post.isHidden)}
                  >
                    {post.isHidden ? 'Unhide' : 'Hide'}
                  </button>
                  <button 
                    className="delete-button"
                    onClick={handleDeletePost}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="board-post-meta">
          Posted by {post.authorName} on {formatDate(post.createdAt)}
          {post.isHidden && <span> (Hidden)</span>}
        </div>
        <div className="board-post-content">{post.content}</div>
      </div>
    </div>
  );
};

export default BoardPost;
