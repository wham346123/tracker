"use client";

import { useState } from 'react';

export default function GenerateLettersPage() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);

  const generateLetter = (letter: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d')!;
      
      // Green background
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Configure text
      ctx.font = 'bold 650px Arial, Helvetica, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw outlined letter
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 20;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeText(letter.toUpperCase(), 500, 530);
      
      resolve(canvas.toDataURL('image/png'));
    });
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  const generateAll = async () => {
    setGenerating(true);
    setGenerated([]);
    
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    
    for (const letter of letters) {
      const dataUrl = await generateLetter(letter);
      downloadImage(dataUrl, `${letter}1.png`);
      setGenerated(prev => [...prev, letter]);
      // Small delay to not overwhelm browser
      await new Promise(r => setTimeout(r, 200));
    }
    
    setGenerating(false);
  };

  const generateSingle = async (letter: string) => {
    const dataUrl = await generateLetter(letter);
    downloadImage(dataUrl, `${letter}1.png`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Letter Image Generator</h1>
      <p className="text-gray-400 mb-8">
        Generate all 26 letter images (a1.png - z1.png) to upload to your own hosting.
      </p>

      <div className="flex gap-4 mb-8">
        <button
          onClick={generateAll}
          disabled={generating}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-bold"
        >
          {generating ? `Generating... (${generated.length}/26)` : 'Download All 26 Letters'}
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Or download individual letters:</h2>
      <div className="grid grid-cols-13 gap-2">
        {'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => (
          <button
            key={letter}
            onClick={() => generateSingle(letter)}
            className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-xl"
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">After downloading:</h3>
        <ol className="list-decimal list-inside text-gray-300 space-y-1">
          <li>Create a GitHub repo (e.g., "letter-images")</li>
          <li>Create an "images" folder and upload all PNG files</li>
          <li>Go to Settings → Pages → Enable from main branch</li>
          <li>Your images will be at: <code className="bg-gray-700 px-2 py-1 rounded">https://yourusername.github.io/letter-images/images/b1.png</code></li>
        </ol>
      </div>
    </div>
  );
}
