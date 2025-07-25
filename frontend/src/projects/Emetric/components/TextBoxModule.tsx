import React, { useState } from 'react';
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
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onContentChange(id, e.target.value);
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
        </div>
      </div>
      <textarea
        className="text-box-content"
        value={content}
        onChange={handleChange}
        placeholder="Enter your notes here..."
      />
    </div>
  );
};

export default TextBoxModule;
