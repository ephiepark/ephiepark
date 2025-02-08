import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import FirebaseApi from './FirebaseApi';

interface FirebaseContextType {
  api: FirebaseApi;
  user: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const api = FirebaseApi.getInstance();

  useEffect(() => {
    const unsubscribe = api.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [api]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <FirebaseContext.Provider value={{ api, user, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const firebase = useContext(FirebaseContext);
  if (!firebase) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return {
    api: firebase.api,
    user: firebase.user,
    loading: firebase.loading,
    isAuthenticated: () => firebase.user !== null,
  };
};
