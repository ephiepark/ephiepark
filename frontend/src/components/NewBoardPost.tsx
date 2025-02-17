import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FirebaseApi from '../firebase/FirebaseApi';
import './NewBoardPost.css';

const NewBoardPost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const api = FirebaseApi.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createBoardPost(title.trim(), content.trim());
      navigate('/board');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-board-post-container">
      <h1>New Board Post</h1>
      <form onSubmit={handleSubmit} className="new-board-post-form">
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
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBoardPost;
