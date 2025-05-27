
import React, { useState } from 'react';

interface UserInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean; // True if Lily is typing (for Lily's chat)
  isResponsive: boolean; // True if the current chat target can respond
  currentContactName: string; // Name of the current chat target
}

const UserInput: React.FC<UserInputProps> = ({ onSendMessage, isLoading, isResponsive, currentContactName }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && (!isLoading || !isResponsive )) { // Allow sending if not Lily typing OR if current chat is not responsive anyway
      onSendMessage(text.trim());
      setText('');
    }
  };

  let placeholderText = `Type your message to ${currentContactName}...`;
  if (currentContactName === "Lily" && isLoading) {
    placeholderText = "Lily is responding...";
  } else if (!isResponsive) {
    placeholderText = `Messages to ${currentContactName} are not monitored.`;
  }


  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholderText}
          className="flex-grow p-3 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none placeholder-gray-400"
          disabled={isLoading && currentContactName === "Lily"} // Only disable if Lily is typing FOR Lily's chat
        />
        <button
          type="submit"
          disabled={(isLoading && currentContactName === "Lily") || !text.trim()}
          className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default UserInput;
