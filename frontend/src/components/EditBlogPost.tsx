import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BlogEditor from './BlogEditor';
import { useFirebase } from '../firebase/FirebaseContext';
import { BlogPost } from '../types/blog';
import './BlogEditor.css';

const EditBlogPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const firebase = useFirebase();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        navigate('/blog');
        return;
      }

      try {
        const fetchedPost = await firebase.getBlogPost(postId);
        if (!fetchedPost) {
          navigate('/blog');
          return;
        }
        setPost(fetchedPost);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, firebase, navigate]);

  const handleCancel = () => {
    navigate(`/blog/${postId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return null;
  }

  return <BlogEditor post={post} onCancel={handleCancel} />;
};

export default EditBlogPost;
