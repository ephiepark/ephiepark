import { collection, getDocs, getDoc, doc, addDoc, query, orderBy, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, signOut as firebaseSignOut, User, onAuthStateChanged } from 'firebase/auth';
import { db, auth, googleProvider } from './config';
import { BlogPost } from '../types/blog';
import { BoardPost } from '../types/board';
import { UserData } from '../types/user';

class FirebaseApi {
  private static instance: FirebaseApi;
  private readonly BLOG_POSTS_COLLECTION = 'blog_posts';
  private readonly BOARD_POSTS_COLLECTION = 'board_posts';
  private readonly USERS_COLLECTION = 'users';
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  private constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.authStateListeners.forEach(listener => listener(user));
    });
  }

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

  // Auth methods
  async signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    await this.createUserDataIfNotExists(result.user);
    return result.user;
  }

  private async createUserDataIfNotExists(user: User): Promise<void> {
    try {
      const userDoc = doc(db, this.USERS_COLLECTION, user.uid);
      const userSnap = await getDoc(userDoc);
      
      if (!userSnap.exists()) {
        const userData: UserData = {
          uid: user.uid,
          username: user.displayName || 'Anonymous',
          isAdmin: false
        };
        
        // Use doc() with setDoc() instead of addDoc() to ensure we use the user's UID as the document ID
        // This is allowed by our security rules since we're checking request.auth.uid == userId
        await setDoc(userDoc, userData);
      }
    } catch (error) {
      console.error('Error creating user data:', error);
      throw new Error('Failed to create user profile');
    }
  }

  async getUserData(uid: string): Promise<UserData | null> {
    const userDoc = doc(db, this.USERS_COLLECTION, uid);
    const userSnap = await getDoc(userDoc);
    
    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as UserData;
  }

  async updateUsername(uid: string, username: string): Promise<void> {
    const userDoc = doc(db, this.USERS_COLLECTION, uid);
    await updateDoc(userDoc, { username });
  }

  // Board methods
  async getBoardPosts(): Promise<BoardPost[]> {
    const postsQuery = query(
      collection(db, this.BOARD_POSTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BoardPost));
  }

  async getBoardPost(id: string): Promise<BoardPost | null> {
    const docRef = doc(db, this.BOARD_POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as BoardPost;
  }

  async createBoardPost(title: string, content: string): Promise<string> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Must be logged in to create a post');

    const docRef = await addDoc(collection(db, this.BOARD_POSTS_COLLECTION), {
      title,
      content,
      createdAt: Date.now(),
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      isHidden: false
    });
    return docRef.id;
  }

  async updateBoardPost(id: string, title: string, content: string): Promise<void> {
    const docRef = doc(db, this.BOARD_POSTS_COLLECTION, id);
    await updateDoc(docRef, {
      title,
      content
    });
  }

  async hideBoardPost(id: string, hidden: boolean): Promise<void> {
    const userData = await this.getUserData(this.getCurrentUser()?.uid || '');
    if (!userData?.isAdmin) throw new Error('Only admins can hide posts');

    const docRef = doc(db, this.BOARD_POSTS_COLLECTION, id);
    await updateDoc(docRef, {
      isHidden: hidden
    });
  }

  async deleteBoardPost(id: string): Promise<void> {
    const userData = await this.getUserData(this.getCurrentUser()?.uid || '');
    if (!userData?.isAdmin) throw new Error('Only admins can delete posts');

    const docRef = doc(db, this.BOARD_POSTS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChanged(listener: (user: User | null) => void): () => void {
    this.authStateListeners.push(listener);
    // Return cleanup function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    };
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export default FirebaseApi;
