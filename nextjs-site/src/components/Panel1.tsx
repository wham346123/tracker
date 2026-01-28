"use client";

import { Trash2 } from "lucide-react";
import { getTheme } from "@/utils/themes";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { getDeploymentService, CreateTokenParams } from "@/services/tokenApi";
import Toast from "./Toast";
import { generatePresetImage } from "@/utils/imageGenerator";

interface Wallet {
  id: string;
  type: 'solana' | 'evm';
  publicKey: string;
  privateKey: string;
  compositeKey: string;
  balance: number;
  isActive: boolean;
}

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface PresetTriggerData {
  namePrefix: string;
  nameSuffix: string;
  deployPlatform: string;
  tickerMode: string;
  imageType: string;
  selectedText?: string;
  tweetImageUrl?: string;
  tweetLink?: string;
  customImageUrl?: string;
}

interface Tweet {
  id: string;
  twitterStatusId?: string;
  username: string;
  displayName: string;
  handle: string;
  verified: boolean;
  timestamp: string;
  text: string;
  imageUrl?: string;
  profilePic: string;
  highlightColor?: string;
  media?: Array<{ type: 'image' | 'video' | 'gif'; url: string }>;
}

interface Panel1Props {
  themeId: string;
  activeWallet: Wallet | null;
  presetTrigger?: PresetTriggerData | null;
  onPresetApplied?: () => void;
  deployedImageUrl?: string | null;
  deployedTwitterUrl?: string | null;
  onImageDeployed?: () => void;
  onTwitterDeployed?: () => void;
  clearTrigger?: number; // When this changes, silently clear all fields
  tweets?: Tweet[]; // All tweets for auto-fill on copy
  testMode?: boolean; // Test mode - shows preview instead of deploying
}

export default function Panel1({ themeId, activeWallet, presetTrigger, onPresetApplied, deployedImageUrl, deployedTwitterUrl, onImageDeployed, onTwitterDeployed, clearTrigger, tweets = [], testMode = false }: Panel1Props) {
  const theme = getTheme(themeId);
  
  const logos = [
    { src: '/images/pump-logo.png', alt: 'Pump' },
    { src: '/images/bonk-logo.png', alt: 'Bonk' },
    { src: '/images/usd1-logo.png', alt: 'USD1' },
    { src: '/images/bags-logo.png', alt: 'Bags' },
    { src: '/images/bnb-logo.png', alt: 'BNB' },
    { src: '/images/jupiter-logo.png', alt: 'Jupiter' }
  ];
  
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [platformValues, setPlatformValues] = useState([0.001, 0.001, 0.001, 0.001, 0.001, 0.001]);
  const [isDragging, setIsDragging] = useState(false);
  const [buyAmount, setBuyAmount] = useState(0.01);
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedPlatformIndex, setSelectedPlatformIndex] = useState(0); // Which platform icon is selected
  const [selectedImageMode, setSelectedImageMode] = useState<"letter" | "sol" | "ascii">("letter");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [autoFillOnCopy, setAutoFillOnCopy] = useState(true);
  const [autoGenerateTicker, setAutoGenerateTicker] = useState(true);
  const [presetAmounts, setPresetAmounts] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isEditingPresets, setIsEditingPresets] = useState(false);
  const [tempPresets, setTempPresets] = useState<string[]>(['1', '2', '3', '4', '5']);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    name: string;
    symbol: string;
    image: string;
    platform: string;
    amount: number;
    website: string;
    twitter: string;
    imageMode: string;
  } | null>(null);
  
  const platformNames = ["pump", "bonk", "usd1", "bags", "bnb", "jupiter"];
  
  // Map platform index to deployment platform type
  const getPlatformType = (index: number): "pump" | "bonk" | "usd1" => {
    const mapping: { [key: number]: "pump" | "bonk" | "usd1" } = {
      0: "pump",   // Pump
      1: "bonk",   // Raydium/Bonk
      2: "usd1",   // USD1
      3: "pump",   // Bags -> pump
      4: "bonk",   // BNB -> bonk
      5: "usd1",   // Jupiter -> usd1
    };
    return mapping[index] || "pump";
  };
  
  const selectedPlatform = getPlatformType(selectedPlatformIndex);
  const deploymentService = getDeploymentService();
  
  // Toast helper functions - wrapped in useCallback
  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  // Clear all form fields (except buy amount - that persists)
  const handleClear = () => {
    setName("");
    setSymbol("");
    setWebsite("");
    setTwitter("");
    setUploadedImage(null);
    // Don't reset buyAmount - it persists
    showToast("Form cleared!", "info");
  };
  
  // Auto-sync name to symbol with smart abbreviation (only when autoGenerateTicker is enabled)
  const handleNameChange = (value: string) => {
    setName(value);
    
    // Only auto-generate ticker if the checkbox is enabled
    if (autoGenerateTicker) {
      if (value.length <= 13) {
        setSymbol(value.toUpperCase());
      } else {
        // Smart abbreviation: take first letters of words or compress
        const words = value.trim().split(/\s+/);
        if (words.length > 1) {
          // Use first letter of each word
          const abbreviated = words.map(w => w[0]).join('').toUpperCase().slice(0, 13);
          setSymbol(abbreviated);
        } else {
          // Single long word - take first 13 chars
          setSymbol(value.slice(0, 13).toUpperCase());
        }
      }
    }
  };
  
  // Handle drag and drop for images
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };
  
  // Handle platform value changes
  const handlePlatformValueChange = (index: number, value: string) => {
    const newValues = [...platformValues];
    newValues[index] = parseFloat(value) || 0;
    setPlatformValues(newValues);
  };

  // Generate preview for test mode
  const generatePreview = useCallback(async (amount: number) => {
    if (!name || !symbol) {
      showToast("Please fill in Token Name and Symbol!", "error");
      return;
    }

    setIsDeploying(true);
    
    try {
      // Generate image if none uploaded
      let imageToUse = uploadedImage;
      if (!imageToUse) {
        const imageTypeMap = {
          'letter': 'Letter Image',
          'sol': 'SOL ASCII (Gradient)',
          'ascii': 'ASCII Art'
        };
        imageToUse = await generatePresetImage(
          imageTypeMap[selectedImageMode],
          symbol.trim(),
          undefined,
          selectedPlatform === 'pump' ? 'Pump.fun' : undefined
        );
      }

      const platformDisplayNames: { [key: string]: string } = {
        'pump': 'Pump.fun',
        'bonk': 'Raydium/Bonk',
        'usd1': 'USD1/Jupiter'
      };

      setPreviewData({
        name: name.trim(),
        symbol: symbol.trim(),
        image: imageToUse,
        platform: platformDisplayNames[selectedPlatform] || selectedPlatform,
        amount: amount,
        website: website.trim(),
        twitter: twitter.trim(),
        imageMode: selectedImageMode.toUpperCase()
      });
      setShowPreview(true);
    } catch (error) {
      showToast(`Failed to generate preview: ${error}`, "error");
    }
    
    setIsDeploying(false);
  }, [name, symbol, uploadedImage, selectedImageMode, selectedPlatform, website, twitter, showToast]);
  
  // Deploy token function - wrapped in useCallback for global Enter handler
  const handleDeploy = useCallback(async () => {
    // Test mode - show preview instead of deploying
    if (testMode) {
      await generatePreview(buyAmount);
      return;
    }

    // Validation
    if (!activeWallet) {
      showToast("Please import a wallet first! Click the Stack button (📚) in the top right.", "error");
      return;
    }
    
    if (!name || !symbol) {
      showToast("Please fill in Token Name and Symbol!", "error");
      return;
    }
    
    if (buyAmount <= 0) {
      showToast("Buy amount must be greater than 0!", "error");
      return;
    }
    
    setIsDeploying(true);
    
    try {
      // Generate image if none uploaded, using selected image mode
      let imageToUse = uploadedImage;
      if (!imageToUse) {
        console.log(`🎨 Generating ${selectedImageMode} image for: ${symbol}`);
        const imageTypeMap = {
          'letter': 'Letter Image',
          'sol': 'SOL ASCII (Gradient)',
          'ascii': 'ASCII Art'
        };
        try {
          imageToUse = await generatePresetImage(
            imageTypeMap[selectedImageMode],
            symbol.trim(),
            undefined,
            selectedPlatform === 'pump' ? 'Pump.fun' : undefined
          );
          console.log('✅ Image generated successfully!');
        } catch (imgError) {
          showToast(`Failed to generate image: ${imgError}`, "error");
          setIsDeploying(false);
          return;
        }
      }
      
      await deploymentService.connect();
      
      deploymentService.createToken(
        {
          platform: selectedPlatform,
          name: name.trim(),
          symbol: symbol.trim(),
          image: imageToUse,
          amount: buyAmount,
          wallets: [activeWallet.compositeKey],
          website: website.trim() || undefined,
          twitter: twitter.trim() || undefined,
        },
        (data) => {
          // Success! Show single toast with ticker
          showToast(
            `Token $${symbol.trim()} Created Successfully!`,
            "success"
          );
          setIsDeploying(false);
          
          // DON'T clear form - keep data for next deploy
        },
        (error) => {
          showToast(`Deployment Failed: ${error}`, "error");
          setIsDeploying(false);
        }
      );
    } catch (error) {
      showToast(`Failed to connect to Token API: ${error}`, "error");
      setIsDeploying(false);
    }
  }, [activeWallet, name, symbol, uploadedImage, buyAmount, selectedPlatform, selectedImageMode, website, twitter, deploymentService, showToast, testMode, generatePreview]);

  // Deploy with a specific amount (for preset buttons) - doesn't change the default buyAmount
  const handleDeployWithAmount = useCallback(async (amount: number) => {
    // Test mode - show preview instead of deploying
    if (testMode) {
      await generatePreview(amount);
      return;
    }

    // Validation
    if (!activeWallet) {
      showToast("Please import a wallet first! Click the Stack button (📚) in the top right.", "error");
      return;
    }
    
    if (!name || !symbol) {
      showToast("Please fill in Token Name and Symbol!", "error");
      return;
    }
    
    setIsDeploying(true);
    
    try {
      // Generate image if none uploaded, using selected image mode
      let imageToUse = uploadedImage;
      if (!imageToUse) {
        console.log(`🎨 Generating ${selectedImageMode} image for: ${symbol}`);
        const imageTypeMap = {
          'letter': 'Letter Image',
          'sol': 'SOL ASCII (Gradient)',
          'ascii': 'ASCII Art'
        };
        try {
          imageToUse = await generatePresetImage(
            imageTypeMap[selectedImageMode],
            symbol.trim(),
            undefined,
            selectedPlatform === 'pump' ? 'Pump.fun' : undefined
          );
          console.log('✅ Image generated successfully!');
        } catch (imgError) {
          showToast(`Failed to generate image: ${imgError}`, "error");
          setIsDeploying(false);
          return;
        }
      }
      
      await deploymentService.connect();
      
      deploymentService.createToken(
        {
          platform: selectedPlatform,
          name: name.trim(),
          symbol: symbol.trim(),
          image: imageToUse,
          amount: amount, // Use the passed amount, not buyAmount state
          wallets: [activeWallet.compositeKey],
          website: website.trim() || undefined,
          twitter: twitter.trim() || undefined,
        },
        (data) => {
          showToast(
            `Token $${symbol.trim()} deployed with ${amount} SOL!`,
            "success"
          );
          setIsDeploying(false);
        },
        (error) => {
          showToast(`Deployment Failed: ${error}`, "error");
          setIsDeploying(false);
        }
      );
    } catch (error) {
      showToast(`Failed to connect to Token API: ${error}`, "error");
      setIsDeploying(false);
    }
  }, [activeWallet, name, symbol, uploadedImage, selectedPlatform, selectedImageMode, website, twitter, deploymentService, showToast, testMode, generatePreview]);
  
  // Handle Enter key to deploy
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isDeploying) {
      e.preventDefault();
      handleDeploy();
    }
  };
  
  // Center crop image function
  const centerCropImage = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      // Don't set crossOrigin to avoid CORS issues
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Could not get canvas context');
          return;
        }
        
        // Determine the size of the square crop (use the smaller dimension)
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        
        // Calculate center crop coordinates
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        
        // Draw the center-cropped image
        ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
        
        // Convert to data URL
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = (error) => {
        console.error('Image load error:', error);
        reject('Failed to load image');
      };
      
      img.src = imageUrl;
    });
  };
  
  // Generate symbol based on Ticker Mode
  const generateSymbol = (text: string, tickerMode: string): string => {
    const cleanText = text.trim();
    
    switch (tickerMode) {
      case 'Selected Text':
        // Use the selected text as-is (up to 13 chars)
        return cleanText.slice(0, 13).toUpperCase();
      
      case 'Abbreviation':
        // Take first letter of each word
        const words = cleanText.split(/\s+/);
        if (words.length > 1) {
          return words.map(w => w[0]).join('').toUpperCase().slice(0, 13);
        }
        return cleanText.slice(0, 13).toUpperCase();
      
      case 'First Word':
        // Use only the first word
        const firstWord = cleanText.split(/\s+/)[0];
        return firstWord.slice(0, 13).toUpperCase();
      
      case 'Custom':
        // For custom, just use first 4 chars + random 3 digits
        const base = cleanText.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
        const random = Math.floor(100 + Math.random() * 900);
        return `${base}${random}`;
      
      default:
        return cleanText.slice(0, 13).toUpperCase();
    }
  };
  
  // Load preset amounts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('deployPresetAmounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 5) {
          setPresetAmounts(parsed);
          setTempPresets(parsed.map(String));
        }
      } catch (e) {
        console.log('Failed to load preset amounts');
      }
    }
  }, []);

  // Handle clear trigger - silently clear all fields (no toast, buy amount persists)
  useEffect(() => {
    if (clearTrigger && clearTrigger > 0) {
      console.log('🧹 Silent clear triggered');
      setName("");
      setSymbol("");
      setWebsite("");
      setTwitter("");
      setUploadedImage(null);
      // Don't reset buyAmount - it persists
    }
  }, [clearTrigger]);
  
  // Handle deployed image from Panel3
  useEffect(() => {
    if (deployedImageUrl && onImageDeployed) {
      console.log('🖼️ Deploying image from tweet:', deployedImageUrl);
      setUploadedImage(deployedImageUrl);
      onImageDeployed();
    }
  }, [deployedImageUrl, onImageDeployed]);
  
  // Handle deployed Twitter URL from Panel3 - 0MS DELAY (synchronous)
  useEffect(() => {
    if (deployedTwitterUrl && onTwitterDeployed) {
      console.log('🔗 Deploying Twitter URL:', deployedTwitterUrl);
      setTwitter(deployedTwitterUrl);
      console.log('✅ Twitter field filled via React props');
      onTwitterDeployed(); // Clear the state immediately
    }
  }, [deployedTwitterUrl, onTwitterDeployed]);
  
  // Auto-fill on copy - listen for clipboard copy events and find tweet context
  useEffect(() => {
    if (!autoFillOnCopy) return;
    
    const handleCopy = (e: ClipboardEvent) => {
      // Get the selected text directly from the selection (works in all browsers)
      const selection = window.getSelection();
      const text = selection?.toString();
      
      if (text && text.trim()) {
        const trimmedText = text.trim();
            console.log('📋 Auto-fill on copy:', trimmedText);
            
            // Set the name field
            setName(trimmedText);
            
            // Auto-generate ticker if enabled
            if (autoGenerateTicker) {
              let ticker: string;
              if (trimmedText.length <= 13) {
                ticker = trimmedText.toUpperCase();
              } else {
                // Smart abbreviation for longer text
                const words = trimmedText.split(/\s+/);
                if (words.length > 1) {
                  // Use first letter of each word
                  ticker = words.map(w => w[0]).join('').toUpperCase().slice(0, 13);
                } else {
                  // Single long word - take first 13 chars
                  ticker = trimmedText.slice(0, 13).toUpperCase();
                }
              }
              setSymbol(ticker);
              console.log('🎫 Auto-generated ticker:', ticker);
            }
            
            // Helper function to check if text exists in a tweet (including nested tweets)
            const textMatchesTweet = (tweet: Tweet, searchText: string): boolean => {
              const lowerSearch = searchText.toLowerCase();
              // Check main tweet text
              if (tweet.text && tweet.text.toLowerCase().includes(lowerSearch)) return true;
              // Check quoted tweet text (for retweets/quotes where main text might be empty)
              if (tweet.quotedTweet?.text && tweet.quotedTweet.text.toLowerCase().includes(lowerSearch)) return true;
              // Check replied-to tweet text
              if (tweet.repliedToTweet?.text && tweet.repliedToTweet.text.toLowerCase().includes(lowerSearch)) return true;
              return false;
            };
            
            // Helper function to extract the best image from a tweet (including nested tweets)
            const getBestImage = (tweet: Tweet): string | undefined => {
              // Priority 1: Main tweet media
              let imageUrl = tweet.media?.find(m => m.type === 'image' || m.type === 'gif')?.url;
              if (imageUrl) return imageUrl;
              
              // Priority 2: Main tweet imageUrl
              if (tweet.imageUrl) return tweet.imageUrl;
              
              // Priority 3: Quoted tweet media (for retweets)
              imageUrl = tweet.quotedTweet?.media?.find(m => m.type === 'image' || m.type === 'gif')?.url;
              if (imageUrl) return imageUrl;
              
              // Priority 4: Quoted tweet imageUrl
              if (tweet.quotedTweet?.imageUrl) return tweet.quotedTweet.imageUrl;
              
              // Priority 5: Replied-to tweet media
              imageUrl = tweet.repliedToTweet?.media?.find(m => m.type === 'image' || m.type === 'gif')?.url;
              if (imageUrl) return imageUrl;
              
              // Priority 6: Replied-to tweet imageUrl
              if (tweet.repliedToTweet?.imageUrl) return tweet.repliedToTweet.imageUrl;
              
              // Priority 7: Profile picture as fallback
              if (tweet.profilePic) return tweet.profilePic;
              
              return undefined;
            };
            
            // Find the tweet that contains this text (search main text, quoted text, and replied text)
            const matchingTweet = tweets.find(tweet => textMatchesTweet(tweet, trimmedText));
            
            if (matchingTweet) {
              console.log('🐦 Found matching tweet:', matchingTweet.id);
              
              // Fill Twitter URL
              const twitterUrl = matchingTweet.twitterStatusId 
                ? `https://twitter.com/${matchingTweet.username}/status/${matchingTweet.twitterStatusId}`
                : `https://twitter.com/${matchingTweet.username}`;
              setTwitter(twitterUrl);
              console.log('🔗 Auto-filled Twitter URL:', twitterUrl);
              
              // Fill Image using enhanced extraction
              const imageUrl = getBestImage(matchingTweet);
              
              if (imageUrl) {
                setUploadedImage(imageUrl);
                console.log('🖼️ Auto-filled image:', imageUrl);
              }
            } else {
              console.log('⚠️ No matching tweet found for copied text');
            }
          }
    };
    
    // Listen for copy events
    document.addEventListener('copy', handleCopy as EventListener);
    
    return () => {
      document.removeEventListener('copy', handleCopy as EventListener);
    };
  }, [autoFillOnCopy, autoGenerateTicker, tweets]);

  // Double-click to auto-fill - same logic as copy but triggered on double-click
  useEffect(() => {
    if (!autoFillOnCopy) return;
    
    const handleDoubleClick = () => {
      // Small delay to let the browser select the word
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString();
        
        if (text && text.trim()) {
          const trimmedText = text.trim();
          console.log('👆👆 Double-click auto-fill:', trimmedText);
          
          // Set the name field
          setName(trimmedText);
          
          // Auto-generate ticker if enabled
          if (autoGenerateTicker) {
            let ticker: string;
            if (trimmedText.length <= 13) {
              ticker = trimmedText.toUpperCase();
            } else {
              const words = trimmedText.split(/\s+/);
              if (words.length > 1) {
                ticker = words.map(w => w[0]).join('').toUpperCase().slice(0, 13);
              } else {
                ticker = trimmedText.slice(0, 13).toUpperCase();
              }
            }
            setSymbol(ticker);
            console.log('🎫 Auto-generated ticker:', ticker);
          }
          
          // Helper function to check if text exists in a tweet
          const textMatchesTweet = (tweet: Tweet, searchText: string): boolean => {
            const lowerSearch = searchText.toLowerCase();
            if (tweet.text && tweet.text.toLowerCase().includes(lowerSearch)) return true;
            if (tweet.quotedTweet?.text && tweet.quotedTweet.text.toLowerCase().includes(lowerSearch)) return true;
            if (tweet.repliedToTweet?.text && tweet.repliedToTweet.text.toLowerCase().includes(lowerSearch)) return true;
            return false;
          };
          
          // Helper function to extract the best image
          const getBestImage = (tweet: Tweet): string | undefined => {
            let imageUrl = tweet.media?.find(m => m.type === 'image' || m.type === 'gif')?.url;
            if (imageUrl) return imageUrl;
            if (tweet.imageUrl) return tweet.imageUrl;
            imageUrl = tweet.quotedTweet?.media?.find(m => m.type === 'image' || m.type === 'gif')?.url;
            if (imageUrl) return imageUrl;
            if (tweet.quotedTweet?.imageUrl) return tweet.quotedTweet.imageUrl;
            imageUrl = tweet.repliedToTweet?.media?.find(m => m.type === 'image' || m.type === 'gif')?.url;
            if (imageUrl) return imageUrl;
            if (tweet.repliedToTweet?.imageUrl) return tweet.repliedToTweet.imageUrl;
            if (tweet.profilePic) return tweet.profilePic;
            return undefined;
          };
          
          // Find the matching tweet
          const matchingTweet = tweets.find(tweet => textMatchesTweet(tweet, trimmedText));
          
          if (matchingTweet) {
            console.log('🐦 Found matching tweet:', matchingTweet.id);
            
            // Fill Twitter URL
            const twitterUrl = matchingTweet.twitterStatusId 
              ? `https://twitter.com/${matchingTweet.username}/status/${matchingTweet.twitterStatusId}`
              : `https://twitter.com/${matchingTweet.username}`;
            setTwitter(twitterUrl);
            console.log('🔗 Auto-filled Twitter URL:', twitterUrl);
            
            // Fill Image
            const imageUrl = getBestImage(matchingTweet);
            if (imageUrl) {
              setUploadedImage(imageUrl);
              console.log('🖼️ Auto-filled image:', imageUrl);
            }
          } else {
            console.log('⚠️ No matching tweet found for double-clicked text');
          }
        }
      }, 10);
    };
    
    document.addEventListener('dblclick', handleDoubleClick);
    
    return () => {
      document.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [autoFillOnCopy, autoGenerateTicker, tweets]);
  
  // Global Enter key handler for INSTANT deployment when Name and Ticker are filled
  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      // Only trigger if Enter is pressed
      if (e.key !== 'Enter') return;
      
      // Don't trigger if already deploying
      if (isDeploying) return;
      
      // Check if Name and Symbol are filled (minimum requirements)
      if (!name.trim() || !symbol.trim()) return;
      
      // Check if we have an image
      if (!uploadedImage) return;
      
      // Check if we have a wallet
      if (!activeWallet) return;
      
      // Prevent default Enter behavior
      e.preventDefault();
      
      // INSTANT DEPLOY - trigger the deploy button
      console.log('⚡ INSTANT DEPLOY triggered via Enter key!');
      handleDeploy();
    };
    
    // Add global event listener
    document.addEventListener('keydown', handleGlobalEnter);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleGlobalEnter);
    };
  }, [name, symbol, uploadedImage, activeWallet, isDeploying, handleDeploy]);
  
  // Apply preset when triggered - INSTANT BACKGROUND DEPLOY
  useEffect(() => {
    if (presetTrigger && onPresetApplied) {
      console.log('📋 Applying preset:', presetTrigger);
      
      // Build the token data from preset (don't update visible form)
      const baseText = presetTrigger.selectedText || '';
      const tokenName = `${presetTrigger.namePrefix}${baseText}${presetTrigger.nameSuffix}`.trim();
      
      // Generate symbol using Ticker Mode
      const tokenSymbol = generateSymbol(baseText, presetTrigger.tickerMode);
      console.log(`🎯 Ticker Mode: ${presetTrigger.tickerMode}, Symbol: ${tokenSymbol}`);
      
      // Get platform
      const platformMap: { [key: string]: "pump" | "bonk" | "usd1" } = {
        'Pump.fun': 'pump',
        'Raydium': 'bonk',
        'Jupiter': 'usd1',
        'Binance': 'bonk',
        'USD1': 'usd1',
        'BONK': 'bonk'
      };
      const deployPlatform = presetTrigger.deployPlatform !== 'Use Account Default' 
        ? platformMap[presetTrigger.deployPlatform] || selectedPlatform
        : selectedPlatform;
      
      // Handle tweet image and deploy instantly in background
      const instantDeploy = async () => {
        if (!activeWallet) {
          showToast("Please import a wallet first!", "error");
          onPresetApplied();
          return;
        }
        
        if (!tokenName || !tokenSymbol) {
          showToast("Could not generate token name from selected text!", "error");
          onPresetApplied();
          return;
        }
        
        let imageToUse = uploadedImage; // Use existing image if available
        
        // Use tweet image directly if available (avoid CORS issues with cropping)
        if (presetTrigger.tweetImageUrl && presetTrigger.imageType === 'Image in Post') {
          console.log('🖼️ Using tweet image directly:', presetTrigger.tweetImageUrl);
          imageToUse = presetTrigger.tweetImageUrl;
        } 
        // Generate image for non-"Image in Post" types
        else if (presetTrigger.imageType && presetTrigger.imageType !== 'Image in Post') {
          try {
            console.log(`🎨 Generating ${presetTrigger.imageType} for: ${baseText}`);
            imageToUse = await generatePresetImage(
              presetTrigger.imageType,
              baseText,
              presetTrigger.customImageUrl,
              presetTrigger.deployPlatform
            );
            console.log('✅ Image generated successfully!');
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Image generation failed:', errorMsg);
            showToast(`Image generation failed: ${errorMsg}`, "error");
            onPresetApplied();
            return;
          }
        }
        
        if (!imageToUse) {
          showToast("No image available for deployment!", "error");
          onPresetApplied();
          return;
        }
        
        // Deploy instantly in background (no delay toast)
        setIsDeploying(true);
        
        try {
          await deploymentService.connect();
          
          deploymentService.createToken(
            {
              platform: deployPlatform,
              name: tokenName,
              symbol: tokenSymbol,
              image: imageToUse,
              amount: buyAmount || 0.01,
              wallets: [activeWallet.compositeKey],
              website: website.trim() || undefined,
              twitter: presetTrigger.tweetLink || twitter.trim() || undefined,
            },
            (data) => {
              showToast(`Token $${tokenSymbol} Created Successfully!`, "success");
              setIsDeploying(false);
            },
            (error) => {
              showToast(`Deployment Failed: ${error}`, "error");
              setIsDeploying(false);
            }
          );
        } catch (error) {
          showToast(`Failed to connect to Token API: ${error}`, "error");
          setIsDeploying(false);
        }
      };
      
      instantDeploy();
      
      // Clear the trigger
      onPresetApplied();
    }
  }, [presetTrigger]);
  
  return (
    <div 
      className={`h-full ${theme.panel1Bg} flex flex-col relative ${isDragging ? 'ring-4 ring-blue-500' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Toast Container - Top Right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
      {/* Header Row - Modern & Clean */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
        {/* Token Deploy Heading - Modern */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <span className="text-white font-bold text-sm tracking-wide">TOKEN DEPLOY</span>
        </div>

        {/* Clean Button - Minimal */}
        <button 
          onClick={handleClear}
          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg transition-all text-xs font-medium border border-red-500/20 hover:border-red-500/30"
        >
          <Trash2 size={14} />
          <span>Clear</span>
        </button>

        {/* Wallet Dropdown - Truncated */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-slate-400 text-xs font-medium whitespace-nowrap">Wallet:</span>
          <button className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-white px-3 py-1.5 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all text-xs flex items-center justify-between min-w-0 backdrop-blur-sm">
            <span className={`${activeWallet ? 'text-white' : 'text-slate-500'} truncate font-mono text-xs`}>
              {activeWallet 
                ? `${activeWallet.publicKey.slice(0, 4)}...${activeWallet.publicKey.slice(-4)}`
                : 'No wallet selected'}
            </span>
            <svg className="w-3 h-3 flex-shrink-0 ml-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 p-3 overflow-auto ${theme.panel1ContentBg}`}>
        <div className="flex flex-col gap-2">
          {/* Name Field */}
          <div>
            <input
              type="text"
              maxLength={32}
              placeholder="Name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full ${theme.inputBg} ${theme.textPrimary} px-3 py-2 rounded-lg border ${theme.inputBorder} text-sm focus:outline-none focus:border-slate-600 placeholder-gray-500`}
            />
          </div>

          {/* Symbol Field */}
          <div>
            <input
              type="text"
              maxLength={13}
              placeholder="Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              className={`w-full ${theme.inputBg} ${theme.textPrimary} px-3 py-2 rounded-lg border ${theme.inputBorder} text-sm focus:outline-none focus:border-slate-600 placeholder-gray-500`}
            />
          </div>

          {/* Auto-fill and Auto-generate Ticker Row */}
          <div className="flex items-center gap-4 px-1 flex-wrap">
            {/* Auto-fill on copy checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoFillOnCopy}
                onChange={(e) => setAutoFillOnCopy(e.target.checked)}
                className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-slate-300 text-xs select-none">Auto-fill on copy</span>
            </label>

            {/* Auto-generate ticker checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerateTicker}
                onChange={(e) => setAutoGenerateTicker(e.target.checked)}
                className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-slate-300 text-xs select-none">Auto-generate ticker</span>
            </label>
          </div>

          {/* Website Field */}
          <div>
            <input
              type="text"
              placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full ${theme.inputBg} ${theme.textPrimary} px-3 py-2 rounded-lg border ${theme.inputBorder} text-sm focus:outline-none focus:border-slate-600 placeholder-gray-500`}
            />
          </div>

          {/* Twitter Field */}
          <div>
            <input
              type="text"
              placeholder="Twitter (https://twitter.com/...)"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full ${theme.inputBg} ${theme.textPrimary} px-3 py-2 rounded-lg border ${theme.inputBorder} text-sm focus:outline-none focus:border-slate-600 placeholder-gray-500`}
            />
          </div>

          {/* Image Section with Drag & Drop */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full h-20 ${theme.inputBg} rounded-lg border-2 ${
              isDragging ? 'border-blue-500 bg-blue-900/20' : theme.inputBorder
            } flex items-center justify-center ${theme.textSecondary} text-xs cursor-pointer transition-colors relative overflow-hidden`}
          >
            {uploadedImage ? (
              <img 
                src={uploadedImage} 
                alt="Uploaded" 
                className="w-full h-full object-contain"
              />
            ) : (
              <span>{isDragging ? 'Drop image here...' : 'Drag & drop image or click to upload'}</span>
            )}
          </div>

          {/* Platform Section */}
          <div className="mt-2">
            <label className="text-gray-400 text-xs font-medium mb-2 block text-center">Platform</label>
            <div className="flex justify-center items-center gap-2">
              {logos.map((logo, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPlatformIndex(i)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all overflow-hidden ${
                    selectedPlatformIndex === i 
                      ? 'border-green-500 bg-green-900/30 ring-2 ring-green-500/50' 
                      : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <Image 
                    src={logo.src} 
                    alt={logo.alt} 
                    width={24} 
                    height={24}
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Buy Amount (SOL) */}
          <div className="mt-3">
            <label className="text-gray-400 text-xs font-medium mb-1.5 block text-center">Buy Amount (SOL)</label>
            <input
              type="number"
              step="any"
              value={buyAmount}
              onChange={(e) => setBuyAmount(parseFloat(e.target.value) || 0)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-900 text-white px-3 py-2.5 rounded-lg border border-slate-700 text-sm focus:outline-none focus:border-slate-500 font-medium text-center"
            />
          </div>

          {/* Preset Amount Buttons with Config */}
          <div className="flex gap-1.5 mt-2">
            {isEditingPresets ? (
              <>
                {tempPresets.map((val, i) => (
                  <input
                    key={i}
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const newPresets = [...tempPresets];
                      newPresets[i] = e.target.value;
                      setTempPresets(newPresets);
                    }}
                    className="flex-1 px-1 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white text-xs font-medium text-center focus:outline-none focus:border-blue-500 w-0 min-w-0"
                  />
                ))}
                <button
                  onClick={() => {
                    const parsed = tempPresets.map(v => parseFloat(v) || 0).filter(v => v > 0);
                    if (parsed.length === 5) {
                      setPresetAmounts(parsed);
                      localStorage.setItem('deployPresetAmounts', JSON.stringify(parsed));
                    }
                    setIsEditingPresets(false);
                  }}
                  className="px-2 py-2 rounded-lg border border-green-600 bg-green-600 text-white text-xs font-medium"
                >
                  ✓
                </button>
              </>
            ) : (
              <>
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      // Deploy with this amount WITHOUT changing the default buyAmount
                      handleDeployWithAmount(amount);
                    }}
                    className="flex-1 px-2 py-2 rounded-lg border text-xs font-medium transition-all bg-slate-800 border-slate-600 text-gray-300 hover:border-purple-500 hover:bg-purple-600 hover:text-white"
                  >
                    {amount < 1 ? amount : amount}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setTempPresets(presetAmounts.map(String));
                    setIsEditingPresets(true);
                  }}
                  className="px-2 py-2 rounded-lg border border-slate-600 bg-slate-800 text-gray-400 text-xs hover:bg-slate-700 hover:text-white"
                  title="Edit preset amounts"
                >
                  ⚙️
                </button>
              </>
            )}
          </div>

          {/* Letter, SOL, ASCII, Deploy Row - These buttons instant deploy with that image mode */}
          <div className="flex gap-1.5 mt-3">
            <button 
              onClick={() => {
                setSelectedImageMode("letter");
                // Clear uploaded image to force generation, then deploy
                setUploadedImage(null);
                setTimeout(() => handleDeployWithAmount(buyAmount), 50);
              }}
              disabled={isDeploying}
              className={`flex-1 px-3 py-2.5 ${isDeploying ? 'bg-gray-600' : 'bg-slate-800 border-slate-600 hover:bg-green-700 hover:border-green-600'} text-white text-xs font-medium rounded-lg border transition-colors`}
              title="Instant deploy with letter image"
            >
              LETTER
            </button>
            <button 
              onClick={() => {
                setSelectedImageMode("sol");
                setUploadedImage(null);
                setTimeout(() => handleDeployWithAmount(buyAmount), 50);
              }}
              disabled={isDeploying}
              className={`flex-1 px-3 py-2.5 ${isDeploying ? 'bg-gray-600' : 'bg-slate-800 border-slate-600 hover:bg-purple-700 hover:border-purple-600'} text-white text-xs font-medium rounded-lg border transition-colors`}
              title="Instant deploy with Solana gradient image"
            >
              SOL
            </button>
            <button 
              onClick={() => {
                setSelectedImageMode("ascii");
                setUploadedImage(null);
                setTimeout(() => handleDeployWithAmount(buyAmount), 50);
              }}
              disabled={isDeploying}
              className={`flex-1 px-3 py-2.5 ${isDeploying ? 'bg-gray-600' : 'bg-slate-800 border-slate-600 hover:bg-cyan-700 hover:border-cyan-600'} text-white text-xs font-medium rounded-lg border transition-colors`}
              title="Instant deploy with ASCII art image"
            >
              ASCII
            </button>
            <button 
              onClick={handleDeploy}
              disabled={isDeploying}
              className={`flex-[1.5] px-3 py-2.5 ${isDeploying ? 'bg-gray-600 cursor-not-allowed' : testMode ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'} text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5`}
            >
              {isDeploying ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{testMode ? 'Generating...' : 'Deploying...'}</span>
                </>
              ) : (
                <>
                  <span>{testMode ? '👁️' : '⚡'}</span>
                  <span>{testMode ? 'Preview' : 'Deploy'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Test Mode Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowPreview(false)}>
          <div className="bg-gray-900 rounded-xl w-full max-w-lg mx-4 border border-gray-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-4">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                👁️ Token Preview (Test Mode)
              </h2>
              <p className="text-white/80 text-sm">This is how your token would look</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Token Image */}
              <div className="flex justify-center">
                <div className="w-40 h-40 rounded-xl overflow-hidden border-4 border-gray-700 bg-black">
                  <img 
                    src={previewData.image} 
                    alt="Token Preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Token Info */}
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Name</span>
                  <span className="text-white font-bold text-lg">{previewData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Symbol/Ticker</span>
                  <span className="text-green-400 font-bold text-lg">${previewData.symbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Platform</span>
                  <span className="text-blue-400 font-medium">{previewData.platform}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Buy Amount</span>
                  <span className="text-purple-400 font-medium">{previewData.amount} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Image Mode</span>
                  <span className="text-yellow-400 font-medium">{previewData.imageMode}</span>
                </div>
                {previewData.website && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Website</span>
                    <span className="text-cyan-400 font-medium truncate max-w-[200px]">{previewData.website}</span>
                  </div>
                )}
                {previewData.twitter && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Twitter</span>
                    <span className="text-cyan-400 font-medium truncate max-w-[200px]">{previewData.twitter}</span>
                  </div>
                )}
              </div>

              {/* Info Note */}
              <div className="bg-orange-900/30 border border-orange-700/50 rounded-lg p-3">
                <p className="text-orange-300 text-xs text-center">
                  🧪 Test Mode is ON - No actual deployment will happen. Disable Test Mode to deploy for real.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-800">
              <button
                onClick={() => setShowPreview(false)}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
