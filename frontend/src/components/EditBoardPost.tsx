import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FirebaseApi from '../firebase/FirebaseApi';
import { useFirebase } from '../firebase/FirebaseContext';
import { BoardPost } from '../types/board';
import './BlogEditor.css'; // Reusing blog editor styles

const EditBoardPost: React.FC = () => {
  const [post, setPost] = useState<BoardPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const api = FirebaseApi.getInstance();
  const { user } = useFirebase();

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) {
        navigate('/board');
        return;
      }

      try {
        const fetchedPost = await api.getBoardPost(postId);
        if (!fetchedPost) {
          alert('Post not found');
          navigate('/board');
          return;
        }

        // Check if user can edit this post
        const userData = await api.getUserData(user?.uid || '');
        if (!user || (user.uid !== fetchedPost.authorId && !userData?.isAdmin)) {
          alert('You do not have permission to edit this post');
          navigate('/board');
          return;
        }

        setPost(fetchedPost);
        setTitle(fetchedPost.title);
        setContent(fetchedPost.content);
      } catch (error) {
        console.error('Error loading post:', error);
        alert('Failed to load post');
        navigate('/board');
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.updateBoardPost(postId!, title.trim(), content.trim());
      navigate('/board');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="editor-container">Loading...</div>;
  }

  if (!post) {
    return null;
  }

  return (
    <div className="editor-container">
      <h1>Edit Board Post</h1>
      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter post content"
            required
            rows={10}
          />
        </div>
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/board')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBoardPost;
