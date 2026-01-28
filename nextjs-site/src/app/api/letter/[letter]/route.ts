import { NextRequest, NextResponse } from 'next/server';

// Generate letter image using Canvas (server-side with node-canvas would need deps)
// For now, return an SVG which works great and needs no dependencies

export async function GET(
  request: NextRequest,
  { params }: { params: { letter: string } }
) {
  const letter = (params.letter || 'A').toUpperCase()[0];
  
  // Check for color parameter (default green, 'gold' for yellow)
  const { searchParams } = new URL(request.url);
  const color = searchParams.get('color');
  
  // Background colors
  const bgColor = color === 'gold' ? '#D4A034' : '#22C55E';
  
  // Generate SVG with outlined letter
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
      <rect width="1000" height="1000" fill="${bgColor}"/>
      <text 
        x="500" 
        y="530" 
        font-family="Arial, Helvetica, sans-serif" 
        font-size="650" 
        font-weight="bold"
        text-anchor="middle" 
        dominant-baseline="middle"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="20"
        stroke-linejoin="round"
        stroke-linecap="round"
      >${letter}</text>
    </svg>
  `.trim();
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
