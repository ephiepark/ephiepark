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
