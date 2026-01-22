import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tweetId = searchParams.get('id');

  if (!tweetId) {
    return NextResponse.json({ error: 'Tweet ID is required' }, { status: 400 });
  }

  try {
    // Fetch tweet data from Twitter's syndication API server-side
    const response = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=en&token=a`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.user) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
    }

    // Return the tweet data
    return NextResponse.json({
      username: `@${data.user.screen_name}`,
      displayName: data.user.name,
      handle: `@${data.user.screen_name}`,
      verified: data.user.verified || data.user.is_blue_verified || false,
      text: data.text || '',
      imageUrl: data.photos && data.photos.length > 0 ? data.photos[0].url : undefined,
      profilePic: data.user.profile_image_url_https || '',
      timestamp: new Date(data.created_at).toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric', 
        year: 'numeric' 
      }),
    });
  } catch (error) {
    console.error('Failed to fetch tweet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweet data' },
      { status: 500 }
    );
  }
}
