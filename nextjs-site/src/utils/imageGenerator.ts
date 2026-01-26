// Image generation utilities for custom preset deployments
import figlet from 'figlet';
import standardFont from 'figlet/importable-fonts/Standard.js';

// Parse the Standard font once when the module loads
figlet.parseFont('Standard', standardFont);

/**
 * Generate ASCII Art image from text using figlet library
 * @param text The text to convert to ASCII art
 * @returns Data URL of the generated image
 */
export async function generateASCIIArt(text: string): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Generate ASCII art using figlet (synchronously since font is preloaded)
  // Force uppercase for consistent appearance
  const asciiArt = figlet.textSync(
    text.toUpperCase().slice(0, 15), // Force uppercase, limit text length
    {
      font: 'Standard',
      horizontalLayout: 'fitted',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true,
    }
  );
  
  // Draw ASCII art centered on canvas with much larger font
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'top';
  
  const lines = asciiArt.split('\n');
  
  // Start with a large font size and scale down if needed
  let fontSize = 80;
  let lineHeight = fontSize;
  ctx.font = `${fontSize}px "Courier New", monospace`;
  
  // Find the longest line to calculate scaling
  let maxLineLength = 0;
  for (const line of lines) {
    if (line.length > maxLineLength) maxLineLength = line.length;
  }
  
  // Calculate font size to fit the canvas width
  let maxWidth = ctx.measureText('M'.repeat(maxLineLength)).width;
  const targetWidth = canvas.width * 0.9; // Use 90% of canvas width
  
  // Scale font size to fit width
  if (maxWidth > targetWidth) {
    fontSize = Math.floor((fontSize * targetWidth) / maxWidth);
    lineHeight = fontSize;
    ctx.font = `${fontSize}px "Courier New", monospace`;
  }
  
  // Recalculate with final font size
  const totalHeight = lines.length * lineHeight;
  const targetHeight = canvas.height * 0.9; // Use 90% of canvas height
  
  // Scale font size to fit height if needed
  if (totalHeight > targetHeight) {
    fontSize = Math.floor((fontSize * targetHeight) / totalHeight);
    lineHeight = fontSize;
    ctx.font = `${fontSize}px "Courier New", monospace`;
  }
  
  // Calculate final positioning
  const finalHeight = lines.length * lineHeight;
  const startY = (canvas.height - finalHeight) / 2;
  
  // Find actual max width for centering
  maxWidth = 0;
  for (const line of lines) {
    const width = ctx.measureText(line).width;
    if (width > maxWidth) maxWidth = width;
  }
  
  const startX = (canvas.width - maxWidth) / 2;
  
  // Draw each line with stroke for thicker, more readable text
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = Math.max(3, fontSize / 12); // Increased stroke width for better readability
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  for (let i = 0; i < lines.length; i++) {
    const y = startY + (i * lineHeight);
    // Draw stroke first (outline)
    ctx.strokeText(lines[i], startX, y);
    // Then fill on top
    ctx.fillText(lines[i], startX, y);
  }
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate Solana branded gradient text image (exact Solana brand colors)
 * @param text The text to display (default: "SOLANA")
 * @returns Data URL of the generated image
 */
export async function generateSolanaGradient(text: string = 'SOLANA'): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Official Solana brand gradient: Purple (#DC1FFF) to Cyan (#00FFA3)
  // Based on https://solana.com/branding
  const gradient = ctx.createLinearGradient(0, canvas.height / 2, canvas.width, canvas.height / 2);
  gradient.addColorStop(0, '#DC1FFF');    // Solana purple
  gradient.addColorStop(0.5, '#00FFA3');  // Solana green/cyan
  gradient.addColorStop(1, '#00FFA3');    // Solana cyan
  
  // Measure text to ensure it fits and is centered
  const upperText = text.toUpperCase();
  let fontSize = 180;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  let textWidth = ctx.measureText(upperText).width;
  
  // Scale font if text is too wide
  while (textWidth > canvas.width * 0.9 && fontSize > 60) {
    fontSize -= 10;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    textWidth = ctx.measureText(upperText).width;
  }
  
  // Draw text perfectly centered
  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(upperText, canvas.width / 2, canvas.height / 2);
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate letter image using ngrok hosted images with optional background color change
 * @param letter The letter to display
 * @param isPump Whether this is for Pump.fun (keeps green) or other platforms (changes to yellow/gold)
 * @returns Data URL of the generated/modified image
 */
export async function generateLetterImage(letter: string, isPump: boolean): Promise<string> {
  // Get the first letter and convert to lowercase for URL
  const char = (letter.toUpperCase()[0] || 'A').toLowerCase();
  
  // Base URL for letter images (all use {letter}1.png)
  const baseUrl = 'https://mustang-supreme-plainly.ngrok-free.app/images';
  const imageUrl = `${baseUrl}/${char}1.png`;
  
  // If Pump.fun, return the image URL directly (keep green background)
  if (isPump) {
    return imageUrl;
  }
  
  // For non-Pump platforms, load the image and change background from green to yellow/gold
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Get image data to modify background color
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Replace green background (#22C55E or similar green) with yellow/gold (#D4A034)
      // Define green color range to replace
      const greenThreshold = 50; // Tolerance for green detection
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Detect green pixels (g > r and g > b, and relatively bright)
        if (g > r + greenThreshold && g > b + greenThreshold && g > 100) {
          // Replace with yellow/gold color #D4A034 (212, 160, 52)
          data[i] = 212;     // R
          data[i + 1] = 160; // G
          data[i + 2] = 52;  // B
          // Alpha (i + 3) stays the same
        }
      }
      
      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Validate and return custom image URL
 * @param imageUrl The custom image URL
 * @returns The validated image URL
 */
export async function getCustomImage(imageUrl: string): Promise<string> {
  // Simply return the URL - the deployment API will handle validation
  if (!imageUrl || !imageUrl.trim()) {
    throw new Error('Custom image URL is required');
  }
  
  return imageUrl.trim();
}

/**
 * Generate image based on preset configuration
 * @param imageType The type of image to generate
 * @param text The text/ticker to use
 * @param customImageUrl Optional custom image URL
 * @param deployPlatform The deployment platform
 * @returns Data URL or URL of the generated/selected image
 */
export async function generatePresetImage(
  imageType: string,
  text: string,
  customImageUrl?: string,
  deployPlatform?: string
): Promise<string> {
  switch (imageType) {
    case 'ASCII Art':
      return await generateASCIIArt(text);
    
    case 'SOL ASCII (Gradient)':
      return await generateSolanaGradient(text);
    
    case 'Letter Image':
      const firstLetter = text.trim()[0] || 'A';
      const isPump = deployPlatform === 'Pump.fun';
      return await generateLetterImage(firstLetter, isPump);
    
    case 'Custom Image':
      if (!customImageUrl) {
        throw new Error('Custom image URL is required for Custom Image type');
      }
      return await getCustomImage(customImageUrl);
    
    case 'Image in Post':
      // This should be handled separately (uses tweet image)
      throw new Error('Image in Post should be handled by tweet image logic');
    
    default:
      throw new Error(`Unknown image type: ${imageType}`);
  }
}
