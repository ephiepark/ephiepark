import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './TextBoxModule.css';

interface TextBoxModuleProps {
  id: string;
  initialContent: string;
  onContentChange: (id: string, content: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

const TextBoxModule: React.FC<TextBoxModuleProps> = ({
  id,
  initialContent,
  onContentChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  isFirst,
  isLast
}) => {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onContentChange(id, e.target.value);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  return (
    <div className="module text-box-module">
      <div className="module-header">
        <div className="module-controls">
          <button 
            className="move-up-button" 
            onClick={() => onMoveUp(id)}
            disabled={isFirst}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14l5-5 5 5z"/>
            </svg>
            Move Up
          </button>
          <button 
            className="move-down-button" 
            onClick={() => onMoveDown(id)}
            disabled={isLast}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
            Move Down
          </button>
          <button 
            className="remove-button" 
            onClick={() => onRemove(id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            Remove
          </button>
          <button 
            className="edit-toggle-button" 
            onClick={toggleEditMode}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d={isEditing 
                ? "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                : "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"}
              />
            </svg>
            {isEditing ? 'View' : 'Edit'}
          </button>
        </div>
      </div>
      {isEditing ? (
        <textarea
          className="text-box-content"
          value={content}
          onChange={handleChange}
          placeholder="Enter your notes here... (Markdown supported)"
        />
      ) : (
        <div className="markdown-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default TextBoxModule;
