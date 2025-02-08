import React from 'react';
import { useNavigate } from 'react-router-dom';
import BlogEditor from './BlogEditor';
import './BlogEditor.css';

const NewBlogPost: React.FC = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/blog');
  };

  return <BlogEditor onCancel={handleCancel} />;
};

export default NewBlogPost;
