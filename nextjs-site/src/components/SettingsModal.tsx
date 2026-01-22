"use client";

import { X, Play, Upload, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import ThemeSelector from "./ThemeSelector";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  customNotifications?: CustomNotification[];
  onCustomNotificationsChange?: (notifications: CustomNotification[]) => void;
  defaultColor?: string;
  onDefaultColorChange?: (color: string) => void;
}

interface CustomSound {
  id: string;
  name: string;
  file: File;
  url: string;
  size: number;
}

interface CustomNotification {
  id: string;
  username: string;
  color: string;
  sound: string;
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  currentTheme, 
  onThemeChange,
  customNotifications: propsCustomNotifications = [],
  onCustomNotificationsChange,
  defaultColor: propsDefaultColor = "#00FFFF",
  onDefaultColorChange
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("appearance");
  const [cardWidth, setCardWidth] = useState(2000);
  const [cardScale, setCardScale] = useState(100);
  const [pauseOnHover, setPauseOnHover] = useState(true);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Sounds tab states
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [volume, setVolume] = useState(50);
  const [defaultSound, setDefaultSound] = useState("Beep");
  const [showSoundSelector, setShowSoundSelector] = useState(false);
  const [customSounds, setCustomSounds] = useState<CustomSound[]>([]);
  const [showCustomSounds, setShowCustomSounds] = useState(false);
  const [defaultColor, setDefaultColor] = useState(propsDefaultColor);
  const [showColorSelector, setShowColorSelector] = useState(false);
  const [notificationMode, setNotificationMode] = useState<"all" | "specific">("all");
  const [showAddAccount, setShowAddAccount] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use props for custom notifications
  const customNotifications = propsCustomNotifications;

  if (!isOpen) return null;
  
  // Sound list
  const soundOptions = [
    "Beep", "Ding", "Chime", "Coin", "Buzz", "Harsh Buzz",
    "Electric Shock", "Metal Clang", "Chainsaw", "Destroyer",
    "None (Highlight Only)", "UX1", "UX2", "UX3", "UX4", "UX5", "UX6", "uxento"
  ];

  // Color palette
  const colorPalette = [
    "#FF6B6B", "#FFA500", "#FFFF00", "#00FF00", "#5EEAD4",
    "#00FFFF", "#6B9BFF", "#A78BFA", "#FF00FF", "#FFB3D9",
    "#FFFFFF", "#FFD700"
  ];

  // Play sound preview
  const playSound = (soundName: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(volume / 100, audioContext.currentTime);
    
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

  // Handle custom sound upload
  const handleCustomSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "audio/mpeg" || file.type === "audio/wav") {
        const newSound: CustomSound = {
          id: Date.now().toString(),
          name: file.name.replace(/\.(mp3|wav)$/, ""),
          file: file,
          url: URL.createObjectURL(file),
          size: file.size
        };
        setCustomSounds([...customSounds, newSound]);
      }
    }
  };

  // Delete custom sound
  const deleteCustomSound = (id: string) => {
    setCustomSounds(customSounds.filter(s => s.id !== id));
  };

  // Add custom notification
  const addCustomNotification = (username: string, color: string, sound: string) => {
    const newNotification: CustomNotification = {
      id: Date.now().toString(),
      username: username.startsWith("@") ? username : `@${username}`,
      color,
      sound
    };
    if (onCustomNotificationsChange) {
      onCustomNotificationsChange([...customNotifications, newNotification]);
    }
    setShowAddAccount(false);
  };

  // Delete custom notification
  const deleteCustomNotification = (id: string) => {
    if (onCustomNotificationsChange) {
      onCustomNotificationsChange(customNotifications.filter(n => n.id !== id));
    }
  };
  
  const getThemeName = (themeId: string) => {
    const themeNames: Record<string, string> = {
      "default": "Default",
      "dark": "Dark",
      "modern-dark": "Modern Dark",
      "midnight-blue": "Midnight Blue",
      "dusk": "Dusk",
      "sunset": "Sunset",
      "purple": "Purple",
      "forest": "Forest",
      "crimson": "Crimson",
      "cyan": "Cyan",
      "gold": "Gold",
      "orange": "Orange",
      "pink": "Pink",
      "mint": "Mint",
      "lavender": "Lavender"
    };
    return themeNames[themeId] || "Modern Dark";
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pt-4 border-b border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === "appearance"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Appearance
          </button>
          <button
            onClick={() => setActiveTab("sounds")}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === "sounds"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            Sounds
          </button>
          <button
            onClick={() => setActiveTab("contracts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === "contracts"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            Contracts
          </button>
          <button
            onClick={() => setActiveTab("highlights")}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === "highlights"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Highlights
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === "advanced"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Advanced
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-white text-xl font-semibold mb-6">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Appearance
              </div>

              {/* Color Theme */}
              <div>
                <h3 className="text-white text-center font-semibold mb-4">Color Theme:</h3>
                <button 
                  onClick={() => setShowThemeSelector(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded border-2 border-gray-600 bg-gray-900"></div>
                    <span>{getThemeName(currentTheme)}</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Image Layout */}
              <div>
                <div className="flex items-center gap-2 text-white mb-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  <span className="font-semibold">Image Layout:</span>
                </div>
                <select className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-gray-600">
                  <option>Grid Layout</option>
                  <option>List Layout</option>
                  <option>Compact Layout</option>
                </select>
              </div>

              {/* Card Width */}
              <div>
                <h3 className="text-white text-center font-semibold mb-3">Card Width: {cardWidth}px</h3>
                <input
                  type="range"
                  min="500"
                  max="1200"
                  value={cardWidth}
                  onChange={(e) => setCardWidth(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>500px</span>
                  <span>850px</span>
                  <span>1200px</span>
                </div>
              </div>

              {/* Card Scale */}
              <div>
                <h3 className="text-white text-center font-semibold mb-3">Card Scale: {cardScale}%</h3>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={cardScale}
                  onChange={(e) => setCardScale(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>50%</span>
                  <span>100%</span>
                  <span>150%</span>
                </div>
              </div>

              {/* Pause Updates */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={pauseOnHover}
                  onChange={(e) => setPauseOnHover(e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <div className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Pause updates on hover</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sounds" && (
            <div className="text-white space-y-6">
              {/* Header */}
              <div className="flex items-center gap-2 text-xl font-semibold mb-6">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                Sounds & Notifications
              </div>

              {/* Enable Notification Sounds */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={soundsEnabled}
                  onChange={(e) => setSoundsEnabled(e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <span className="text-white font-medium">Enable notification sounds</span>
              </div>

              {/* Volume Slider */}
              <div>
                <h3 className="text-white text-center font-semibold mb-3">Volume: {volume}%</h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={!soundsEnabled}
                />
              </div>

              {/* Default Sound */}
              <div>
                <h3 className="text-white text-center font-semibold mb-3">Default Sound:</h3>
                <button 
                  onClick={() => setShowSoundSelector(true)}
                  disabled={!soundsEnabled}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Play size={18} />
                    <span>{defaultSound}</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Custom Sounds */}
              <div>
                <h3 className="text-white text-center font-semibold mb-3">Custom Sounds:</h3>
                <button 
                  onClick={() => setShowCustomSounds(true)}
                  disabled={!soundsEnabled}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                    <span>Manage Custom Sounds</span>
                    {customSounds.length > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {customSounds.length}
                      </span>
                    )}
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Default Highlight Color */}
              <div>
                <h3 className="text-white text-center font-semibold mb-3">Default Highlight Color:</h3>
                <button 
                  onClick={() => setShowColorSelector(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg border-2 border-white/30" 
                      style={{ backgroundColor: defaultColor }}
                    ></div>
                    <span>{defaultColor === "#00FFFF" ? "Cyan" : "Custom"}</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Notification Mode */}
              <div>
                <h3 className="text-white text-center font-semibold mb-3">Notification Mode:</h3>
                <select 
                  value={notificationMode}
                  onChange={(e) => setNotificationMode(e.target.value as "all" | "specific")}
                  disabled={!soundsEnabled}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">All Accounts</option>
                  <option value="specific">Specific Accounts Only</option>
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  {notificationMode === "all" 
                    ? "Notifies for everyone (with custom overrides below). Specific: Only accounts in your list."
                    : "Only notifies for accounts in your custom notifications list below."}
                </p>
              </div>

              {/* Custom Notifications */}
              <div className="border-t border-gray-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-white font-semibold">Custom Notifications</h3>
                  </div>
                  <button 
                    onClick={() => setShowAddAccount(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <span className="text-lg">+</span>
                    <span>Add</span>
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full px-4 py-2 pl-10 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-gray-600 text-sm"
                  />
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Custom Notifications List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {customNotifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No custom notifications yet. Click "Add" to create one.
                    </div>
                  ) : (
                    customNotifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-6 h-6 rounded border-2 border-white/30 flex-shrink-0" 
                            style={{ backgroundColor: notification.color }}
                          ></div>
                          <span className="text-white font-medium">{notification.username}</span>
                          <span className="text-gray-400 text-sm">• {notification.sound}</span>
                        </div>
                        <button 
                          onClick={() => deleteCustomNotification(notification.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "contracts" && (
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-4">Contract Settings</h3>
              <p className="text-gray-400">Contract settings will be configured here.</p>
            </div>
          )}

          {activeTab === "highlights" && (
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-4">Highlight Settings</h3>
              <p className="text-gray-400">Highlight settings will be configured here.</p>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-4">Advanced Settings</h3>
              <p className="text-gray-400">Advanced settings will be configured here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Theme Selector Modal */}
      <ThemeSelector
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
        currentTheme={currentTheme}
        onSelectTheme={onThemeChange}
      />

      {/* Sound Selector Modal */}
      {showSoundSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-gray-900 rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Play size={20} className="text-blue-500" />
                <h3 className="text-lg font-bold text-white">Select Default Sound</h3>
              </div>
              <button onClick={() => setShowSoundSelector(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-2">
                {soundOptions.map((sound) => (
                  <div
                    key={sound}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                      defaultSound === sound
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800 border-gray-700 text-white hover:bg-gray-750"
                    }`}
                  >
                    <button
                      onClick={() => playSound(sound)}
                      className="text-white hover:text-blue-300 transition-colors p-1"
                      title="Play sound"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => setDefaultSound(sound)}
                      className="flex-1 text-left text-sm font-medium"
                    >
                      {sound}
                    </button>
                    {defaultSound === sound && (
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Sounds Modal */}
      {showCustomSounds && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-gray-900 rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
                <h3 className="text-lg font-bold text-white">Custom Sounds</h3>
              </div>
              <button onClick={() => setShowCustomSounds(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mb-4 font-medium"
              >
                <Upload size={18} />
                <span>Upload Custom Sound</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav"
                onChange={handleCustomSoundUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-400 text-center mb-4">
                Supports MP3, WAV, OGG, and other audio formats
              </p>

              <div className="space-y-2">
                {customSounds.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No custom sounds uploaded yet
                  </div>
                ) : (
                  customSounds.map((sound) => (
                    <div
                      key={sound.id}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => {
                            const audio = new Audio(sound.url);
                            audio.volume = volume / 100;
                            audio.play();
                          }}
                          className="text-blue-400 hover:text-blue-300 flex-shrink-0"
                        >
                          <Play size={18} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate text-sm">{sound.name}</div>
                          <div className="text-gray-400 text-xs">
                            {(sound.size / 1024).toFixed(0)} KB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCustomSound(sound.id)}
                        className="text-red-400 hover:text-red-300 flex-shrink-0 ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Color Selector Modal */}
      {showColorSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-gray-900 rounded-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-bold text-white">Select Default Color</h3>
              </div>
              <button onClick={() => setShowColorSelector(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-6 gap-3">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setDefaultColor(color);
                      setShowColorSelector(false);
                    }}
                    className={`w-12 h-12 rounded-xl border-4 transition-all hover:scale-110 ${
                      defaultColor === color ? "border-white" : "border-gray-700"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-gray-900 rounded-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-bold text-white">Add Account</h3>
              </div>
              <button onClick={() => setShowAddAccount(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Twitter Username */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Twitter Username</label>
                <input
                  id="twitter-username"
                  type="text"
                  placeholder="@username"
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Highlight Color */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Highlight Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        (document.getElementById('selected-color') as HTMLInputElement).value = color;
                        document.querySelectorAll('[data-color-btn]').forEach(btn => {
                          btn.classList.remove('ring-4', 'ring-white');
                        });
                        document.querySelector(`[data-color="${color}"]`)?.classList.add('ring-4', 'ring-white');
                      }}
                      data-color-btn
                      data-color={color}
                      className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                        color === "#00FFFF" ? "ring-4 ring-white" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  id="selected-color"
                  type="hidden"
                  defaultValue="#00FFFF"
                />
              </div>

              {/* Notification Sound */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Notification Sound</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {soundOptions.map((sound) => (
                    <button
                      key={sound}
                      onClick={() => {
                        (document.getElementById('selected-sound') as HTMLInputElement).value = sound;
                        playSound(sound);
                        document.querySelectorAll('[data-sound-btn]').forEach(btn => {
                          btn.classList.remove('bg-blue-600', 'border-blue-500');
                          btn.classList.add('bg-gray-800', 'border-gray-700');
                        });
                        document.querySelector(`[data-sound="${sound}"]`)?.classList.remove('bg-gray-800', 'border-gray-700');
                        document.querySelector(`[data-sound="${sound}"]`)?.classList.add('bg-blue-600', 'border-blue-500');
                      }}
                      data-sound-btn
                      data-sound={sound}
                      className={`flex items-center justify-center px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                        sound === "Beep" ? "bg-blue-600 border-blue-500" : "bg-gray-800 border-gray-700"
                      } text-white hover:bg-gray-750`}
                    >
                      {sound}
                    </button>
                  ))}
                </div>
                <input
                  id="selected-sound"
                  type="hidden"
                  defaultValue="Beep"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddAccount(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const username = (document.getElementById('twitter-username') as HTMLInputElement).value;
                    const color = (document.getElementById('selected-color') as HTMLInputElement).value;
                    const sound = (document.getElementById('selected-sound') as HTMLInputElement).value;
                    
                    if (username.trim()) {
                      addCustomNotification(username, color, sound);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Add Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
