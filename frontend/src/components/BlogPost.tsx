import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFirebase } from '../firebase/FirebaseContext';
import { BlogPost as BlogPostType } from 'shared/types';

const BlogPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { api, user } = useFirebase();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        const fetchedPost = await api.getBlogPost(postId);
        setPost(fetchedPost);
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, api]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="blog-post">
      <div className="blog-post-header">
        <h1>{post.title}</h1>
        <div className="post-metadata">
          <span className="post-date">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          {user && (
            <Link to={`/blog/${post.id}/edit`} className="edit-post-link">
              Edit Post
            </Link>
          )}
        </div>
      </div>
      <div className="blog-post-content">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div className="blog-post-footer">
        <Link to="/blog" className="back-to-blog">
          Back to Blog
        </Link>
      </div>
    </div>
  );
};

export default BlogPost;
