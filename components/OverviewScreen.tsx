
import React, { useState, useRef } from 'react';
import { OverviewApp } from '../App';
import { View } from '../types';

const MessengerIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M20 2H4C2.89543 2 2 2.89543 2 4V22L6 18H20C21.1046 18 22 17.1046 22 16V4C22 2.89543 21.1046 2 20 2ZM9.00001 11C8.17158 11 7.50001 10.3284 7.50001 9.5C7.50001 8.67157 8.17158 8 9.00001 8C9.82844 8 10.5 8.67157 10.5 9.5C10.5 10.3284 9.82844 11 9.00001 11ZM15 11C14.1716 11 13.5 10.3284 13.5 9.5C13.5 8.67157 14.1716 8 15 8C15.8284 8 16.5 8.67157 16.5 9.5C16.5 10.3284 15.8284 11 15 11Z" />
  </svg>
);

const GalleryIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6ZM4 6V18H20V6H4ZM8 8C6.89543 8 6 8.89543 6 10V14C6 15.1046 6.89543 16 8 16H16C17.1046 16 18 15.1046 18 14V10C18 8.89543 17.1046 8 16 8H8ZM8 10H16V14H8V10ZM11 11L9 13H15L13 11H11Z" />
  </svg>
);

const BrowserIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.65 16.07 16.46 15 15 15H13V13C13 12.45 12.55 12 12 12C11.45 12 11 12.45 11 13V15H9C7.54 15 6.35 16.07 6.1 17.39C4.8 16.07 4 14.12 4 12C4 7.92 7.92 4.01 12 4.01C16.08 4.01 20 7.92 20 12C20 14.12 19.2 16.07 17.9 17.39Z" />
    </svg>
  );

const CalculatorIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7 2C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2H7ZM7 4H17V6H7V4ZM7 8H9V10H7V8ZM11 8H13V10H11V8ZM15 8H17V10H15V8ZM7 12H9V14H7V12ZM11 12H13V14H11V12ZM15 12H17V14H15V12ZM7 16H9V18H7V16ZM11 16H17V18H11V16Z" />
  </svg>
);

interface OverviewScreenProps {
  apps: OverviewApp[];
  onSwitchApp: (view: View) => void;
  onClose: () => void; // This is for closing the overview screen itself
  onCloseApp: (viewId: View) => void; // This is for closing an individual app card
}

const AppCard: React.FC<{ app: OverviewApp; onSwitchApp: (view: View) => void; onCloseApp: (viewId: View) => void; }> = ({ app, onSwitchApp, onCloseApp }) => {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const dragThreshold = -80; // Pixels to drag up to close

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return; // Only main mouse button
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(e.clientY);
    if (cardRef.current) {
      cardRef.current.style.transition = 'none'; // Disable transition during drag
    }
    e.stopPropagation(); // Prevent overview from closing
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    setCurrentY(e.clientY);
    if (cardRef.current) {
      const dy = e.clientY - startY;
      // Only allow upward movement for "close" gesture, and some resistance
      cardRef.current.style.transform = `translateY(${Math.min(0, dy / 1.5)}px) scale(1.05)`;
    }
    e.stopPropagation();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    const dy = currentY - startY;

    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.2s ease-out'; // Re-enable transition
      cardRef.current.style.transform = 'translateY(0) scale(1.05)'; // Snap back or animate out
    }

    if (dy < dragThreshold) {
      // Animate out then close
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateY(-200%) scale(0.8)';
        cardRef.current.style.opacity = '0';
        setTimeout(() => {
          onCloseApp(app.id);
        }, 250); // Match animation
      } else {
        onCloseApp(app.id);
      }
    } else {
      // If not dragged enough, or dragged down, consider it a click to switch
      if (Math.abs(dy) < 10) { // If it was a small drag, treat as click
         onSwitchApp(app.id);
      } else if (cardRef.current){
         cardRef.current.style.transform = 'translateY(0) scale(1.0)'; // Snap back to normal size
      }
    }
    e.stopPropagation();
  };
  
  // Prevent default drag behavior for the entire card
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };


  let icon;
  let iconColorClass = "text-teal-400";
  const iconSize = "w-12 h-12";

  if (app.id === 'chat') {
    icon = <MessengerIcon className={iconSize} />;
    iconColorClass = "text-green-400";
  } else if (app.id === 'gallery_locked' || app.id === 'gallery_unlocked') { // Handle both gallery states for icon
    icon = <GalleryIcon className={iconSize} />;
    iconColorClass = "text-teal-400";
  } else if (app.id === 'browser') {
    icon = <BrowserIcon className={iconSize} />;
    iconColorClass = "text-blue-400"; 
  } else if (app.id === 'calculator') {
    icon = <CalculatorIcon className={iconSize} />;
    iconColorClass = "text-teal-400";
  }


  return (
    <button
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // If mouse leaves element while dragging
      onDragStart={handleDragStart} // Prevent native image drag
      className={`bg-gray-700 rounded-lg shadow-xl p-4 w-64 h-80 flex flex-col items-center justify-between text-white transition-all duration-150 transform focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 cursor-grab active:cursor-grabbing ${isDragging ? 'scale-105 shadow-2xl' : 'hover:scale-105 hover:shadow-2xl'}`}
      aria-label={`Application: ${app.title}. Status: ${app.status}. Click or drag up to close.`}
      style={{ touchAction: 'none' }} // Useful for preventing scrolling on touch devices if we add touch events
    >
      <div className="flex flex-col items-center justify-center flex-grow pointer-events-none"> {/* pointer-events-none on children for easier drag */}
        <div className={`p-3 rounded-lg ${iconColorClass}`}>
            {icon}
        </div>
        <h3 className="mt-3 text-xl font-semibold">{app.title}</h3>
        <p className="text-sm text-gray-400 mt-1 px-2 text-center">{app.status}</p>
      </div>
      <div className="text-xs text-gray-500 mt-2 pointer-events-none">Tap to open. Drag up to close.</div>
    </button>
  );
};

const OverviewScreen: React.FC<OverviewScreenProps> = ({ apps, onSwitchApp, onClose, onCloseApp }) => {
  return (
    <div
      className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md flex flex-col items-center justify-center p-4 z-40"
      onClick={onClose} // Click on background closes overview
      role="dialog"
      aria-modal="true"
      aria-labelledby="overview-title"
    >
      <div
        className="w-full h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()} // Clicks within this div don't close overview
      >
        <h2 id="overview-title" className="text-3xl font-bold text-gray-200 mb-8" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Recent Apps
        </h2>
        {apps.length > 0 ? (
          <div className="flex space-x-6 overflow-x-auto py-4 custom-scrollbar">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} onSwitchApp={onSwitchApp} onCloseApp={onCloseApp} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-lg">No recent apps.</p>
        )}
         {/* Removed the global close button, background click or nav controls will close */}
      </div>
    </div>
  );
};

export default OverviewScreen;
