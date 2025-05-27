
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import AndroidHomeScreen from './components/AndroidHomeScreen';
import EscapeRoomChat from './components/EscapeRoomChat';
import ApiKeyBanner from './components/ApiKeyBanner';
import NavigationControls from './components/NavigationControls';
import InitialLoadingScreen from './components/InitialLoadingScreen';
import GalleryPinScreen from './components/GalleryPinScreen';
import GalleryScreen from './components/GalleryScreen'; 
import OverviewScreen from './components/OverviewScreen';
import BrowserScreen from './components/BrowserScreen';
import SkullsSystemScreen from './components/SkullsSystemScreen'; 
import IntroScreen from './components/IntroScreen';
import GameStartScreen from './components/GameStartScreen';
import SystemInitiatingScreen from './components/SystemInitiatingScreen';
import CalculatorScreen from './components/CalculatorScreen'; 
import { 
    API_KEY_ERROR_MESSAGE, SYSTEM_INSTRUCTION, LILY_TYPING_MESSAGE, 
    IMAGE_GENERATION_ERROR_MESSAGE, RELOCATION_UNIT_CHAT_HISTORY, 
    CHAT_CONTACT_LIST, LILY_CHAT_SPEAKER_NAME, GALLERY_PIN, 
    SKULLS_SYSTEM_PASSWORD, CHUTE_KEYPAD_SEQUENCE 
} from './constants';
import { Message, Sender, ChatTargetId, ChatContact, View as AppView } from './types'; 
import { initChatSession, sendMessageToChat } from './services/geminiService';
import { generateImageFromPrompt } from './services/imageService';

type AppStatus = 'uninitialized' | 'initializing_api' | 'api_ready' | 'api_error';

export interface OverviewApp {
  id: AppView;
  title: string;
  status: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('game_start');
  const [appStatus, setAppStatus] = useState<AppStatus>('uninitialized');
  const [aiInstance, setAiInstance] = useState<GoogleGenAI | null>(null);
  const [isApiKeyActuallyAvailable, setIsApiKeyActuallyAvailable] = useState<boolean>(false);

  const [chatHistories, setChatHistories] = useState<Record<ChatTargetId, Message[]>>({
    lily: [],
    relocation: [],
    subject32: [],
    subject33: [],
  });
  const [activeChatTargetId, setActiveChatTargetId] = useState<ChatTargetId>('lily');
  const [isCurrentChatResponsive, setIsCurrentChatResponsive] = useState<boolean>(true);
  const [isLilyTyping, setIsLilyTyping] = useState<boolean>(false);
  const [lilyChatSession, setLilyChatSession] = useState<Chat | null>(null);
  const [lilyChatInitialized, setLilyChatInitialized] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [isOverviewVisible, setIsOverviewVisible] = useState<boolean>(false);
  const [activeAppsInOverview, setActiveAppsInOverview] = useState<OverviewApp[]>([]);

  const [browserCurrentUrl, setBrowserCurrentUrl] = useState<string>('');
  const [calculatorDisplayValue, setCalculatorDisplayValue] = useState<string>("0");

  // Puzzle states
  const [galleryUnlocked, setGalleryUnlocked] = useState<boolean>(false);
  const [skullsSystemUnlocked, setSkullsSystemUnlocked] = useState<boolean>(false);
  const [relocationEta, setRelocationEta] = useState<string>("Calculating...");


  const MIN_TYPING_DELAY = 700; // ms
  const MAX_TYPING_DELAY = 4000; // ms
  const TYPING_DELAY_PER_CHAR = 40; // ms

  const calculateTypingDelay = (textLength: number): number => {
    return Math.min(MAX_TYPING_DELAY, Math.max(MIN_TYPING_DELAY, textLength * TYPING_DELAY_PER_CHAR));
  };

  const updateActiveApps = useCallback((view: AppView, title: string, status: string) => {
    setActiveAppsInOverview(prevApps => {
      let newApps = [...prevApps];
      // Handle gallery-specific overview logic
      if (view === 'gallery_unlocked') {
        // Remove 'gallery_locked' if it exists
        newApps = newApps.filter(app => app.id !== 'gallery_locked');
      } else if (view === 'gallery_locked') {
        // Remove 'gallery_unlocked' if it exists
        newApps = newApps.filter(app => app.id !== 'gallery_unlocked');
      }
      
      // Remove the current view if it's being updated/re-added, then add it to the front
      newApps = newApps.filter(app => app.id !== view);
      const newAppEntry: OverviewApp = { id: view, title, status };
      
      // Maintain a specific order for common apps if desired, new/updated app at front
      const order: AppView[] = ['chat', 'gallery_locked', 'gallery_unlocked', 'browser', 'calculator'];
      const sortedApps = [newAppEntry, ...newApps]
        .sort((a, b) => {
          const indexA = order.indexOf(a.id);
          const indexB = order.indexOf(b.id);
          // If both are not in fixed order, keep relative order (newAppEntry is already at front)
          if (indexA === -1 && indexB === -1) return newApps.indexOf(a) - newApps.indexOf(b); 
          if (indexA === -1) return 1; 
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      return sortedApps;
    });
  }, []);

  const proceedToScenarioIntro = useCallback(() => setCurrentView('intro'), []);
  const proceedToSystemInitiating = useCallback(() => setCurrentView('system_initiating'), []);

  useEffect(() => {
    if (currentView === 'system_initiating') {
      const timer = setTimeout(() => setCurrentView('initial_load'), 4000);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const initializeApi = useCallback(() => {
    setAppStatus('initializing_api');
    const key = process.env.API_KEY;
    if (key) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        setAiInstance(ai);
        setIsApiKeyActuallyAvailable(true);
        setAppStatus('api_ready');
        setCurrentView('home');
      } catch (error) {
        console.error("Error initializing GoogleGenAI:", error);
        setAppStatus('api_error');
        setIsApiKeyActuallyAvailable(false);
      }
    } else {
      setAppStatus('api_error');
      setIsApiKeyActuallyAvailable(false);
    }
  }, []);
  
  const initializeAllChats = useCallback(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0); 
    const formattedNextHourTime = nextHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRelocationEta(formattedNextHourTime); 

    const relocationHistoryWithTimestamps = RELOCATION_UNIT_CHAT_HISTORY.map(msg => {
      let updatedText = msg.text;
      if (updatedText?.includes('[DYNAMIC_NEXT_HOUR_TIME]')) {
        updatedText = updatedText.replace('[DYNAMIC_NEXT_HOUR_TIME]', formattedNextHourTime);
      }
      return { ...msg, text: updatedText, timestamp: new Date(msg.timestamp) }; 
    });

    setChatHistories(prev => ({
      ...prev,
      relocation: relocationHistoryWithTimestamps,
      subject32: [], 
      subject33: [], 
    }));
  }, []);

  useEffect(() => {
    if (appStatus === 'api_ready') {
      initializeAllChats();
    }
  }, [appStatus, initializeAllChats]);

  const parseGeminiResponse = useCallback((responseText: string): { segments: Array<{ type: 'text'; content: string } | { type: 'image_prompt'; content: string }> } => {
    const rawSegments = responseText.split('||PART_BREAK||');
    const segments: Array<{ type: 'text'; content: string } | { type: 'image_prompt'; content: string }> = [];
    const imagePromptRegex = /\[IMAGE_PROMPT:\s*(.*?)\]/s;

    for (const rawSegment of rawSegments) {
        const trimmedSegment = rawSegment.trim();
        if (!trimmedSegment) continue;

        const imageMatch = trimmedSegment.match(imagePromptRegex);
        if (imageMatch && imageMatch[1]) {
            const textBeforePrompt = trimmedSegment.substring(0, imageMatch.index).trim();
            if (textBeforePrompt) {
                 segments.push({ type: 'text', content: textBeforePrompt});
            }
            segments.push({ type: 'image_prompt', content: imageMatch[1].trim() });
            const textAfterPrompt = trimmedSegment.substring(imageMatch.index + imageMatch[0].length).trim();
             if (textAfterPrompt) {
                 segments.push({ type: 'text', content: textAfterPrompt});
            }
        } else {
            segments.push({ type: 'text', content: trimmedSegment });
        }
    }
    return { segments };
  }, []);

  const processAndDisplayLilyResponse = useCallback(async (responseText: string, initialCall: boolean = false) => {
    const { segments } = parseGeminiResponse(responseText);
    let typingMessageId = `lily-typing-${Date.now()}`;

    const addTypingIndicator = () => {
      typingMessageId = `lily-typing-${Date.now()}`;
      setChatHistories(prev => ({
        ...prev,
        lily: [...prev.lily.filter(m => !(m.isLoading && m.sender === Sender.Lily)), {
          id: typingMessageId,
          sender: Sender.Lily, 
          text: LILY_TYPING_MESSAGE,
          isLoading: true,
          timestamp: new Date(),
        }]
      }));
      setIsLilyTyping(true);
      if (!initialCall) updateActiveApps('chat', 'Messenger', LILY_TYPING_MESSAGE);
    };
    
    const removeTypingIndicator = () => {
       setChatHistories(prev => ({...prev, lily: prev.lily.filter(msg => msg.id !== typingMessageId)}));
       setIsLilyTyping(false);
    };

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (segment.type === 'text') {
            if(segment.content.trim()){
                addTypingIndicator();
                await new Promise(resolve => setTimeout(resolve, calculateTypingDelay(segment.content.length)));
                removeTypingIndicator();
                setChatHistories(prev => ({...prev, lily: [...prev.lily, {
                    id: `lily-${Date.now()}-${i}`,
                    sender: Sender.Lily,
                    text: segment.content,
                    timestamp: new Date(),
                }]}));
                 if (!initialCall) updateActiveApps('chat', 'Messenger', `${chatHistories.lily.filter(m => m.sender === Sender.Lily && m.text).length + 1} messages from ${LILY_CHAT_SPEAKER_NAME}`);
            }
        } else if (segment.type === 'image_prompt') {
            if (!aiInstance) {
                 setChatHistories(prev => ({...prev, lily: [...prev.lily, { id: `lily-img-error-no-ai-${Date.now()}`, sender: Sender.Lily, text: IMAGE_GENERATION_ERROR_MESSAGE, isLoading: false, isError: true, timestamp: new Date() }]}));
                 continue;
            }
            const imageMessageId = `img-${Date.now()}-${i}`;
            setChatHistories(prev => ({...prev, lily: [...prev.lily, {
                id: imageMessageId,
                sender: Sender.Lily,
                isLoading: true,
                timestamp: new Date(),
            }]}));
            if (!initialCall) updateActiveApps('chat', 'Messenger', `${LILY_CHAT_SPEAKER_NAME} is sending an image...`);
            try {
                const imageUrl = await generateImageFromPrompt(aiInstance, segment.content);
                setChatHistories(prev => ({...prev, lily: prev.lily.map(msg =>
                    msg.id === imageMessageId ? { ...msg, imageUrl, isLoading: false } : msg
                )}));
            } catch (imgError) {
                console.error("Image generation error:", imgError);
                 setChatHistories(prev => ({...prev, lily: prev.lily.map(msg =>
                    msg.id === imageMessageId ? { id: `lily-img-error-${Date.now()}`, sender: Sender.Lily, text: IMAGE_GENERATION_ERROR_MESSAGE, isLoading: false, isError: true, timestamp: new Date() } : msg
                )}));
            }
            if (!initialCall && i === segments.length -1) {
                 updateActiveApps('chat', 'Messenger', `${chatHistories.lily.filter(m => m.sender === Sender.Lily && m.text).length} messages, 1 image`);
            }
        }
        if (i < segments.length - 1 && segments[i+1].type === 'text' && segments[i+1].content.trim()) {
            await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400)); 
        }
    }
    setIsLilyTyping(false); 
  }, [aiInstance, parseGeminiResponse, updateActiveApps, chatHistories.lily]);

  const initializeLilyChat = useCallback(async () => {
    if (!aiInstance || lilyChatInitialized) {
      if (!aiInstance) {
        setChatError("AI Service not initialized.");
        setChatHistories(prev => ({...prev, lily: [{ id: 'ai-init-error', sender: Sender.System, text: "Error: AI Service not initialized.", timestamp: new Date(), isError: true }]}));
      }
      return;
    }

    setLilyChatInitialized(true);
    setChatHistories(prev => ({...prev, lily: [] })); 
    setChatError(null);
    setIsLilyTyping(false);
    updateActiveApps('chat', 'Messenger', `Chat with ${LILY_CHAT_SPEAKER_NAME}`);

    try {
      const newChat = initChatSession(aiInstance, SYSTEM_INSTRUCTION);
      setLilyChatSession(newChat);
    } catch (error) {
      console.error("Error initializing Lily chat session:", error);
      const errorText = `Error starting ${LILY_CHAT_SPEAKER_NAME} session: ${error instanceof Error ? error.message : String(error)}`;
      setChatError(errorText);
      setChatHistories(prev => ({...prev, lily: [...prev.lily, { id: `init-error-${Date.now()}`, sender: Sender.System, text: errorText, timestamp: new Date(), isError: true }]}));
      setLilyChatInitialized(false);
      updateActiveApps('chat', 'Messenger', 'Error starting chat');
    }
  }, [aiInstance, lilyChatInitialized, updateActiveApps]);

  const handleSwitchChatTarget = useCallback(async (targetId: ChatTargetId) => {
    setActiveChatTargetId(targetId);
    const contact = CHAT_CONTACT_LIST.find(c => c.id === targetId);
    setIsCurrentChatResponsive(contact ? contact.isResponsive : false);

    if (targetId === 'lily' && appStatus === 'api_ready' && !lilyChatInitialized && aiInstance) {
      await initializeLilyChat();
    }
    const status = contact ? (contact.description || `Chat with ${targetId === 'lily' ? LILY_CHAT_SPEAKER_NAME : contact.name}`) : 'No active chat';
    updateActiveApps('chat', 'Messenger', status);

  }, [appStatus, aiInstance, lilyChatInitialized, initializeLilyChat, updateActiveApps]);

  const navigateToChat = useCallback((targetId: ChatTargetId = 'lily') => {
    if (appStatus === 'api_ready') {
      setCurrentView('chat');
      handleSwitchChatTarget(targetId); 
      if (isOverviewVisible) setIsOverviewVisible(false);
    } else {
      setCurrentView('home'); 
    }
  }, [appStatus, isOverviewVisible, handleSwitchChatTarget]);

  useEffect(() => {
    if (currentView === 'chat' && activeChatTargetId === 'lily' && appStatus === 'api_ready' && !lilyChatInitialized && aiInstance) {
      initializeLilyChat();
    }
  }, [currentView, activeChatTargetId, appStatus, lilyChatInitialized, aiInstance, initializeLilyChat]);

  const navigateToHome = useCallback(() => {
    if (isOverviewVisible) setIsOverviewVisible(false);
    setCurrentView('home');
  }, [isOverviewVisible]);

  const navigateToGalleryLocked = useCallback(() => {
    if (galleryUnlocked) {
        setCurrentView('gallery_unlocked');
        updateActiveApps('gallery_unlocked', 'Gallery', 'Contents Unlocked');
    } else {
        setCurrentView('gallery_locked');
        updateActiveApps('gallery_locked', 'Gallery', 'PIN Required');
    }
    if (isOverviewVisible) setIsOverviewVisible(false);
  }, [isOverviewVisible, updateActiveApps, galleryUnlocked]);

  const handleGalleryUnlock = useCallback((pin: string): boolean => {
    if (pin === GALLERY_PIN) {
      setGalleryUnlocked(true);
      setCurrentView('gallery_unlocked');
      // Update overview: remove 'gallery_locked' if present, add/update 'gallery_unlocked'
      setActiveAppsInOverview(prevApps => {
        const otherApps = prevApps.filter(app => app.id !== 'gallery_locked' && app.id !== 'gallery_unlocked');
        return [{ id: 'gallery_unlocked', title: 'Gallery', status: 'Contents Unlocked' }, ...otherApps];
      });
      return true;
    }
    return false;
  }, [setActiveAppsInOverview]); // Removed updateActiveApps from dep array, using direct setter
  
  const navigateToBrowser = useCallback(() => {
    if (browserCurrentUrl.toLowerCase() !== 'skulls.system' || !skullsSystemUnlocked) {
        setSkullsSystemUnlocked(false);
    }
    setCurrentView('browser');
    let statusText = 'Idle';
    if (browserCurrentUrl) {
        if (browserCurrentUrl.toLowerCase() === 'skulls.system') {
            statusText = skullsSystemUnlocked ? 'skulls.system - Unlocked' : 'skulls.system - Locked';
        } else {
            statusText = 'Access Restricted';
        }
    }
    updateActiveApps('browser', 'Web Browser', statusText);
    if (isOverviewVisible) setIsOverviewVisible(false);
  }, [isOverviewVisible, browserCurrentUrl, updateActiveApps, skullsSystemUnlocked]);

  const handleSkullsSystemUnlockAttempt = (password: string): boolean => {
    if (password === SKULLS_SYSTEM_PASSWORD) {
      setSkullsSystemUnlocked(true);
      updateActiveApps('browser', 'Web Browser', 'skulls.system - Unlocked');
      return true;
    }
    setSkullsSystemUnlocked(false);
    updateActiveApps('browser', 'Web Browser', 'skulls.system - Locked');
    return false;
  };

  const handleBrowserNavigationRequest = (url: string) => {
    const trimmedUrl = url.trim();
    if (trimmedUrl.toLowerCase() !== 'skulls.system') {
      setSkullsSystemUnlocked(false); 
    }
    setBrowserCurrentUrl(trimmedUrl);
    let statusText = 'Idle';
    if (trimmedUrl) {
        if (trimmedUrl.toLowerCase() === 'skulls.system') {
            statusText = skullsSystemUnlocked ? 'skulls.system - Unlocked' : 'skulls.system - Locked';
        } else {
            statusText = 'Access Restricted';
        }
    }
    updateActiveApps('browser', 'Web Browser', statusText);
  };

  const navigateToCalculator = useCallback(() => {
    setCurrentView('calculator');
    updateActiveApps('calculator', 'Calculator', calculatorDisplayValue);
    if (isOverviewVisible) setIsOverviewVisible(false);
  }, [isOverviewVisible, calculatorDisplayValue, updateActiveApps]);


  const handleBackNavigation = () => {
    if (isOverviewVisible) {
      setIsOverviewVisible(false);
      return;
    }
    if (currentView === 'chat' || currentView === 'gallery_locked' || currentView === 'gallery_unlocked' || currentView === 'browser' || currentView === 'calculator') {
      navigateToHome();
    }
  };

  const sendMessageChatLogic = async (userInput: string) => {
    const currentUserMessage: Message = {
      id: `user-${Date.now()}`,
      sender: Sender.User, 
      text: userInput,
      timestamp: new Date(),
    };

    setChatHistories(prev => ({
      ...prev,
      [activeChatTargetId]: [...prev[activeChatTargetId], currentUserMessage]
    }));
    setChatError(null);

    if (activeChatTargetId === 'lily') {
      if (!lilyChatSession || !aiInstance || isLilyTyping) return;
      try {
        const response = await sendMessageToChat(lilyChatSession, userInput);
        await processAndDisplayLilyResponse(response.text);
        const lilyMessagesCount = chatHistories.lily.filter(m => m.sender === Sender.Lily && m.text).length + parseGeminiResponse(response.text).segments.filter(s => s.type === 'text').length;
        updateActiveApps('chat', 'Messenger', `${lilyMessagesCount} messages from ${LILY_CHAT_SPEAKER_NAME}`);
      } catch (error) {
        console.error(`Error sending message to ${LILY_CHAT_SPEAKER_NAME}:`, error);
        setChatHistories(prev => ({...prev, lily: prev.lily.filter(m => !(m.isLoading && m.sender === Sender.Lily)) }));
        setIsLilyTyping(false);
        const errorText = `${LILY_CHAT_SPEAKER_NAME} seems to be having trouble responding. (Error: ${error instanceof Error ? error.message : String(error)})`;
        setChatError(errorText);
        setChatHistories(prev => ({...prev, lily: [...prev.lily, {
          id: `error-${Date.now()}`, sender: Sender.System, text: errorText, timestamp: new Date(), isError: true,
        }]}));
        updateActiveApps('chat', 'Messenger', 'Error in chat');
      }
    } else {
      const contact = CHAT_CONTACT_LIST.find(c => c.id === activeChatTargetId);
      const status = contact ? `Messaged ${contact.name}` : 'Message sent';
      updateActiveApps('chat', 'Messenger', status);
    }
  };

  const toggleOverview = () => setIsOverviewVisible(prev => !prev);

  const switchToAppFromOverview = (view: AppView) => {
    if (view === 'chat') navigateToChat(activeChatTargetId); // Keeps current active chat target
    else if (view === 'gallery_locked' || view === 'gallery_unlocked') navigateToGalleryLocked(); // This will intelligently open locked or unlocked
    else if (view === 'browser') navigateToBrowser();
    else if (view === 'calculator') navigateToCalculator();
    setIsOverviewVisible(false);
  };
  
  const handleCloseAppFromOverview = useCallback((viewId: AppView) => {
    setActiveAppsInOverview(prevApps => prevApps.filter(app => app.id !== viewId));
    if (currentView === viewId) {
        // Special handling if closing gallery - ensure correct state if re-opened
        if (viewId === 'gallery_unlocked') setGalleryUnlocked(false); 
        navigateToHome();
    }
  }, [currentView, navigateToHome]);

  const renderContent = () => {
    switch (currentView) {
      case 'game_start': return <GameStartScreen onStartGame={proceedToScenarioIntro} />;
      case 'intro': return <IntroScreen onProceed={proceedToSystemInitiating} />;
      case 'system_initiating': return <SystemInitiatingScreen />;
      case 'initial_load': return <InitialLoadingScreen onStartExperience={initializeApi} status={appStatus} />;
      case 'home':
        return <AndroidHomeScreen
                  onOpenMessenger={() => navigateToChat('lily')}
                  onOpenGallery={navigateToGalleryLocked}
                  onOpenBrowser={navigateToBrowser}
                  onOpenCalculator={navigateToCalculator} 
                  isApiKeyAvailable={isApiKeyActuallyAvailable}
                />;
      case 'chat':
        return <EscapeRoomChat
                  messages={chatHistories[activeChatTargetId]}
                  isLilyTyping={activeChatTargetId === 'lily' && isLilyTyping}
                  chatError={chatError}
                  onSendMessage={sendMessageChatLogic}
                  isApiKeyAvailable={isApiKeyActuallyAvailable}
                  chatContacts={CHAT_CONTACT_LIST}
                  activeChatTargetId={activeChatTargetId}
                  onSwitchChatTarget={handleSwitchChatTarget}
                  isCurrentChatResponsive={isCurrentChatResponsive}
                />;
      case 'gallery_locked': return <GalleryPinScreen onBack={navigateToHome} onPinSuccess={handleGalleryUnlock} />;
      case 'gallery_unlocked': return <GalleryScreen chuteKeypadSequence={CHUTE_KEYPAD_SEQUENCE} />;
      case 'browser':
        return <BrowserScreen
                  onNavigate={handleBrowserNavigationRequest}
                  currentUrl={browserCurrentUrl}
                  onSkullsSystemUnlockAttempt={handleSkullsSystemUnlockAttempt}
                  isSkullsSystemUnlocked={skullsSystemUnlocked}
                  skullsSystemContentComponent={<SkullsSystemScreen relocationEta={relocationEta} />}
                />;
      case 'calculator': 
        return <CalculatorScreen onDisplayChange={setCalculatorDisplayValue} />;
      default: return <GameStartScreen onStartGame={proceedToScenarioIntro} />;
    }
  };

  const showNavigationControls = currentView !== 'game_start' && currentView !== 'intro' && currentView !== 'system_initiating' && currentView !== 'initial_load' && appStatus === 'api_ready';
  const showApiKeyBanner = appStatus === 'api_error' && currentView !== 'game_start' && currentView !== 'intro' && currentView !== 'system_initiating' && currentView !== 'initial_load';

  return (
    <div className="h-screen w-screen flex flex-col bg-black">
      {showApiKeyBanner && <ApiKeyBanner />}
      <main className="flex-grow overflow-hidden relative">
        {renderContent()}
        {isOverviewVisible && (
          <OverviewScreen
            apps={activeAppsInOverview}
            onSwitchApp={switchToAppFromOverview}
            onClose={toggleOverview}
            onCloseApp={handleCloseAppFromOverview}
          />
        )}
      </main>
      {showNavigationControls && (
        <NavigationControls
          onHomeClick={navigateToHome}
          onBackClick={handleBackNavigation}
          onOverviewClick={toggleOverview}
          isChatActive={currentView === 'chat'}
          isGalleryActive={currentView === 'gallery_locked'} // For back button, either state implies "Gallery"
          isGalleryUnlockedActive={currentView === 'gallery_unlocked'}
          isBrowserActive={currentView === 'browser'}
          isCalculatorActive={currentView === 'calculator'} 
          isOverviewVisible={isOverviewVisible}
        />
      )}
    </div>
  );
};

export default App;
