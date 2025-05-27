
import React from 'react';
import AppIcon from './AppIcon';

interface IconProps {
  className?: string;
}

const MessengerIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className || "w-16 h-16 text-green-400"} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M20 2H4C2.89543 2 2 2.89543 2 4V22L6 18H20C21.1046 18 22 17.1046 22 16V4C22 2.89543 21.1046 2 20 2ZM9.00001 11C8.17158 11 7.50001 10.3284 7.50001 9.5C7.50001 8.67157 8.17158 8 9.00001 8C9.82844 8 10.5 8.67157 10.5 9.5C10.5 10.3284 9.82844 11 9.00001 11ZM15 11C14.1716 11 13.5 10.3284 13.5 9.5C13.5 8.67157 14.1716 8 15 8C15.8284 8 16.5 8.67157 16.5 9.5C16.5 10.3284 15.8284 11 15 11Z" />
  </svg>
);

const GalleryIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className || "w-16 h-16"} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6ZM4 6V18H20V6H4ZM8 8C6.89543 8 6 8.89543 6 10V14C6 15.1046 6.89543 16 8 16H16C17.1046 16 18 15.1046 18 14V10C18 8.89543 17.1046 8 16 8H8ZM8 10H16V14H8V10ZM11 11L9 13H15L13 11H11Z" />
  </svg>
);

const BrowserIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className || "w-16 h-16"} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.65 16.07 16.46 15 15 15H13V13C13 12.45 12.55 12 12 12C11.45 12 11 12.45 11 13V15H9C7.54 15 6.35 16.07 6.1 17.39C4.8 16.07 4 14.12 4 12C4 7.92 7.92 4.01 12 4.01C16.08 4.01 20 7.92 20 12C20 14.12 19.2 16.07 17.9 17.39Z" />
  </svg>
);

const CalculatorIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className || "w-16 h-16"} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7 2C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2H7ZM7 4H17V6H7V4ZM7 8H9V10H7V8ZM11 8H13V10H11V8ZM15 8H17V10H15V8ZM7 12H9V14H7V12ZM11 12H13V14H11V12ZM15 12H17V14H15V12ZM7 16H9V18H7V16ZM11 16H17V18H11V16Z" />
  </svg>
);


interface AndroidHomeScreenProps {
  isApiKeyAvailable: boolean;
  onOpenMessenger: () => void;
  onOpenGallery: () => void;
  onOpenBrowser: () => void;
  onOpenCalculator: () => void; // New prop
}

const AndroidHomeScreen: React.FC<AndroidHomeScreenProps> = ({ 
    isApiKeyAvailable, 
    onOpenMessenger, 
    onOpenGallery,
    onOpenBrowser,
    onOpenCalculator // New prop
}) => {

  const handleOpenMessenger = () => {
    if (isApiKeyAvailable) {
      onOpenMessenger();
    }
  };
  
  const handleOpenGallery = () => {
    onOpenGallery();
  };

  const handleOpenBrowser = () => {
    onOpenBrowser();
  };
  
  const handleOpenCalculator = () => {
    onOpenCalculator();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-gray-800 via-gray-900 to-black p-8 relative">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-200 mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          System Online
        </h1>
        <p className="text-gray-400 mb-12 text-lg">Welcome. Select an application.</p>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 p-4">
        <AppIcon 
          icon={<MessengerIcon />} 
          label="Messenger" 
          onClick={handleOpenMessenger}
          disabled={!isApiKeyAvailable} 
        />
        <AppIcon
          icon={<GalleryIcon />}
          label="Gallery"
          onClick={handleOpenGallery}
          disabled={false} 
        />
        <AppIcon
          icon={<BrowserIcon />}
          label="Browser"
          onClick={handleOpenBrowser}
          disabled={false}
        />
        <AppIcon
          icon={<CalculatorIcon />}
          label="Calculator"
          onClick={handleOpenCalculator}
          disabled={false} 
        />
      </div>

      {!isApiKeyAvailable && (
        <p className="mt-8 text-red-400 text-center px-4 animate-pulse">
          Configuration Error. Messenger features may be impaired.
        </p>
      )}
       <footer className="absolute bottom-4 left-0 right-0 text-center w-full text-gray-600 text-xs">
          <p>&copy; {new Date().getFullYear()} System Simulation. All rights reserved.</p>
        </footer>
    </div>
  );
};

export default AndroidHomeScreen;
