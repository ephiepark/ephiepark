import React, { createContext, useContext } from 'react';
import FirebaseApi from './FirebaseApi';

const FirebaseContext = createContext<FirebaseApi | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FirebaseContext.Provider value={FirebaseApi.getInstance()}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseApi => {
  const firebase = useContext(FirebaseContext);
  if (!firebase) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return firebase;
};
