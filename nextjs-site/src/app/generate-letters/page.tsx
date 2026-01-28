"use client";

import { useState } from 'react';

export default function GenerateLettersPage() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);
  const [generatingGold, setGeneratingGold] = useState(false);
  const [generatedGold, setGeneratedGold] = useState<string[]>([]);

  const generateLetter = (letter: string, color: 'green' | 'gold'): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d')!;
      
      // Background color based on type
      ctx.fillStyle = color === 'green' ? '#22C55E' : '#D4A034';
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

  const generateAllGreen = async () => {
    setGenerating(true);
    setGenerated([]);
    
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    
    for (const letter of letters) {
      const dataUrl = await generateLetter(letter, 'green');
      downloadImage(dataUrl, `${letter}1.png`);
      setGenerated(prev => [...prev, letter]);
      await new Promise(r => setTimeout(r, 200));
    }
    
    setGenerating(false);
  };

  const generateAllGold = async () => {
    setGeneratingGold(true);
    setGeneratedGold([]);
    
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    
    for (const letter of letters) {
      const dataUrl = await generateLetter(letter, 'gold');
      downloadImage(dataUrl, `${letter}1_gold.png`);
      setGeneratedGold(prev => [...prev, letter]);
      await new Promise(r => setTimeout(r, 200));
    }
    
    setGeneratingGold(false);
  };

  const generateSingle = async (letter: string, color: 'green' | 'gold') => {
    const dataUrl = await generateLetter(letter, color);
    const suffix = color === 'gold' ? '_gold' : '';
    downloadImage(dataUrl, `${letter}1${suffix}.png`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Letter Image Generator</h1>
      <p className="text-gray-400 mb-8">
        Generate letter images for Pump.fun (green) and Bonk (gold/yellow).
      </p>

      <div className="flex gap-4 mb-8">
        <button
          onClick={generateAllGreen}
          disabled={generating || generatingGold}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-bold"
        >
          {generating ? `Generating... (${generated.length}/26)` : '⬇️ Download Green (a1.png - z1.png)'}
        </button>
        <button
          onClick={generateAllGold}
          disabled={generating || generatingGold}
          className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg font-bold"
        >
          {generatingGold ? `Generating... (${generatedGold.length}/26)` : '⬇️ Download Gold (a1_gold.png - z1_gold.png)'}
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Green letters (Pump.fun):</h2>
      <div className="grid grid-cols-13 gap-2 mb-8">
        {'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => (
          <button
            key={letter}
            onClick={() => generateSingle(letter, 'green')}
            className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-xl"
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">Gold letters (Bonk):</h2>
      <div className="grid grid-cols-13 gap-2 mb-8">
        {'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => (
          <button
            key={`gold-${letter}`}
            onClick={() => generateSingle(letter, 'gold')}
            className="w-12 h-12 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-xl"
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">Upload to Netlify:</h3>
        <ol className="list-decimal list-inside text-gray-300 space-y-1">
          <li>Download both green and gold letters</li>
          <li>Put all files in a folder (a1.png, b1.png... + a1_gold.png, b1_gold.png...)</li>
          <li>Drag & drop to <a href="https://app.netlify.com/drop" className="text-blue-400 underline" target="_blank">app.netlify.com/drop</a></li>
        </ol>
      </div>
    </div>
  );
}
