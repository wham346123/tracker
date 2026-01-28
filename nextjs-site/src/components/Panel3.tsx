"use client";

import { useState, useEffect } from "react";
import { getTheme } from "@/utils/themes";

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
  onDeploy?: (imageUrl: string, twitterUrl: string) => void;
}

// Helper to proxy images through our API to avoid CORS
const proxyImageUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

// Component to render an embedded tweet (for replies/quotes)
const EmbeddedTweet = ({ tweet }: { tweet: Tweet }) => (
  <div className="border border-gray-600 rounded-lg p-3 bg-gray-800/30 mt-3">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
        {tweet.profilePic ? (
          <img 
            src={proxyImageUrl(tweet.profilePic)} 
            alt={tweet.displayName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-sm">
            {tweet.displayName[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-white font-semibold text-sm truncate">{tweet.displayName}</span>
          {tweet.verified && (
            <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
            </svg>
          )}
          <span className="text-gray-400 text-xs truncate">{tweet.handle}</span>
        </div>
      </div>
    </div>
    
    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap select-text break-words mb-2">
      {tweet.text}
    </p>
    
    {tweet.media && tweet.media.length > 0 && (
      <div className="space-y-2">
        {tweet.media.map((item, index) => (
          <div key={index} className="rounded overflow-hidden bg-black max-h-60">
            {item.type === 'image' && (
              <img 
                src={proxyImageUrl(item.url)} 
                alt={`Media ${index + 1}`} 
                className="w-full h-auto max-h-60 object-cover" 
                loading="lazy"
                style={{ maxHeight: '240px' }}
              />
            )}
            {item.type === 'video' && (
              <video 
                src={proxyImageUrl(item.url)} 
                controls 
                className="w-full h-auto max-h-48" 
                preload="metadata"
                style={{ maxHeight: '192px' }}
              />
            )}
            {item.type === 'gif' && (
              <img 
                src={proxyImageUrl(item.url)} 
                alt={`GIF ${index + 1}`} 
                className="w-full h-auto max-h-60 object-cover" 
                loading="lazy"
                style={{ maxHeight: '240px' }}
              />
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function Panel3({ themeId, tweets, customNotifications, defaultColor, onTweetAdded, onDeploy }: Panel3Props) {
  const theme = getTheme(themeId);

  return (
    <div className={`h-full ${theme.panel1ContentBg} overflow-y-auto`}>
      <div className="p-4 space-y-4">
        {tweets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No tweets yet. Connected to J7 Feed!</p>
            <p className="text-xs mt-2">Tweets will appear here automatically</p>
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
                <div className="flex items-center gap-3 justify-between">
                  {/* Left side - Profile and info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                      {tweet.profilePic ? (
                        <img 
                          src={proxyImageUrl(tweet.profilePic)} 
                          alt={tweet.displayName} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextSibling) {
                              (target.nextSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center text-white text-xl" style={{ display: tweet.profilePic ? 'none' : 'flex' }}>
                        {tweet.displayName[0]?.toUpperCase() || '?'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold truncate">{tweet.displayName}</span>
                        {tweet.verified && (
                          <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                          </svg>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm truncate">{tweet.handle}</div>
                    </div>
                  </div>
                  
                  {/* Right side - DEPLOY Button */}
                  <button 
                    onClick={() => {
                      console.log('🚀 DEPLOY clicked for tweet:', tweet.id);
                      
                      // STEP 1: Extract image URL
                      let imageToSend = '';
                      
                      // Priority 1: First image in media array
                      const firstImage = tweet.media?.find(m => m.type === 'image' || m.type === 'gif');
                      if (firstImage) {
                        imageToSend = firstImage.url;
                      }
                      // Priority 2: Video preview (for videos)
                      else if (tweet.media?.find(m => m.type === 'video')) {
                        const video = tweet.media.find(m => m.type === 'video');
                        if (video) {
                          imageToSend = video.url;
                        }
                      }
                      // Priority 3: Legacy imageUrl field
                      else if (tweet.imageUrl) {
                        imageToSend = tweet.imageUrl;
                      }
                      // Priority 4: Profile picture (fallback for text-only tweets)
                      else if (tweet.profilePic) {
                        imageToSend = tweet.profilePic;
                      }
                      
                      // STEP 2: Build Twitter URL
                      const twitterUrl = tweet.twitterStatusId 
                        ? `https://twitter.com/${tweet.username}/status/${tweet.twitterStatusId}`
                        : `https://twitter.com/${tweet.username}`;
                      
                      console.log('📋 Constructing URL - twitterStatusId:', tweet.twitterStatusId, 'final URL:', twitterUrl);
                      
                      // STEP 3: Trigger deploy with BOTH image URL and Twitter URL (passed through React props)
                      if (imageToSend && onDeploy) {
                        onDeploy(imageToSend, twitterUrl);
                        console.log('✅ Sent image URL:', imageToSend);
                        console.log('✅ Sent Twitter URL:', twitterUrl);
                      } else {
                        console.warn('⚠️ No image found');
                      }
                      
                      // Focus Name input
                      const nameInput = document.querySelector('input[placeholder="Name"]') as HTMLInputElement;
                      if (nameInput) {
                        nameInput.focus();
                        console.log('✅ Focused Name input');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
                  >
                    <span>⚡</span>
                    <span>DEPLOY</span>
                  </button>
                </div>
                
                {/* Tweet Type Indicator */}
                <div className="mt-2 flex items-center gap-2 text-sm flex-wrap">
                  {tweet.isRetweet && tweet.originalAuthorHandle ? (
                    <div className="text-green-400 font-medium flex items-center gap-1">
                      <span>🔄</span>
                      <span>Retweeted from {tweet.originalAuthorHandle}</span>
                    </div>
                  ) : tweet.isReply ? (
                    <div className="text-blue-400 font-medium flex items-center gap-1">
                      <span>💬</span>
                      <span>Reply</span>
                    </div>
                  ) : tweet.isQuote ? (
                    <div className="text-purple-400 font-medium flex items-center gap-1">
                      <span>📝</span>
                      <span>Quote Tweet</span>
                    </div>
                  ) : (
                    <div className="text-blue-400 font-medium">
                      {tweet.handle} posted
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 bg-gray-900/50">
                {/* Main Tweet Text FIRST (the reply itself) */}
                <p className="text-white text-base leading-relaxed whitespace-pre-wrap select-text break-words">
                  {tweet.text}
                </p>
                
                {/* Show Replied-To Tweet BELOW main text (for replies) */}
                {tweet.repliedToTweet ? (
                  <div className="mt-3">
                    <div className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                      <span>Replying to</span>
                      <span className="text-blue-400">{tweet.repliedToTweet.handle}</span>
                    </div>
                    <EmbeddedTweet tweet={tweet.repliedToTweet} />
                  </div>
                ) : tweet.replyToHandle && (
                  <div className="mt-3">
                    <div className="text-gray-400 text-xs flex items-center gap-1">
                      <span>Replying to</span>
                      <span className="text-blue-400">{tweet.replyToHandle}</span>
                    </div>
                  </div>
                )}
                
                {/* Display Media - Images First, Then Videos (J7 Style) */}
                {tweet.media && tweet.media.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {/* Images and GIFs - Moderate sizing like J7 */}
                    {tweet.media.filter(m => m.type === 'image' || m.type === 'gif').length > 0 && (
                      <div className="grid gap-2" style={{
                        gridTemplateColumns: tweet.media.filter(m => m.type === 'image' || m.type === 'gif').length === 1 ? '1fr' : 'repeat(2, 1fr)'
                      }}>
                        {tweet.media.filter(m => m.type === 'image' || m.type === 'gif').map((item, index) => (
                          <div key={`img-${index}`} className="rounded-lg overflow-hidden bg-black max-h-96">
                            <img 
                              src={proxyImageUrl(item.url)} 
                              alt={`Media ${index + 1}`} 
                              className="w-full h-full object-cover max-h-96"
                              loading="lazy"
                              style={{ maxHeight: '384px' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Videos Below Images - Smaller playback size */}
                    {tweet.media.filter(m => m.type === 'video').map((item, index) => (
                      <div key={`vid-${index}`} className="rounded-lg overflow-hidden bg-black max-h-64">
                        <video 
                          src={proxyImageUrl(item.url)} 
                          controls 
                          className="w-full h-auto max-h-64"
                          preload="metadata"
                          style={{ maxHeight: '256px' }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Fallback for legacy imageUrl */}
                {!tweet.media && tweet.imageUrl && (
                  <div className="mt-4 rounded-lg overflow-hidden bg-black">
                    <img 
                      src={proxyImageUrl(tweet.imageUrl)} 
                      alt="Tweet image" 
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                )}
                
                {/* Show Quoted Tweet (for quote tweets) */}
                {tweet.quotedTweet && (
                  <EmbeddedTweet tweet={tweet.quotedTweet} />
                )}
                
                {/* Link Previews */}
                {tweet.linkPreviews && tweet.linkPreviews.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {tweet.linkPreviews.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-gray-600 rounded-lg overflow-hidden hover:border-gray-500 transition-colors bg-gray-800/50"
                      >
                        {link.image && (
                          <div className="w-full bg-black max-h-48">
                            <img 
                              src={proxyImageUrl(link.image)} 
                              alt={link.title || 'Link preview'} 
                              className="w-full h-auto max-h-48 object-cover"
                              loading="lazy"
                              style={{ maxHeight: '192px' }}
                            />
                          </div>
                        )}
                        <div className="p-3">
                          {link.domain && (
                            <div className="text-gray-400 text-xs mb-1">{link.domain}</div>
                          )}
                          {link.title && (
                            <div className="text-white font-semibold text-sm mb-1 line-clamp-2">
                              {link.title}
                            </div>
                          )}
                          {link.description && (
                            <div className="text-gray-300 text-xs line-clamp-2">
                              {link.description}
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
