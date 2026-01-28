"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Panel1 from "./Panel1";
import Panel3 from "./Panel3";
import { Filter, Settings, Home, Layers } from "lucide-react";
import SettingsModal from "./SettingsModal";
import DeploySettingsModal from "./DeploySettingsModal";
import { getTheme } from "@/utils/themes";
import { useJ7Feed } from "@/hooks/useJ7Feed";
import { generatePresetImage } from "@/utils/imageGenerator";

// J7Tracker JWT Token
const J7_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5vbGFuIiwiaXAiOiI1MC4xMjYuMTMxLjIzMCIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjkxOTI4MDcsImV4cCI6MTc2OTc5NzYwN30.vCBXyP-S-CTe2n3z2nbvF8WFnuSJJqZme_AiYRAikXM';

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
  twitterStatusId?: string; // Actual Twitter status ID for URL construction
  username: string;
  displayName: string;
  handle: string;
  verified: boolean;
  timestamp: string;
  text: string;
  imageUrl?: string;
  profilePic: string;
  highlightColor?: string;
  isRetweet?: boolean;
  isReply?: boolean;
  isQuote?: boolean;
  tweetType?: string;
  platform?: 'twitter' | 'truthsocial' | 'x';
  media?: Array<{ type: 'image' | 'video' | 'gif'; url: string }>;
  originalAuthorHandle?: string;
  replyToHandle?: string; // Handle of the user being replied to (even without full content)
  quotedTweet?: Tweet;
  repliedToTweet?: Tweet;
  linkPreviews?: Array<{
    url: string;
    title?: string;
    description?: string;
    image?: string;
    domain?: string;
  }>;
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
  customImageUrl?: string;
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
  const [deployedImageUrl, setDeployedImageUrl] = useState<string | null>(null);
  const [deployedTwitterUrl, setDeployedTwitterUrl] = useState<string | null>(null);
  const [clearTrigger, setClearTrigger] = useState<number>(0); // Trigger to clear Panel1
  
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  // Use ref to avoid stale closures in callbacks
  const customNotificationsRef = useRef(customNotifications);
  useEffect(() => {
    customNotificationsRef.current = customNotifications;
  }, [customNotifications]);
  
  const theme = getTheme(currentTheme);

  // Play notification sound - memoized
  const playNotificationSound = useCallback((soundName: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    
    switch(soundName) {
      case "Beep": oscillator.frequency.setValueAtTime(800, audioContext.currentTime); oscillator.type = "sine"; break;
      case "Ding": oscillator.frequency.setValueAtTime(1200, audioContext.currentTime); oscillator.type = "sine"; break;
      case "Chime": oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); oscillator.type = "triangle"; break;
      case "Coin": oscillator.frequency.setValueAtTime(1500, audioContext.currentTime); oscillator.type = "square"; break;
      case "Buzz": oscillator.frequency.setValueAtTime(200, audioContext.currentTime); oscillator.type = "sawtooth"; break;
      case "Harsh Buzz": oscillator.frequency.setValueAtTime(150, audioContext.currentTime); oscillator.type = "sawtooth"; break;
      case "Electric Shock": oscillator.frequency.setValueAtTime(100, audioContext.currentTime); oscillator.type = "square"; break;
      case "Metal Clang": oscillator.frequency.setValueAtTime(2000, audioContext.currentTime); oscillator.type = "square"; break;
      case "Chainsaw": oscillator.frequency.setValueAtTime(80, audioContext.currentTime); oscillator.type = "sawtooth"; break;
      case "Destroyer": oscillator.frequency.setValueAtTime(50, audioContext.currentTime); oscillator.type = "sawtooth"; break;
      default: oscillator.frequency.setValueAtTime(600, audioContext.currentTime); oscillator.type = "sine";
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }, []);

  // Memoized callbacks for J7Feed to prevent reconnections
  const handleTweetReceived = useCallback((j7Tweet: any) => {
    console.log('🔍 Processing tweet:', j7Tweet);
    console.log('📊 Tweet structure:', JSON.stringify(j7Tweet, null, 2));
    
    // Extract author info (who posted/retweeted)
    const authorData = j7Tweet.author || {};
    
    // For retweets/quotes, we show the POSTER's info in header, but ORIGINAL content
    const username = authorData?.handle || 
                     authorData?.name || 
                     authorData?.username ||
                     authorData?.screenName ||
                     j7Tweet.username ||
                     j7Tweet.handle ||
                     j7Tweet.screenName ||
                     'unknown';
    
    const displayName = authorData?.name || 
                       authorData?.displayName ||
                       authorData?.handle || 
                       username;
    
    const profilePic = authorData?.avatar || 
                      authorData?.profilePic || 
                      '';
    
    const verified = authorData?.verified || false;

    
    const customNotif = customNotificationsRef.current.find(n => 
      n.username.toLowerCase() === `@${username.toLowerCase()}`
    );
    
    // Extract ALL media (images, videos, gifs) - check all possible locations
    const mediaSource = j7Tweet.isRetweet ? j7Tweet.originalMedia : j7Tweet.media;
    const media: Array<{ type: 'image' | 'video' | 'gif'; url: string }> = [];
    
    // Images from main media source
    if (mediaSource?.images && Array.isArray(mediaSource.images)) {
      mediaSource.images.forEach((img: any) => {
        if (img && img.url) {
          media.push({ type: 'image', url: img.url });
        }
      });
    }
    
    // Videos from main media source
    if (mediaSource?.videos && Array.isArray(mediaSource.videos)) {
      mediaSource.videos.forEach((vid: any) => {
        if (vid && (vid.url || vid.thumbnail)) {
          media.push({ type: 'video', url: vid.url || vid.thumbnail });
        }
      });
    }
    
    // Fallback: Check if media is directly on j7Tweet
    if (media.length === 0 && j7Tweet.images && Array.isArray(j7Tweet.images)) {
      j7Tweet.images.forEach((img: any) => {
        if (img) {
          media.push({ type: 'image', url: typeof img === 'string' ? img : img.url });
        }
      });
    }
    
    const imageUrl = media.find(m => m.type === 'image')?.url;
    const timestamp = j7Tweet.createdAt ? new Date(j7Tweet.createdAt).toISOString() : new Date().toISOString();
    
    // Extract reply information - replyTo is just a reference (id, handle), repliedQuote has the full tweet
    const replyToRef = j7Tweet.replyTo || j7Tweet.repliedTo || null;
    // The ACTUAL replied-to tweet content is in repliedQuote, not replyTo!
    const replyTo = j7Tweet.repliedQuote || j7Tweet.parentTweet || j7Tweet.parent || replyToRef;
    
    // Debug: Log reply structure
    if (j7Tweet.isReply || replyTo) {
      console.log('🔴 repliedQuote exists:', !!j7Tweet.repliedQuote);
      console.log('🔴 repliedQuote keys:', j7Tweet.repliedQuote ? Object.keys(j7Tweet.repliedQuote) : 'N/A');
      if (j7Tweet.repliedQuote) {
        console.log('🔴 repliedQuote.text:', j7Tweet.repliedQuote.text);
      }
    }
    
    // Extract quoted tweet (for quote tweets/retweets)
    let quotedTweet: Tweet | undefined;
    if (j7Tweet.quotedTweet) {
      const qt = j7Tweet.quotedTweet;
      const qtMedia: Array<{ type: 'image' | 'video' | 'gif'; url: string }> = [];
      if (qt.media?.images) {
        qt.media.images.forEach((img: any) => qtMedia.push({ type: 'image', url: img.url }));
      }
      if (qt.media?.videos) {
        qt.media.videos.forEach((vid: any) => qtMedia.push({ type: 'video', url: vid.url || vid.thumbnail }));
      }
      
      quotedTweet = {
        id: qt.id || 'quoted',
        username: qt.author?.handle || 'unknown',
        displayName: qt.author?.name || qt.author?.handle || 'Unknown',
        handle: `@${qt.author?.handle || 'unknown'}`,
        verified: qt.author?.verified || false,
        timestamp: qt.createdAt ? new Date(qt.createdAt).toISOString() : timestamp,
        text: qt.text || '',
        profilePic: qt.author?.avatar || '',
        highlightColor: undefined,
        media: qtMedia.length > 0 ? qtMedia : undefined,
      };
    }
    
    // Extract replied-to tweet (for replies) - ULTRA ENHANCED with ALL possible fallbacks
    let repliedToTweet: Tweet | undefined;
    if (replyTo) {
      const rt = replyTo;
      console.log('🔍 FULL Reply-to data structure:', rt);
      console.log('🔍 Reply-to JSON:', JSON.stringify(rt, null, 2));
      console.log('🔍 Reply-to keys:', Object.keys(rt));
      
      // COMPREHENSIVE MEDIA EXTRACTION - check ALL possible locations
      const rtMedia: Array<{ type: 'image' | 'video' | 'gif'; url: string }> = [];
      
      // Method 1: Standard media.images/videos
      if (rt.media?.images && Array.isArray(rt.media.images)) {
        console.log('✅ Found images in rt.media.images:', rt.media.images.length);
        rt.media.images.forEach((img: any) => {
          const url = img.url || img.src || img.href || img;
          if (url) rtMedia.push({ type: 'image', url: typeof url === 'string' ? url : url.url });
        });
      }
      if (rt.media?.videos && Array.isArray(rt.media.videos)) {
        console.log('✅ Found videos in rt.media.videos:', rt.media.videos.length);
        rt.media.videos.forEach((vid: any) => {
          const url = vid.url || vid.src || vid.href || vid.thumbnail || vid;
          if (url) rtMedia.push({ type: 'video', url: typeof url === 'string' ? url : url.url });
        });
      }
      
      // Method 2: Direct images/videos arrays
      if (rt.images && Array.isArray(rt.images)) {
        console.log('✅ Found images in rt.images:', rt.images.length);
        rt.images.forEach((img: any) => {
          const url = img.url || img.src || img.href || img;
          if (url) rtMedia.push({ type: 'image', url: typeof url === 'string' ? url : url.url });
        });
      }
      if (rt.videos && Array.isArray(rt.videos)) {
        console.log('✅ Found videos in rt.videos:', rt.videos.length);
        rt.videos.forEach((vid: any) => {
          const url = vid.url || vid.src || vid.href || vid.thumbnail || vid;
          if (url) rtMedia.push({ type: 'video', url: typeof url === 'string' ? url : url.url });
        });
      }
      
      // Method 3: entities.media (Twitter API format)
      if (rt.entities?.media && Array.isArray(rt.entities.media)) {
        console.log('✅ Found media in rt.entities.media:', rt.entities.media.length);
        rt.entities.media.forEach((item: any) => {
          if (item.type === 'photo' && item.media_url_https) {
            rtMedia.push({ type: 'image', url: item.media_url_https });
          } else if (item.type === 'video' && item.video_info?.variants) {
            const mp4 = item.video_info.variants.find((v: any) => v.content_type === 'video/mp4');
            if (mp4) rtMedia.push({ type: 'video', url: mp4.url });
          }
        });
      }
      
      // Method 4: extended_entities (Twitter extended format)
      if (rt.extended_entities?.media && Array.isArray(rt.extended_entities.media)) {
        console.log('✅ Found media in rt.extended_entities.media:', rt.extended_entities.media.length);
        rt.extended_entities.media.forEach((item: any) => {
          if (item.type === 'photo' && item.media_url_https) {
            rtMedia.push({ type: 'image', url: item.media_url_https });
          } else if (item.type === 'video' && item.video_info?.variants) {
            const mp4 = item.video_info.variants.find((v: any) => v.content_type === 'video/mp4');
            if (mp4) rtMedia.push({ type: 'video', url: mp4.url });
          }
        });
      }
      
      console.log(`📊 Total media found: ${rtMedia.length}`, rtMedia);
      
      // Enhanced username extraction for replied-to tweet
      const rtUsername = rt.author?.handle || 
                         rt.author?.username || 
                         rt.author?.screen_name ||
                         rt.author?.screenName ||
                         rt.author?.name ||
                         rt.user?.screen_name ||
                         rt.user?.handle ||
                         rt.user?.username ||
                         rt.handle ||
                         rt.username ||
                         rt.screen_name ||
                         rt.screenName ||
                         'unknown';
      
      const rtDisplayName = rt.author?.name || 
                           rt.author?.displayName ||
                           rt.author?.display_name ||
                           rt.author?.handle || 
                           rt.user?.name ||
                           rt.user?.displayName ||
                           rt.name ||
                           rt.displayName ||
                           rtUsername;
      
      // ULTRA COMPREHENSIVE text extraction - check EVERY possible field
      // Log all available keys to help debug
      console.log('🔑 All rt keys:', Object.keys(rt));
      console.log('🔑 rt.tweet keys:', rt.tweet ? Object.keys(rt.tweet) : 'no tweet object');
      console.log('🔑 rt.data keys:', rt.data ? Object.keys(rt.data) : 'no data object');
      
      const rtText = rt.text || 
                     rt.fullText || 
                     rt.full_text ||
                     rt.content || 
                     rt.body ||
                     rt.message ||
                     rt.description ||
                     rt.tweet?.text ||
                     rt.tweet?.fullText ||
                     rt.tweet?.full_text ||
                     rt.tweet?.content ||
                     rt.status?.text ||
                     rt.status?.full_text ||
                     rt.data?.text ||
                     rt.data?.fullText ||
                     rt.data?.full_text ||
                     rt.originalTweet?.text ||
                     rt.original?.text ||
                     rt.note?.text ||
                     rt.post?.text ||
                     rt.post?.content ||
                     // Sometimes the text might be directly a string value in a weird key
                     (typeof rt === 'string' ? rt : '') ||
                     '';
      
      console.log('📝 Extracted text:', rtText);
      console.log('📝 Raw rt.text value:', rt.text);
      console.log('📝 Raw rt.fullText value:', rt.fullText);
      console.log('📝 Raw rt.content value:', rt.content);
      
      // COMPREHENSIVE profile pic extraction - check EVERYTHING
      const rtProfilePic = rt.author?.avatar || 
                          rt.author?.profilePic || 
                          rt.author?.profile_image_url ||
                          rt.author?.profile_image_url_https ||
                          rt.author?.profileImageUrl ||
                          rt.user?.avatar ||
                          rt.user?.profilePic ||
                          rt.user?.profile_image_url ||
                          rt.user?.profile_image_url_https ||
                          rt.avatar || 
                          rt.profilePic || 
                          rt.profile_image_url ||
                          rt.profile_image_url_https ||
                          rt.profileImageUrl ||
                          '';
      
      // Only create repliedToTweet if we have actual content (text or media)
      // If we only have a reference (id, handle), don't show the embedded tweet box
      if (rtText || rtMedia.length > 0) {
        repliedToTweet = {
          id: rt.id || rt.tweetId || rt.tweet_id || 'replied',
          username: rtUsername,
          displayName: rtDisplayName,
          handle: `@${rtUsername}`,
          verified: rt.author?.verified || rt.user?.verified || rt.verified || false,
          timestamp: rt.createdAt || rt.created_at || rt.timestamp ? new Date(rt.createdAt || rt.created_at || rt.timestamp).toISOString() : timestamp,
          text: rtText,
          profilePic: rtProfilePic,
          highlightColor: undefined,
          media: rtMedia.length > 0 ? rtMedia : undefined,
        };
        console.log('✅ Converted replied-to tweet with content:', repliedToTweet);
      } else {
        console.log('⚠️ Replied-to tweet has no content, skipping embedded box. Handle:', rtUsername);
      }
    }
    
    // Extract link previews
    const linkPreviews: Array<{url: string; title?: string; description?: string; image?: string; domain?: string}> = [];
    if (j7Tweet.links && Array.isArray(j7Tweet.links)) {
      j7Tweet.links.forEach((link: any) => {
        linkPreviews.push({
          url: link.url || link.expandedUrl || '',
          title: link.title,
          description: link.description,
          image: link.image || link.thumbnail,
          domain: link.domain || new URL(link.url || link.expandedUrl || 'https://example.com').hostname,
        });
      });
    }
    
    // For RETWEETS, create an embedded tweet for the original content
    let retweetedTweet: Tweet | undefined;
    let retweetOriginalAuthor: any;
    if (j7Tweet.isRetweet || j7Tweet.type === 'RETWEET') {
      retweetOriginalAuthor = j7Tweet.originalAuthor || j7Tweet.retweetedStatus?.author || {};
      const originalUsername = retweetOriginalAuthor?.handle || retweetOriginalAuthor?.username || 'unknown';
      const originalDisplayName = retweetOriginalAuthor?.name || originalUsername;
      
      retweetedTweet = {
        id: j7Tweet.originalTweetId || j7Tweet.retweetedStatus?.id || 'retweeted',
        username: originalUsername,
        displayName: originalDisplayName,
        handle: `@${originalUsername}`,
        verified: retweetOriginalAuthor?.verified || false,
        timestamp: j7Tweet.createdAt ? new Date(j7Tweet.createdAt).toISOString() : timestamp,
        text: j7Tweet.text || j7Tweet.retweetedStatus?.text || 'No text content',
        profilePic: retweetOriginalAuthor?.avatar || retweetOriginalAuthor?.profilePic || '',
        highlightColor: undefined,
        media: media.length > 0 ? media : undefined,
      };
    }
    
    // Get the reply-to handle from the reference (even if we don't have full content)
    const replyToHandle = replyToRef?.handle || replyToRef?.username || repliedToTweet?.username;
    
    const newTweet: Tweet = {
      id: `j7-${Date.now()}-${Math.random()}`,
      twitterStatusId: j7Tweet.id || j7Tweet.tweetId || j7Tweet.statusId, // Store actual Twitter status ID
      username, 
      displayName,
      handle: `@${username}`,
      verified, 
      timestamp,
      text: j7Tweet.isRetweet ? '' : (j7Tweet.text || 'No text content'), // Empty text for retweets since it's in the embedded box
      imageUrl, 
      profilePic,
      highlightColor: customNotif?.color,
      isRetweet: j7Tweet.isRetweet || j7Tweet.type === 'RETWEET' || false,
      isReply: j7Tweet.isReply || replyTo !== null || replyToRef !== null || false,
      isQuote: j7Tweet.isQuote || j7Tweet.quotedTweet !== null || false,
      tweetType: j7Tweet.type,
      media: undefined, // Media goes in the retweetedTweet for retweets
      originalAuthorHandle: j7Tweet.isRetweet && retweetOriginalAuthor?.handle ? `@${retweetOriginalAuthor.handle}` : undefined,
      replyToHandle: replyToHandle ? `@${replyToHandle}` : undefined, // Store handle even without full content
      quotedTweet: retweetedTweet || quotedTweet, // Use retweetedTweet for retweets, quotedTweet for quotes
      repliedToTweet,
      linkPreviews: linkPreviews.length > 0 ? linkPreviews : undefined,
    };
    
    console.log('✅ Converted tweet:', newTweet);
    
    setTweets(prev => [newTweet, ...prev]);
    
    if (customNotif && customNotif.sound !== "None (Highlight Only)") {
      playNotificationSound(customNotif.sound);
    }
  }, [playNotificationSound]);

  const handleInitialTweets = useCallback((initialTweets: any[]) => {
    const convertedTweets: Tweet[] = initialTweets.map((j7Tweet, index) => {
      // Same improved logic as handleTweetReceived
      const authorData = j7Tweet.author || {};
      const contentSource = j7Tweet.isRetweet && j7Tweet.originalAuthor ? j7Tweet.originalAuthor : j7Tweet.author;
      
      const username = contentSource?.handle || 
                       contentSource?.name || 
                       authorData?.handle || 
                       authorData?.name || 
                       j7Tweet.handle ||
                       'unknown';
      
      const displayName = contentSource?.name || 
                         contentSource?.handle || 
                         authorData?.name ||
                         username;
      
      const profilePic = contentSource?.avatar || 
                        authorData?.avatar || 
                        '';
      
      const verified = contentSource?.verified || authorData?.verified || false;
      
      const customNotif = customNotificationsRef.current.find(n => 
        n.username.toLowerCase() === `@${username.toLowerCase()}`
      );
      
      // Extract ALL media with improved fallbacks
      const mediaSource = j7Tweet.isRetweet ? j7Tweet.originalMedia : j7Tweet.media;
      const media: Array<{ type: 'image' | 'video' | 'gif'; url: string }> = [];
      
      if (mediaSource?.images && Array.isArray(mediaSource.images)) {
        mediaSource.images.forEach((img: any) => {
          if (img && img.url) {
            media.push({ type: 'image', url: img.url });
          }
        });
      }
      
      if (mediaSource?.videos && Array.isArray(mediaSource.videos)) {
        mediaSource.videos.forEach((vid: any) => {
          if (vid && (vid.url || vid.thumbnail)) {
            media.push({ type: 'video', url: vid.url || vid.thumbnail });
          }
        });
      }
      
      // Fallback for direct images
      if (media.length === 0 && j7Tweet.images && Array.isArray(j7Tweet.images)) {
        j7Tweet.images.forEach((img: any) => {
          if (img) {
            media.push({ type: 'image', url: typeof img === 'string' ? img : img.url });
          }
        });
      }
      
      const imageUrl = media.find(m => m.type === 'image')?.url;
      const timestamp = j7Tweet.createdAt ? new Date(j7Tweet.createdAt).toISOString() : new Date().toISOString();
      const replyTo = j7Tweet.replyTo || j7Tweet.repliedTo || null;
      
      return {
        id: `j7-init-${Date.now()}-${index}`,
        twitterStatusId: j7Tweet.id || j7Tweet.tweetId || j7Tweet.statusId,
        username, 
        displayName,
        handle: `@${username}`,
        verified, 
        timestamp,
        text: j7Tweet.text || 'No text content',
        imageUrl, 
        profilePic,
        highlightColor: customNotif?.color,
        isRetweet: j7Tweet.isRetweet || j7Tweet.type === 'RETWEET' || false,
        isReply: j7Tweet.isReply || replyTo !== null || false,
        isQuote: j7Tweet.isQuote || j7Tweet.quotedTweet !== null || false,
        tweetType: j7Tweet.type,
        media: media.length > 0 ? media : undefined,
        originalAuthorHandle: j7Tweet.isRetweet && j7Tweet.author?.handle ? `@${j7Tweet.author.handle}` : undefined,
      };
    });
    
    setTweets(prev => [...convertedTweets, ...prev]);
  }, []);

  // Handle tweet deletion
  const handleTweetDeleted = useCallback((tweetId: string) => {
    console.log('🗑️ Tweet deleted:', tweetId);
    setTweets(prev => prev.filter(tweet => !tweet.id.includes(tweetId)));
  }, []);

  // Handle follow events - Create notification tweet
  const handleFollow = useCallback((data: any) => {
    console.log('👤 Follow event:', data);
    
    const follower = data.follower || data.user || {};
    const following = data.following || data.target || {};
    
    const username = follower.handle || follower.username || 'someone';
    const targetUsername = following.handle || following.username || 'someone';
    
    const eventTweet: Tweet = {
      id: `follow-${Date.now()}-${Math.random()}`,
      username: username,
      displayName: follower.name || username,
      handle: `@${username}`,
      verified: follower.verified || false,
      timestamp: new Date().toISOString(),
      text: `Started following @${targetUsername}`,
      profilePic: follower.avatar || '',
      highlightColor: '#10b981', // Green
      tweetType: 'FOLLOW',
    };
    
    setTweets(prev => [eventTweet, ...prev]);
  }, []);

  // Handle unfollow events - Create notification tweet
  const handleUnfollow = useCallback((data: any) => {
    console.log('👤 Unfollow event:', data);
    
    const unfollower = data.unfollower || data.user || {};
    const unfollowing = data.unfollowing || data.target || {};
    
    const username = unfollower.handle || unfollower.username || 'someone';
    const targetUsername = unfollowing.handle || unfollowing.username || 'someone';
    
    const eventTweet: Tweet = {
      id: `unfollow-${Date.now()}-${Math.random()}`,
      username: username,
      displayName: unfollower.name || username,
      handle: `@${username}`,
      verified: unfollower.verified || false,
      timestamp: new Date().toISOString(),
      text: `Unfollowed @${targetUsername}`,
      profilePic: unfollower.avatar || '',
      highlightColor: '#ef4444', // Red
      tweetType: 'UNFOLLOW',
    };
    
    setTweets(prev => [eventTweet, ...prev]);
  }, []);

  // Handle deactivation events - Create notification tweet and remove their tweets
  const handleDeactivation = useCallback((data: any) => {
    console.log('🚫 Account deactivated:', data);
    
    const user = data.user || data;
    const username = user.handle || user.username || 'someone';
    
    const eventTweet: Tweet = {
      id: `deactivation-${Date.now()}-${Math.random()}`,
      username: username,
      displayName: user.name || username,
      handle: `@${username}`,
      verified: user.verified || false,
      timestamp: new Date().toISOString(),
      text: 'Account has been deactivated',
      profilePic: user.avatar || '',
      highlightColor: '#6b7280', // Gray
      tweetType: 'DEACTIVATION',
    };
    
    // Add the deactivation notification
    setTweets(prev => [eventTweet, ...prev]);
    
    // Remove all tweets from this deactivated user
    if (username) {
      setTimeout(() => {
        setTweets(prev => prev.filter(tweet => 
          tweet.handle.toLowerCase() !== `@${username.toLowerCase()}` || 
          tweet.tweetType === 'DEACTIVATION'
        ));
      }, 100);
    }
  }, []);

  // J7 Feed connection with memoized callbacks
  const { isConnected: j7Connected, error: j7Error } = useJ7Feed({
    jwtToken: J7_JWT_TOKEN,
    onTweetReceived: handleTweetReceived,
    onInitialTweets: handleInitialTweets,
    onTweetDeleted: handleTweetDeleted,
    onFollow: handleFollow,
    onUnfollow: handleUnfollow,
    onDeactivation: handleDeactivation,
  });

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

  // Global keybind listener for Custom Presets
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();
      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      const pressedKeybind = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;

      const matchingPreset = customPresets.find(p => p.keybind === pressedKeybind);
      
      if (matchingPreset) {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        
        if (!selectedText) return;
        
        // Helper function to check if text exists in a tweet (including nested tweets)
        const textMatchesTweet = (tweet: Tweet, searchText: string): boolean => {
          const lowerSearch = searchText.toLowerCase();
          if (tweet.text && tweet.text.toLowerCase().includes(lowerSearch)) return true;
          if (tweet.quotedTweet?.text && tweet.quotedTweet.text.toLowerCase().includes(lowerSearch)) return true;
          if (tweet.repliedToTweet?.text && tweet.repliedToTweet.text.toLowerCase().includes(lowerSearch)) return true;
          return false;
        };

        // Helper function to extract the best image from a tweet
        const getBestImageForPreset = (tweet: Tweet): string | undefined => {
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
        
        let tweetImageUrl: string | undefined = undefined;
        let tweetLink: string | undefined = undefined;
        
        if (matchingPreset.imageType === 'Image in Post') {
          const matchingTweet = tweets.find(tweet => textMatchesTweet(tweet, selectedText));
          if (matchingTweet) {
            tweetImageUrl = getBestImageForPreset(matchingTweet);
            // Also get tweet link
            if (matchingTweet.twitterStatusId) {
              tweetLink = `https://twitter.com/${matchingTweet.username}/status/${matchingTweet.twitterStatusId}`;
            }
          }
        }
        
        e.preventDefault();
        setPresetTrigger({
          namePrefix: matchingPreset.namePrefix,
          nameSuffix: matchingPreset.nameSuffix,
          deployPlatform: matchingPreset.deployPlatform,
          tickerMode: matchingPreset.tickerMode,
          imageType: matchingPreset.imageType,
          selectedText,
          tweetImageUrl,
          tweetLink,
          customImageUrl: matchingPreset.customImageUrl,
        });
      }
    };

    document.addEventListener('keydown', handleGlobalKeyPress);
    return () => document.removeEventListener('keydown', handleGlobalKeyPress);
  }, [customPresets, tweets]);

  // Global keybind listener for Insta-Deploy
  useEffect(() => {
    const handleInstaDeployKeyPress = (e: KeyboardEvent) => {
      // Don't trigger in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Load settings from localStorage
      const primaryKeybind = localStorage.getItem('insta-deploy-primary') || 'Ctrl + X';
      const secondaryKeybind = localStorage.getItem('insta-deploy-secondary') || '';

      // Build pressed keybind string
      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.metaKey) modifiers.push('Meta');
      
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      const pressedKeybind = modifiers.length > 0 ? `${modifiers.join(' + ')} + ${key}` : key;

      // Check if it matches primary or secondary keybind
      const isMatch = pressedKeybind === primaryKeybind || 
                     (secondaryKeybind && pressedKeybind === secondaryKeybind);

      if (isMatch) {
        e.preventDefault();
        
        // Get selected text
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        
        if (!selectedText) {
          console.log('⚡ Insta-Deploy: No text selected');
          return;
        }

        console.log('⚡ INSTA-DEPLOY triggered with text:', selectedText);

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

        // Find the tweet containing this text (search main text, quoted text, and replied text)
        const matchingTweet = tweets.find(tweet => textMatchesTweet(tweet, selectedText));

        // Get tweet image using enhanced extraction
        let tweetImageUrl = matchingTweet ? getBestImage(matchingTweet) : undefined;
        if (tweetImageUrl) {
          console.log('📸 Found image:', tweetImageUrl);
        }

        // Build tweet link
        let tweetLink: string | undefined;
        if (matchingTweet) {
          const username = matchingTweet.username;
          const statusId = matchingTweet.twitterStatusId;
          if (username && statusId) {
            tweetLink = `https://twitter.com/${username}/status/${statusId}`;
            console.log('🔗 Tweet link:', tweetLink);
          }
        }
        
        // Trigger deployment with "Selected Text" ticker mode
        setPresetTrigger({
          namePrefix: '',
          nameSuffix: '',
          deployPlatform: 'Use Account Default',
          tickerMode: 'Selected Text',
          imageType: 'Image in Post',
          selectedText,
          tweetImageUrl,
          tweetLink,
        });
      }
    };

    document.addEventListener('keydown', handleInstaDeployKeyPress);
    return () => document.removeEventListener('keydown', handleInstaDeployKeyPress);
  }, [tweets]);

  // Fetch real tweet data using our server-side API route
  const fetchTweetData = async (tweetId: string) => {
    try {
      const response = await fetch(`/api/tweet?id=${tweetId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch tweet:', error);
      return null;
    }
  };

  // Parse Twitter URL and create tweet
  const parseTweetUrl = async (url: string) => {
    const twitterPattern = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/i;
    const match = url.match(twitterPattern);
    
    if (!match) return null;
    
    const username = match[1];
    const tweetId = match[2];
    const tweetData = await fetchTweetData(tweetId);
    
    if (!tweetData) return null;
    
    const customNotif = customNotifications.find(n => 
      n.username.toLowerCase() === tweetData.handle.toLowerCase()
    );
    
    return {
      id: `${tweetId}-${Date.now()}-${Math.random()}`,
      username: tweetData.username,
      displayName: tweetData.displayName,
      handle: tweetData.handle,
      verified: tweetData.verified,
      timestamp: tweetData.timestamp,
      text: tweetData.text,
      imageUrl: tweetData.imageUrl,
      profilePic: tweetData.profilePic,
      highlightColor: customNotif?.color,
    };
  };

  // Handle chat input submission
  const handleChatSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && chatInput.trim()) {
      const url = chatInput.trim();
      setChatInput('');
      
      try {
        const tweet = await parseTweetUrl(url);
        
        if (tweet) {
          setTweets(prev => [tweet, ...prev]);
          
          const customNotif = customNotifications.find(n => 
            n.username.toLowerCase() === tweet.handle.toLowerCase()
          );
          
          if (customNotif && customNotif.sound !== "None (Highlight Only)") {
            playNotificationSound(customNotif.sound);
          }
        }
      } catch (error) {
        console.error('Error processing tweet:', error);
      }
    }
  };

  const handleHeaderDividerMouseDown = (type: string) => setIsDragging({ type });
  const handlePanelMouseDown = (type: string) => setIsDragging({ type });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      if (isDragging.type === "header" && containerRef.current) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const mouseY = e.clientY - containerRect.top;
        const percentage = (mouseY / containerRect.height) * 100;
        setHeaderHeight(Math.max(3, Math.min(50, percentage)));
        return;
      }

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
      <div className="w-full relative" style={{ height: `${headerHeight}%` }}>
        <div ref={headerRef} className={`relative h-full w-full ${theme.header} overflow-hidden`}>
          {buttons.map((button) => (
            <div key={button.id} className="absolute group" style={{ left: `${button.x}px`, top: `${button.y}px`, width: `${button.width}px`, height: `${button.height}px` }}>
              {button.id === 5 ? (
                <input type="text" placeholder="Paste Twitter URL here..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleChatSubmit}
                  className="w-full h-full bg-slate-700 hover:bg-slate-600 text-white px-3 text-xs rounded-xl border-2 border-slate-500 focus:outline-none focus:border-slate-400 placeholder-gray-400" />
              ) : (
                <button onClick={() => { if (button.id === 3) setIsSettingsOpen(true); if (button.id === 9) setIsDeploySettingsOpen(true); }}
                  className={`w-full h-full ${button.id === 12 ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'} text-white font-medium flex items-center justify-center gap-1.5 rounded-xl border-2 ${button.id === 12 ? 'border-green-500' : 'border-slate-500'} shadow-md transition-all hover:shadow-lg ${button.id === 12 ? 'hover:border-green-400' : 'hover:border-slate-400'} cursor-pointer`}>
                  {button.id === 1 && <Home size={14} />}
                  {button.id === 10 && <><span className="text-sm">💾</span><span className="text-xs">Saved</span></>}
                  {button.id === 11 && <><span className="text-sm">🔍</span><span className="text-xs">Google</span></>}
                  {button.id === 2 && <><Filter size={14} /><span className="text-xs">Filters</span></>}
                  {button.id === 3 && <Settings size={14} />}
                  {button.id === 6 && <><span className="text-sm">👥</span><span className="text-xs">0</span></>}
                  {button.id === 7 && (<><span className="text-sm">🧛</span><span className="text-xs">VAMP</span>
                    <span className={`ml-1 w-2 h-2 rounded-full ${j7Connected ? 'bg-green-500' : 'bg-red-500'}`} title={j7Connected ? 'J7 Connected' : 'J7 Disconnected'}></span></>)}
                  {button.id === 12 && <><span className="text-sm">🚀</span><span className="text-xs font-bold">DEPLOY</span></>}
                  {button.id === 9 && <span className="text-sm">📚</span>}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={`w-full h-2 ${theme.headerDivider} hover:bg-gray-500 cursor-row-resize transition-colors ${isDragging?.type === "header" ? "bg-gray-600" : ""}`}
        onMouseDown={() => handleHeaderDividerMouseDown("header")} />

      <div className="flex flex-1 w-full overflow-hidden">
        <div className="h-full" style={{ width: `${panel1Width}%` }}>
          <Panel1 
            themeId={currentTheme} 
            activeWallet={activeWallet} 
            presetTrigger={presetTrigger} 
            onPresetApplied={() => setPresetTrigger(null)}
            deployedImageUrl={deployedImageUrl}
            deployedTwitterUrl={deployedTwitterUrl}
            onImageDeployed={() => setDeployedImageUrl(null)}
            onTwitterDeployed={() => setDeployedTwitterUrl(null)}
            clearTrigger={clearTrigger}
            tweets={tweets}
          />
        </div>

        <div className={`w-2 h-full bg-gray-300 hover:bg-gray-400 cursor-col-resize transition-colors ${isDragging?.type === "panel-0" ? "bg-gray-500" : ""}`}
          onMouseDown={() => handlePanelMouseDown("panel-0")} />

        <div className={`h-full ${theme.panel1ContentBg} transition-colors`} style={{ width: `${panel2Width}%` }} />

        <div className={`w-2 h-full bg-gray-300 hover:bg-gray-400 cursor-col-resize transition-colors ${isDragging?.type === "panel-1" ? "bg-gray-500" : ""}`}
          onMouseDown={() => handlePanelMouseDown("panel-1")} />

        <div className="h-full" style={{ width: `${panel3Width}%` }}>
          <Panel3 
            themeId={currentTheme} 
            tweets={tweets} 
            customNotifications={customNotifications} 
            defaultColor={defaultColor}
            onDeploy={(imageUrl: string, twitterUrl: string) => {
              console.log('🚀 ResizablePanels onDeploy:', { imageUrl, twitterUrl });
              setClearTrigger(prev => prev + 1); // Trigger clear first
              setDeployedImageUrl(imageUrl); // Then set new image
              setDeployedTwitterUrl(twitterUrl); // And set Twitter URL
            }}
          />
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentTheme={currentTheme} onThemeChange={setCurrentTheme}
        customNotifications={customNotifications} onCustomNotificationsChange={setCustomNotifications} defaultColor={defaultColor} onDefaultColorChange={setDefaultColor} />

      <DeploySettingsModal isOpen={isDeploySettingsOpen} onClose={() => setIsDeploySettingsOpen(false)} onWalletChange={setActiveWallet}
        presets={customPresets} onPresetsChange={setCustomPresets} />
    </div>
  );
}
