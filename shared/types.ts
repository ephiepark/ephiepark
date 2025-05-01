// Shared type definitions for both frontend and functions

// Project types
export interface ProjectConfig {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'development';
  permission: 'all' | 'logged-in-user-only' | 'admin-only';
  // Note: component is frontend-specific and will be handled separately
}

// Blog types
export interface BlogPost {
  id: string;
  title: string;
  createdAt: number;
  content: string;
}

// Board types
export interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: number;
  authorId: string;
  authorName: string;
}

export interface BoardPost {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  authorId: string;
  authorName: string;
  isHidden: boolean;
  commentCount: number;
}

// User types
export interface UserData {
  uid: string;
  username: string;
  isAdmin: boolean;
}
