export interface BoardPost {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  authorId: string;
  authorName: string;
  isHidden: boolean;
}
