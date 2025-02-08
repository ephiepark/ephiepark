import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useFirebase } from '../firebase/FirebaseContext';
import { BlogPost as BlogPostType } from '../types/blog';
import './Blog.css';

const BlogPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const firebase = useFirebase();
  const [post, setPost] = useState<BlogPostType | null>(null);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return null;
  }

  return (
    <div className="blog-post">
      <div className="post-header">
        <h1>{post.title}</h1>
        <Link to={`/blog/${post.id}/edit`} className="edit-post-button">
          Edit Post
        </Link>
      </div>
      <div className="post-date">
        {new Date(post.createdAt).toLocaleDateString()}
      </div>
      <div className="post-content">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default BlogPost;
