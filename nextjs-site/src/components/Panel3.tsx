"use client";

import { useState, useEffect } from "react";
import { getTheme } from "@/utils/themes";
import Image from "next/image";

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

interface Panel3Props {
  themeId: string;
  tweets: Tweet[];
  customNotifications: Array<{
    username: string;
    color: string;
    sound: string;
  }>;
  defaultColor: string;
  onTweetAdded?: (tweet: Tweet) => void;
}

export default function Panel3({ themeId, tweets, customNotifications, defaultColor, onTweetAdded }: Panel3Props) {
  const theme = getTheme(themeId);

  const getTweetHighlightColor = (handle: string) => {
    const customNotif = customNotifications.find(n => n.username.toLowerCase() === handle.toLowerCase());
    return customNotif?.color || defaultColor;
  };

  return (
    <div className={`h-full ${theme.panel1ContentBg} overflow-y-auto`}>
      <div className="p-4 space-y-4">
        {tweets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No tweets yet. Paste a Twitter URL in the chat bar above!</p>
            <p className="text-xs mt-2">Example: https://x.com/username/status/123456789</p>
          </div>
        ) : (
          tweets.map((tweet) => (
            <div
              key={tweet.id}
              className="rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg"
              style={{
                backgroundColor: tweet.highlightColor ? `${tweet.highlightColor}35` : 'transparent',
                borderColor: tweet.highlightColor || '#374151',
                boxShadow: tweet.highlightColor ? `0 0 30px ${tweet.highlightColor}40, inset 0 0 20px ${tweet.highlightColor}20` : 'none',
              }}
            >
              {/* Header */}
              <div className="p-4 bg-gray-800/50 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                    {tweet.profilePic ? (
                      <img src={tweet.profilePic} alt={tweet.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl">
                        {tweet.displayName[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{tweet.displayName}</span>
                      {tweet.verified && (
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">{tweet.handle}</div>
                  </div>
                </div>
                <div className="mt-2 text-blue-400 text-sm font-medium">
                  {tweet.handle} posted
                </div>
              </div>

              {/* Content */}
              <div className="p-4 bg-gray-900/50">
                <p className="text-white text-base leading-relaxed whitespace-pre-wrap select-text">{tweet.text}</p>
                
                {tweet.imageUrl && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img 
                      src={tweet.imageUrl} 
                      alt="Tweet image" 
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>

              {/* Footer - Deploy Button */}
              <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-end">
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                  <span>⚡</span>
                  <span>DEPLOY</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
