// Test file to verify that shared types can be imported
import { ProjectConfig, BlogPost, BoardPost, UserData } from './types.js';

// Example usage of shared types
const testProject: Omit<ProjectConfig, 'component'> = {
  id: 'test-project',
  name: 'Test Project',
  description: 'A test project to verify shared types',
  status: 'development',
  permission: 'all'
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

const testUser: UserData = {
  uid: 'test-user',
  username: 'Test User',
  isAdmin: false
};

console.log('Shared types imported successfully!');
console.log('Test Project:', testProject);
console.log('Test Blog Post:', testBlogPost);
console.log('Test Board Post:', testBoardPost);
console.log('Test User:', testUser);
