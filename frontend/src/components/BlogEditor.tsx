import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../firebase/FirebaseContext';
import './BlogEditor.css';

interface BlogEditorProps {
  initialTitle?: string;
  initialContent?: string;
  postId?: string;
  mode: 'create' | 'edit';
}

const BlogEditor: React.FC<BlogEditorProps> = ({
  initialTitle = '',
  initialContent = '',
  postId,
  mode
}) => {
  const navigate = useNavigate();
  const { api, user } = useFirebase();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate('/blog');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setSaving(true);
    try {
      if (mode === 'edit' && postId) {
        await api.updateBlogPost(postId, title, content);
        navigate(`/blog/${postId}`);
      } else {
        const newPostId = await api.createBlogPost(title, content);
        navigate(`/blog/${newPostId}`);
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="blog-editor">
      <div className="editor-header">
        <h1>{mode === 'create' ? 'New Blog Post' : 'Edit Blog Post'}</h1>
      </div>
      <div className="editor-content">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post Title"
          className="title-input"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content here..."
          className="content-input"
          required
        />
      </div>
      <div className="editor-footer">
        <button
          type="button"
          onClick={() => navigate('/blog')}
          className="cancel-button"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !title || !content}
          className="save-button"
        >
          {saving ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </form>
  );
};

export default BlogEditor;
