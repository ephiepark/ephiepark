import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useFirebase } from '../firebase/FirebaseContext';
import { BlogPost } from '../types/blog';

interface BlogEditorProps {
  post?: BlogPost; // If provided, we're editing an existing post
  onCancel: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ post, onCancel }) => {
  const navigate = useNavigate();
  const firebase = useFirebase();
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (post) {
        // Editing existing post
        await firebase.updateBlogPost(post.id, title, content);
        navigate(`/blog/${post.id}`);
      } else {
        // Creating new post
        const newPostId = await firebase.createBlogPost(title, content);
        navigate(`/blog/${newPostId}`);
      }
    } catch (err) {
      setError('Failed to save post. Please try again.');
      console.error('Error saving post:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="blog-editor">
      <div className="editor-header">
        <h1>{post ? 'Edit Post' : 'New Post'}</h1>
        <div className="editor-actions">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="preview-toggle"
          >
            {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={onCancel}
            className="cancel-button"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="save-button"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isPreview ? (
        <div className="preview-mode">
          <h1>{title}</h1>
          <div className="post-content">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="edit-mode">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="title-input"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post in markdown..."
            className="content-input"
          />
          <div className="markdown-guide">
            <h4>Markdown Guide:</h4>
            <p>
              # Header 1<br />
              ## Header 2<br />
              **bold**, *italic*<br />
              [Link](url)<br />
              - List item<br />
              ```code block```
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;
