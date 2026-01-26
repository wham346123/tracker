"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface J7Tweet {
  id?: string;
  createdAt?: number;
  author?: {
    id?: string;
    handle?: string;
    name?: string;
    avatar?: string;
    verified?: boolean;
  };
  originalAuthor?: {
    id?: string;
    handle?: string;
    name?: string;
    avatar?: string;
    verified?: boolean;
  };
  text?: string;
  type?: string;
  isRetweet?: boolean;
  media?: {
    images?: Array<{ url: string }>;
    videos?: any[];
  };
  originalMedia?: {
    images?: Array<{ url: string }>;
    videos?: any[];
  };
  tweetUrl?: string;
}

interface UseJ7FeedOptions {
  onTweetReceived?: (tweet: J7Tweet) => void;
  onInitialTweets?: (tweets: J7Tweet[]) => void;
  onTweetDeleted?: (tweetId: string) => void;
  onFollow?: (data: any) => void;
  onUnfollow?: (data: any) => void;
  onDeactivation?: (data: any) => void;
  jwtToken: string;
}

export function useJ7Feed({ onTweetReceived, onInitialTweets, onTweetDeleted, onFollow, onUnfollow, onDeactivation, jwtToken }: UseJ7FeedOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jwtToken) {
      console.warn('[J7Feed] No JWT token provided');
      return;
    }

    console.log('[J7Feed] Initializing Socket.IO client...');

    // Create Socket.IO client with proper configuration
    const socket = io('wss://j7tracker.com', {
      transports: ['websocket'], // Use WebSocket only
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
      // Socket.IO client automatically handles large payloads via chunking
    });

    socketRef.current = socket;

    // Connection established
    socket.on('connect', () => {
      console.log('✅ [J7Feed] Connected to J7Tracker');
      setIsConnected(true);
      setError(null);

      // Send authentication
      console.log('[J7Feed] Sending authentication...');
      socket.emit('user_connected', jwtToken);
    });

    // Connection error
    socket.on('connect_error', (err) => {
      console.error('[J7Feed] Connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
      console.log('[J7Feed] Disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, need to reconnect manually
        console.log('[J7Feed] Server disconnected, attempting reconnect...');
        socket.connect();
      }
    });

    // Reconnection attempt
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[J7Feed] Reconnection attempt ${attemptNumber}...`);
    });

    // Reconnection success
    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ [J7Feed] Reconnected after ${attemptNumber} attempts`);
    });

    // Reconnection failed
    socket.on('reconnect_failed', () => {
      console.error('[J7Feed] Reconnection failed after all attempts');
      setError('Failed to reconnect to J7Tracker');
    });

    // Listen for tweet events
    socket.on('tweet', (data: J7Tweet) => {
      console.log('[J7Feed] New tweet received:', data.author?.handle || data.id);
      console.log('[J7Feed] Tweet data:', data); // Debug log
      if (onTweetReceived) {
        onTweetReceived(data);
      }
    });

    // Listen for follow events
    socket.on('follow', (data: any) => {
      console.log('[J7Feed] Follow event:', data);
      if (onFollow) onFollow(data);
    });

    // Listen for unfollow events
    socket.on('unfollow', (data: any) => {
      console.log('[J7Feed] Unfollow event:', data);
      if (onUnfollow) onUnfollow(data);
    });

    // Listen for tweet deletion events
    socket.on('tweet_delete', (data: any) => {
      console.log('[J7Feed] Tweet deleted:', data);
      if (onTweetDeleted) onTweetDeleted(data.id || data.tweetId || data);
    });

    // Listen for account deactivation events
    socket.on('deactivation', (data: any) => {
      console.log('[J7Feed] Account deactivated:', data);
      if (onDeactivation) onDeactivation(data);
    });

    // Listen for initial tweets (batch)
    socket.on('initialTweets', (data: J7Tweet[]) => {
      const tweets = Array.isArray(data) ? data : [];
      console.log(`[J7Feed] Initial tweets received: ${tweets.length} tweets`);
      if (onInitialTweets) {
        onInitialTweets(tweets);
      }
    });

    // Listen for tweet updates
    socket.on('tweet_update', (data: J7Tweet) => {
      console.log('[J7Feed] Tweet updated:', data.id);
      // You can add update logic here if needed
    });

    // Listen for quoted tweets
    socket.on('quoted_tweet', (data: J7Tweet) => {
      console.log('[J7Feed] Quote tweet received:', data.author?.handle || data.id);
      if (onTweetReceived) {
        onTweetReceived(data);
      }
    });

    // Listen for external messages (Discord, etc.)
    socket.on('external_message', (data: any) => {
      console.log('[J7Feed] External message:', data);
    });

    // Generic error handler
    socket.on('error', (err: any) => {
      console.error('[J7Feed] Socket error:', err);
      setError(err?.message || 'Unknown socket error');
    });

    // Cleanup on unmount
    return () => {
      console.log('[J7Feed] Cleaning up Socket.IO connection...');
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [jwtToken, onTweetReceived, onInitialTweets, onTweetDeleted, onFollow, onUnfollow, onDeactivation]);

  return { isConnected, error };
}
