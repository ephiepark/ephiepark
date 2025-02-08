import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../firebase/FirebaseContext';
import BlogEditor from './BlogEditor';
import { BlogPost } from '../types/blog';

const EditBlogPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { api, user } = useFirebase();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        const fetchedPost = await api.getBlogPost(postId);
        setPost(fetchedPost);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, api, navigate]);

  if (!user) {
    navigate('/blog');
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <BlogEditor
      mode="edit"
      initialTitle={post.title}
      initialContent={post.content}
      postId={post.id}
    />
  );
};

export default EditBlogPost;
