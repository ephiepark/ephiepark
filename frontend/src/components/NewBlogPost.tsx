import React from 'react';
import BlogEditor from './BlogEditor';

const NewBlogPost: React.FC = () => {
  return (
    <BlogEditor
      mode="create"
    />
  );
};

export default NewBlogPost;
