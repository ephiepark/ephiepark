import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../firebase/FirebaseContext';
import { BlogPost } from '../types/blog';

const Blog: React.FC = () => {
  const firebase = useFirebase();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await firebase.getBlogPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [firebase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="blog-container">
      <h1>Blog</h1>
      <div className="blog-posts">
        {posts.map(post => (
          <article key={post.id} className="blog-post-preview">
            <Link to={`/blog/${post.id}`} className="post-title">
              <h2>{post.title}</h2>
            </Link>
            <div className="post-date">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;
