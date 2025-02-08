import { collection, getDocs, getDoc, doc, addDoc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { BlogPost } from '../types/blog';

class FirebaseApi {
  private static instance: FirebaseApi;
  private readonly BLOG_POSTS_COLLECTION = 'blog_posts';

  private constructor() {}

  static getInstance(): FirebaseApi {
    if (!FirebaseApi.instance) {
      FirebaseApi.instance = new FirebaseApi();
    }
    return FirebaseApi.instance;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    const postsQuery = query(
      collection(db, this.BLOG_POSTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BlogPost));
  }

  async getBlogPost(id: string): Promise<BlogPost | null> {
    const docRef = doc(db, this.BLOG_POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as BlogPost;
  }

  async importBlogPosts(posts: BlogPost[]): Promise<void> {
    const batch = posts.map(post => 
      addDoc(collection(db, this.BLOG_POSTS_COLLECTION), {
        title: post.title,
        content: post.content,
        createdAt: post.createdAt
      })
    );
    await Promise.all(batch);
  }

  async createBlogPost(title: string, content: string): Promise<string> {
    const docRef = await addDoc(collection(db, this.BLOG_POSTS_COLLECTION), {
      title,
      content,
      createdAt: Date.now()
    });
    return docRef.id;
  }

  async updateBlogPost(id: string, title: string, content: string): Promise<void> {
    const docRef = doc(db, this.BLOG_POSTS_COLLECTION, id);
    await updateDoc(docRef, {
      title,
      content,
      // Not updating createdAt as it should remain the original creation time
    });
  }
}

export default FirebaseApi;
