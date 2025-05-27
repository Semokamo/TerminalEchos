
import React, { useEffect, useRef } from 'react';
import { Message, ChatTargetId, ChatContact } from '../types';
import MessageList from './MessageList';
import UserInput from './UserInput';
import LoadingSpinner from './LoadingSpinner'; 

interface EscapeRoomChatProps {
  messages: Message[];
  isLilyTyping: boolean; // Specifically for Lily
  chatError: string | null;
  onSendMessage: (userInput: string) => Promise<void>;
  isApiKeyAvailable: boolean; 
  chatContacts: ChatContact[];
  activeChatTargetId: ChatTargetId;
  onSwitchChatTarget: (targetId: ChatTargetId) => void;
  isCurrentChatResponsive: boolean;
}

const EscapeRoomChat: React.FC<EscapeRoomChatProps> = ({
  messages,
  isLilyTyping,
  chatError,
  onSendMessage,
  isApiKeyAvailable,
  chatContacts,
  activeChatTargetId,
  onSwitchChatTarget,
  isCurrentChatResponsive,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const getContactDisplayName = (targetId: ChatTargetId): string => {
    const contact = chatContacts.find(c => c.id === targetId);
    return contact ? contact.name : "Unknown Contact";
  };

  return (
    <div className="flex h-full w-full bg-gray-900 text-gray-100">
      {/* Chat List Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
        <h2 
          className="text-xl font-semibold text-teal-400 mb-6" 
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          Conversations
        </h2>
        <ul className="space-y-2 flex-grow overflow-y-auto custom-scrollbar">
          {chatContacts.map((contact) => (
            <li 
              key={contact.id}
              className={`p-3 rounded-lg cursor-pointer shadow-md hover:bg-teal-700/80 transition-colors duration-150
                          ${activeChatTargetId === contact.id ? 'bg-teal-700/60 ring-2 ring-teal-500' : 'bg-gray-700/40 hover:bg-gray-700/60'}`}
              onClick={() => onSwitchChatTarget(contact.id)}
              aria-current={activeChatTargetId === contact.id ? "page" : undefined}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${activeChatTargetId === contact.id ? 'bg-teal-500' : 'bg-gray-500'}`}>
                  {contact.avatarInitial}
                </div>
                <div className="overflow-hidden">
                  <span className="font-medium text-gray-100 truncate block">{contact.name}</span>
                  {contact.description && <span className="text-xs text-gray-400 truncate block">{contact.description}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-auto text-center text-xs text-gray-500 p-2">
            Device ID: TERM-04A
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-grow flex flex-col overflow-hidden">
        <div className="bg-teal-800 bg-opacity-75 text-teal-200 text-xs text-center py-1.5 border-b border-t border-teal-700/60 shadow-inner">
          Secure Channel: Messages self-destruct in 24 hours.
        </div>

        {(isApiKeyAvailable || messages.length > 0) ? ( // Show chat if API key available OR if there are messages (e.g. non-responsive chats)
          <>
            <MessageList messages={messages} messagesEndRef={messagesEndRef} />
            <UserInput 
              onSendMessage={onSendMessage} 
              isLoading={isLilyTyping} // Only Lily's typing should block input globally for her chat
              isResponsive={isCurrentChatResponsive}
              currentContactName={getContactDisplayName(activeChatTargetId)}
            />
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-4 text-center bg-gray-800/30">
            <LoadingSpinner size="w-12 h-12" />
            <p className="mt-4 text-lg text-red-400">Communication Module Offline</p>
            {chatError && <p className="mt-2 text-sm text-red-400">{chatError}</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default EscapeRoomChat;
