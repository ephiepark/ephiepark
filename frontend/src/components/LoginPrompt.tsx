import React from 'react';
import LoginButton from './LoginButton';
import './LoginPrompt.css';

interface LoginPromptProps {
  title?: string;
  message?: string;
  className?: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ 
  title = 'Login Required', 
  message = 'Please log in to access this content.', 
  className = '' 
}) => {
  return (
    <div className={`login-prompt-container ${className}`}>
      <div className="login-prompt-content">
        {title && <h2>{title}</h2>}
        <p>{message}</p>
        <div className="login-button-container">
          <LoginButton />
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
