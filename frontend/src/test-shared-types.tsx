import React from 'react';
import { ProjectConfig } from './types/project';
import { BlogPost } from './types/blog';
import { BoardPost, Comment } from './types/board';
import { UserData } from './types/user';

// This is just a test component to verify that shared types can be imported
const TestSharedTypes: React.FC = () => {
  // Example usage of shared types
  const testProject: ProjectConfig = {
    id: 'test-project',
    name: 'Test Project',
    description: 'A test project to verify shared types',
    status: 'development',
    permission: 'all',
    component: <div>Test Project Component</div>
  };

  const testBlogPost: BlogPost = {
    id: 'test-blog-post',
    title: 'Test Blog Post',
    createdAt: Date.now(),
    content: 'This is a test blog post'
  };

  const testBoardPost: BoardPost = {
    id: 'test-board-post',
    title: 'Test Board Post',
    content: 'This is a test board post',
    createdAt: Date.now(),
    authorId: 'test-author',
    authorName: 'Test Author',
    isHidden: false,
    commentCount: 0
  };

  const testComment: Comment = {
    id: 'test-comment',
    postId: 'test-board-post',
    content: 'This is a test comment',
    createdAt: Date.now(),
    authorId: 'test-author',
    authorName: 'Test Author'
  };

  const testUser: UserData = {
    uid: 'test-user',
    username: 'Test User',
    isAdmin: false
  };

  return (
    <div>
      <h1>Test Shared Types</h1>
      <div>
        <h2>Test Project</h2>
        <p>ID: {testProject.id}</p>
        <p>Name: {testProject.name}</p>
        <p>Description: {testProject.description}</p>
        <p>Status: {testProject.status}</p>
        <p>Permission: {testProject.permission}</p>
        <div>Component: {testProject.component}</div>
      </div>
      <div>
        <h2>Test Blog Post</h2>
        <p>ID: {testBlogPost.id}</p>
        <p>Title: {testBlogPost.title}</p>
        <p>Created At: {new Date(testBlogPost.createdAt).toLocaleString()}</p>
        <p>Content: {testBlogPost.content}</p>
      </div>
      <div>
        <h2>Test Board Post</h2>
        <p>ID: {testBoardPost.id}</p>
        <p>Title: {testBoardPost.title}</p>
        <p>Content: {testBoardPost.content}</p>
        <p>Created At: {new Date(testBoardPost.createdAt).toLocaleString()}</p>
        <p>Author ID: {testBoardPost.authorId}</p>
        <p>Author Name: {testBoardPost.authorName}</p>
        <p>Is Hidden: {testBoardPost.isHidden ? 'Yes' : 'No'}</p>
        <p>Comment Count: {testBoardPost.commentCount}</p>
      </div>
      <div>
        <h2>Test Comment</h2>
        <p>ID: {testComment.id}</p>
        <p>Post ID: {testComment.postId}</p>
        <p>Content: {testComment.content}</p>
        <p>Created At: {new Date(testComment.createdAt).toLocaleString()}</p>
        <p>Author ID: {testComment.authorId}</p>
        <p>Author Name: {testComment.authorName}</p>
      </div>
      <div>
        <h2>Test User</h2>
        <p>UID: {testUser.uid}</p>
        <p>Username: {testUser.username}</p>
        <p>Is Admin: {testUser.isAdmin ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default TestSharedTypes;
