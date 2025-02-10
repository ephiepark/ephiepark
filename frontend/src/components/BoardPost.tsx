import React, { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import FirebaseApi from '../firebase/FirebaseApi';
import { useFirebase } from '../firebase/FirebaseContext';
import { BoardPost as BoardPostType, Comment } from '../types/board';
import { UserData } from '../types/user';
import './Board.css';

const BoardPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<BoardPostType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const { user } = useFirebase();
  const api = FirebaseApi.getInstance();

  useEffect(() => {
    const loadData = async () => {
      if (postId) {
        const [fetchedPost, fetchedComments] = await Promise.all([
          api.getBoardPost(postId),
          api.getComments(postId)
        ]);
        setPost(fetchedPost);
        setComments(fetchedComments);
      }
    };

    loadData();
  }, [postId]);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const data = await api.getUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
    };

    loadUserData();
  }, [user]);

  const handleHidePost = async (currentlyHidden: boolean) => {
    if (!post) return;
    
    try {
      await api.hideBoardPost(post.id, !currentlyHidden);
      setPost({ ...post, isHidden: !currentlyHidden });
    } catch (error) {
      console.error('Error hiding post:', error);
      alert('Failed to hide post. Only admins can perform this action.');
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;

    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await api.deleteBoardPost(post.id);
      window.location.href = '/board';
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Only admins can perform this action.');
    }
  };

  const canEditPost = (post: BoardPostType) => {
    return user && (user.uid === post.authorId || userData?.isAdmin);
  };

  const canEditComment = (comment: Comment) => {
    return user && (user.uid === comment.authorId || userData?.isAdmin);
  };

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!postId || !newComment.trim()) return;

    try {
      const commentId = await api.createComment(postId, newComment.trim());
      const comment: Comment = {
        id: commentId,
        postId,
        content: newComment.trim(),
        createdAt: Date.now(),
        authorId: user!.uid,
        authorName: user!.displayName || 'Anonymous'
      };
      setComments([comment, ...comments]);
      setPost(post => post ? { ...post, commentCount: (post.commentCount || 0) + 1 } : null);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to create comment. Please try again.');
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    if (!postId) return;

    try {
      await api.updateComment(postId, commentId, content);
      setComments(comments.map(comment =>
        comment.id === commentId
          ? { ...comment, content }
          : comment
      ));
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!postId || !window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.deleteComment(postId, commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
      setPost(post => post ? { ...post, commentCount: Math.max(0, (post.commentCount || 1) - 1) } : null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="board-container">
      <div className="board-post">
        <div className="board-post-header">
          <h2 className="board-post-title">{post.title}</h2>
          {canEditPost(post) && (
            <div className="board-post-actions">
              <Link to={`/board/${post.id}/edit`}>
                <button className="edit-button">Edit</button>
              </Link>
              {userData?.isAdmin && (
                <>
                  <button 
                    className="hide-button"
                    onClick={() => handleHidePost(post.isHidden)}
                  >
                    {post.isHidden ? 'Unhide' : 'Hide'}
                  </button>
                  <button 
                    className="delete-button"
                    onClick={handleDeletePost}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="board-post-meta">
          Posted by {post.authorName} on {formatDate(post.createdAt)}
          {post.isHidden && <span> (Hidden)</span>}
        </div>
        <div className="board-post-content">{post.content}</div>
      </div>

      <div className="board-comments">
        <h3>Comments</h3>
        
        {user ? (
          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              required
            />
            <button type="submit" disabled={!newComment.trim()}>
              Post Comment
            </button>
          </form>
        ) : (
          <p>Please sign in to comment.</p>
        )}

        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.authorName}</span>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
                {canEditComment(comment) && (
                  <div className="comment-actions">
                    <button
                      onClick={() => {
                        const newContent = prompt('Edit your comment:', comment.content);
                        if (newContent && newContent !== comment.content) {
                          handleUpdateComment(comment.id, newContent);
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDeleteComment(comment.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="no-comments">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardPost;
