"use client";

import { useState, useRef, useEffect } from "react";
import Panel1 from "./Panel1";
import Panel3 from "./Panel3";
import { Filter, Settings, Home, Layers } from "lucide-react";
import SettingsModal from "./SettingsModal";
import DeploySettingsModal from "./DeploySettingsModal";
import { getTheme } from "@/utils/themes";

interface Wallet {
  id: string;
  type: 'solana' | 'evm';
  publicKey: string;
  privateKey: string;
  compositeKey: string;
  balance: number;
  isActive: boolean;
}

interface Tweet {
  id: string;
  username: string;
  displayName: string;
  handle: string;
  verified: boolean;
  timestamp: string;
  text: string;
  imageUrl?: string;
  profilePic: string;
  highlightColor?: string;
}

interface CustomNotification {
  id: string;
  username: string;
  color: string;
  sound: string;
}

interface ButtonConfig {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface CustomPreset {
  id: string;
  name: string;
  namePrefix: string;
  nameSuffix: string;
  deployPlatform: string;
  tickerMode: string;
  imageType: string;
  keybind: string;
}

interface PresetTriggerData {
  namePrefix: string;
  nameSuffix: string;
  deployPlatform: string;
  tickerMode: string;
  imageType: string;
  selectedText?: string;
  tweetImageUrl?: string;
}

export default function ResizablePanels() {
  // Store panel widths as percentages
  const [panel1Width, setPanel1Width] = useState(24.5);
  const [panel2Width, setPanel2Width] = useState(21.5);
  const [panel3Width, setPanel3Width] = useState(54);
  
  // Store header height as percentage
  const [headerHeight, setHeaderHeight] = useState(8);
  
  // Store button configurations with individual positions and sizes (locked in place)
  const [buttons] = useState<ButtonConfig[]>([
    { id: 1, x: 15, y: 15, width: 90, height: 45, label: "Home" },
    { id: 10, x: 125, y: 15, width: 80, height: 45, label: "Saved" },
    { id: 11, x: 215, y: 15, width: 90, height: 45, label: "Google" },
    { id: 2, x: 315, y: 15, width: 80, height: 45, label: "Filters" },
    { id: 3, x: 405, y: 15, width: 60, height: 45, label: "Settings" },
    { id: 5, x: 475, y: 15, width: 280, height: 45, label: "Site Chat" },
    { id: 6, x: 765, y: 15, width: 100, height: 45, label: "People" },
    { id: 7, x: 875, y: 15, width: 120, height: 45, label: "VAMP" },
    { id: 12, x: 1005, y: 15, width: 110, height: 45, label: "Deploy" },
    { id: 9, x: 1125, y: 15, width: 100, height: 45, label: "Button 9" },
  ]);
  
  const [isDragging, setIsDragging] = useState<{ type: string; id?: number } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ width: number; height: number } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeploySettingsOpen, setIsDeploySettingsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("modern-dark");
  const [activeWallet, setActiveWallet] = useState<Wallet | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [customNotifications, setCustomNotifications] = useState<CustomNotification[]>([]);
  const [defaultColor, setDefaultColor] = useState("#00FFFF");
  const [chatInput, setChatInput] = useState("");
  
  // Custom Presets state
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [presetTrigger, setPresetTrigger] = useState<PresetTriggerData | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const theme = getTheme(currentTheme);

  // Load presets from localStorage on mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('customPresets');
    if (savedPresets) {
      try {
        setCustomPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.error('Failed to load presets from localStorage:', error);
      }
    }
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    if (customPresets.length > 0) {
      localStorage.setItem('customPresets', JSON.stringify(customPresets));
    }
  }, [customPresets]);

  // Global keybind listener
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Build the pressed keybind string
      const key = e.key.toUpperCase();
      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      const pressedKeybind = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;

      // Find matching preset
      const matchingPreset = customPresets.find(p => p.keybind === pressedKeybind);
      
      if (matchingPreset) {
        // Get selected text
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        
        // Only proceed if there's selected text
        if (!selectedText) {
          console.log('❌ No text selected - keybind ignored');
          return;
        }
        
        // Find the tweet containing this selected text
        let tweetImageUrl: string | undefined = undefined;
        if (matchingPreset.imageType === 'Image in Post') {
          const tweetWithImage = tweets.find(tweet => 
            tweet.text.includes(selectedText) && tweet.imageUrl
          );
          if (tweetWithImage) {
            tweetImageUrl = tweetWithImage.imageUrl;
            console.log('🖼️ Found tweet image:', tweetImageUrl);
          }
        }
        
        e.preventDefault();
        console.log(`🎯 Preset triggered: ${matchingPreset.name} with text: "${selectedText}"`);
        
        // Trigger preset application in Panel1 with selected text and image
        setPresetTrigger({
          namePrefix: matchingPreset.namePrefix,
          nameSuffix: matchingPreset.nameSuffix,
          deployPlatform: matchingPreset.deployPlatform,
          tickerMode: matchingPreset.tickerMode,
          imageType: matchingPreset.imageType,
          selectedText: selectedText,
          tweetImageUrl: tweetImageUrl,
        });
      }
    };

    document.addEventListener('keydown', handleGlobalKeyPress);
    return () => document.removeEventListener('keydown', handleGlobalKeyPress);
  }, [customPresets]);

  // Play notification sound
  const playNotificationSound = (soundName: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // 50% volume
    
    // Different sounds with different frequencies and types
    switch(soundName) {
      case "Beep":
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = "sine";
        break;
      case "Ding":
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator.type = "sine";
        break;
      case "Chime":
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.type = "triangle";
        break;
      case "Coin":
        oscillator.frequency.setValueAtTime(1500, audioContext.currentTime);
        oscillator.type = "square";
        break;
      case "Buzz":
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.type = "sawtooth";
        break;
      case "Harsh Buzz":
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.type = "sawtooth";
        break;
      case "Electric Shock":
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.type = "square";
        break;
      case "Metal Clang":
        oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
        oscillator.type = "square";
        break;
      case "Chainsaw":
        oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
        oscillator.type = "sawtooth";
        break;
      case "Destroyer":
        oscillator.frequency.setValueAtTime(50, audioContext.currentTime);
        oscillator.type = "sawtooth";
        break;
      default:
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.type = "sine";
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  // Fetch real tweet data using our server-side API route
  const fetchTweetData = async (tweetId: string) => {
    try {
      // Use our Next.js API route to avoid CORS issues
      const response = await fetch(`/api/tweet?id=${tweetId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch tweet:', error);
      return null;
    }
  };

  // Parse Twitter URL and create tweet
  const parseTweetUrl = async (url: string) => {
    // Match Twitter/X URL pattern
    const twitterPattern = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/i;
    const match = url.match(twitterPattern);
    
    if (!match) return null;
    
    const username = match[1];
    const tweetId = match[2];
    
    // Fetch real tweet data
    const tweetData = await fetchTweetData(tweetId);
    
    if (!tweetData) {
      return null;
    }
    
    // Only apply highlight if user is tracked in customNotifications
    const customNotif = customNotifications.find(n => 
      n.username.toLowerCase() === tweetData.handle.toLowerCase()
    );
    const highlightColor = customNotif ? customNotif.color : undefined;
    
    // Use timestamp + random to ensure unique keys for duplicate tweets
    const uniqueId = `${tweetId}-${Date.now()}-${Math.random()}`;
    
    const newTweet: Tweet = {
      id: uniqueId,
      username: tweetData.username,
      displayName: tweetData.displayName,
      handle: tweetData.handle,
      verified: tweetData.verified,
      timestamp: tweetData.timestamp,
      text: tweetData.text,
      imageUrl: tweetData.imageUrl,
      profilePic: tweetData.profilePic,
      highlightColor: highlightColor,
    };
    
    return newTweet;
  };

  // Handle chat input submission
  const handleChatSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && chatInput.trim()) {
      const url = chatInput.trim();
      setChatInput(''); // Clear input immediately
      
      try {
        const tweet = await parseTweetUrl(url);
        
        if (tweet) {
          setTweets(prev => [tweet, ...prev]);
          
          // Play sound if notifications are configured
          const customNotif = customNotifications.find(n => 
            n.username.toLowerCase() === tweet.handle.toLowerCase()
          );
          
          if (customNotif && customNotif.sound !== "None (Highlight Only)") {
            // Play the configured sound
            playNotificationSound(customNotif.sound);
          }
        } else {
          // Silently fail - either duplicate or invalid URL
          console.log('Tweet not added - may be duplicate or invalid URL');
        }
      } catch (error) {
        console.error('Error processing tweet:', error);
        // Silently handle errors - no alerts
      }
    }
  };

  const handleButtonMouseDown = (e: React.MouseEvent, buttonId: number) => {
    e.stopPropagation();
    const button = buttons.find(b => b.id === buttonId);
    if (!button) return;
    
    setIsDragging({ type: "button-move", id: buttonId });
    setDragStart({ x: e.clientX - button.x, y: e.clientY - button.y });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, buttonId: number) => {
    e.stopPropagation();
    const button = buttons.find(b => b.id === buttonId);
    if (!button) return;
    
    setIsDragging({ type: "button-resize", id: buttonId });
    setResizeStart({ width: button.width, height: button.height });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleHeaderDividerMouseDown = (type: string) => {
    setIsDragging({ type });
  };

  const handlePanelMouseDown = (type: string) => {
    setIsDragging({ type });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // Handle header height resize
      if (isDragging.type === "header" && containerRef.current) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const mouseY = e.clientY - containerRect.top;
        const percentage = (mouseY / containerRect.height) * 100;
        const newHeaderHeight = Math.max(3, Math.min(50, percentage));
        setHeaderHeight(newHeaderHeight);
        return;
      }

      // Buttons are now locked in place - no dragging or resizing

      // Handle panel resize
      if (containerRef.current) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const percentage = (mouseX / containerRect.width) * 100;

        if (isDragging.type === "panel-0") {
          const newPanel1Width = Math.max(10, Math.min(80, percentage));
          const remainingWidth = 100 - newPanel1Width;
          const panel2Ratio = panel2Width / (panel2Width + panel3Width);
          
          setPanel1Width(newPanel1Width);
          setPanel2Width(remainingWidth * panel2Ratio);
          setPanel3Width(remainingWidth * (1 - panel2Ratio));
        } else if (isDragging.type === "panel-1") {
          const newPanel1And2Width = Math.max(20, Math.min(90, percentage));
          const newPanel2Width = newPanel1And2Width - panel1Width;
          const newPanel3Width = 100 - newPanel1And2Width;
          
          if (newPanel2Width >= 10 && newPanel3Width >= 10) {
            setPanel2Width(newPanel2Width);
            setPanel3Width(newPanel3Width);
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
      setDragStart(null);
      setResizeStart(null);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, resizeStart, buttons, panel1Width, panel2Width, panel3Width]);

  return (
    <div ref={containerRef} className="flex flex-col h-screen w-full overflow-hidden select-none">
      {/* Header with draggable/resizable buttons */}
      <div className="w-full relative" style={{ height: `${headerHeight}%` }}>
        <div ref={headerRef} className={`relative h-full w-full ${theme.header} overflow-hidden`}>
          {buttons.map((button) => (
            <div
              key={button.id}
              className="absolute group"
              style={{
                left: `${button.x}px`,
                top: `${button.y}px`,
                width: `${button.width}px`,
                height: `${button.height}px`,
              }}
            >
              {button.id === 5 ? (
                /* Button 5: Input Field */
                <input
                  type="text"
                  placeholder="Paste Twitter URL here..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatSubmit}
                  className="w-full h-full bg-slate-700 hover:bg-slate-600 text-white px-3 text-xs rounded-xl border-2 border-slate-500 focus:outline-none focus:border-slate-400 placeholder-gray-400"
                />
              ) : (
                <button
                  onClick={() => {
                    if (button.id === 3) setIsSettingsOpen(true);
                    if (button.id === 9) setIsDeploySettingsOpen(true);
                  }}
                  className={`w-full h-full ${button.id === 12 ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'} text-white font-medium flex items-center justify-center gap-1.5 rounded-xl border-2 ${button.id === 12 ? 'border-green-500' : 'border-slate-500'} shadow-md transition-all hover:shadow-lg ${button.id === 12 ? 'hover:border-green-400' : 'hover:border-slate-400'} cursor-pointer`}
                >
                  {button.id === 1 && <Home size={14} />}
                  {button.id === 10 && <><span className="text-sm">💾</span><span className="text-xs">Saved</span></>}
                  {button.id === 11 && <><span className="text-sm">🔍</span><span className="text-xs">Google</span></>}
                  {button.id === 2 && <><Filter size={14} /><span className="text-xs">Filters</span></>}
                  {button.id === 3 && <Settings size={14} />}
                  {button.id === 6 && <><span className="text-sm">👥</span><span className="text-xs">0</span></>}
                  {button.id === 7 && <><span className="text-sm">🧛</span><span className="text-xs">VAMP</span></>}
                  {button.id === 12 && <><span className="text-sm">🚀</span><span className="text-xs font-bold">DEPLOY</span></>}
                  {button.id === 9 && <span className="text-sm">📚</span>}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Header resize divider */}
      <div
        className={`w-full h-2 ${theme.headerDivider} hover:bg-gray-500 cursor-row-resize transition-colors ${
          isDragging?.type === "header" ? "bg-gray-600" : ""
        }`}
        onMouseDown={() => handleHeaderDividerMouseDown("header")}
      />

      {/* Main panels */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Panel 1 */}
        <div
          className="h-full"
          style={{ width: `${panel1Width}%` }}
        >
          <Panel1 
            themeId={currentTheme} 
            activeWallet={activeWallet}
            presetTrigger={presetTrigger}
            onPresetApplied={() => setPresetTrigger(null)}
          />
        </div>

        {/* Divider 1 */}
        <div
          className={`w-2 h-full bg-gray-300 hover:bg-gray-400 cursor-col-resize transition-colors ${
            isDragging?.type === "panel-0" ? "bg-gray-500" : ""
          }`}
          onMouseDown={() => handlePanelMouseDown("panel-0")}
        />

        {/* Panel 2 - Placeholder for future coin suggestions */}
        <div
          className={`h-full ${theme.panel1ContentBg} transition-colors`}
          style={{ width: `${panel2Width}%` }}
        >
          {/* Blank placeholder - coin suggestions to be implemented */}
        </div>

        {/* Divider 2 */}
        <div
          className={`w-2 h-full bg-gray-300 hover:bg-gray-400 cursor-col-resize transition-colors ${
            isDragging?.type === "panel-1" ? "bg-gray-500" : ""
          }`}
          onMouseDown={() => handlePanelMouseDown("panel-1")}
        />

        {/* Panel 3 */}
        <div
          className="h-full"
          style={{ width: `${panel3Width}%` }}
        >
          <Panel3 
            themeId={currentTheme}
            tweets={tweets}
            customNotifications={customNotifications}
            defaultColor={defaultColor}
          />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        customNotifications={customNotifications}
        onCustomNotificationsChange={setCustomNotifications}
        defaultColor={defaultColor}
        onDefaultColorChange={setDefaultColor}
      />

      {/* Deploy Settings Modal */}
      <DeploySettingsModal
        isOpen={isDeploySettingsOpen}
        onClose={() => setIsDeploySettingsOpen(false)}
        onWalletChange={setActiveWallet}
        presets={customPresets}
        onPresetsChange={setCustomPresets}
      />
    </div>
  );
}
