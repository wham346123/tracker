"use client";

import { useState } from 'react';
import JSZip from 'jszip';

export default function GenerateLettersPage() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateLetter = (letter: string, color: 'green' | 'gold'): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d')!;
      
      // Background color based on type
      ctx.fillStyle = color === 'green' ? '#22C55E' : '#D4A034';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Configure text - thicker, bolder style matching reference
      ctx.font = '900 700px "Arial Black", "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const char = letter.toUpperCase();
      const x = 500;
      const y = 520;
      
      // Draw multiple strokes for thicker outline effect (matching reference style)
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.miterLimit = 2;
      
      // Outer stroke (thickest)
      ctx.lineWidth = 35;
      ctx.strokeText(char, x, y);
      
      // Middle stroke
      ctx.lineWidth = 28;
      ctx.strokeText(char, x, y);
      
      // Inner stroke (creates the clean outline look)
      ctx.lineWidth = 22;
      ctx.strokeText(char, x, y);
      
      // Fill with background color to create hollow effect
      ctx.fillStyle = color === 'green' ? '#22C55E' : '#D4A034';
      ctx.fillText(char, x, y);
      
      // Final white outline
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 18;
      ctx.strokeText(char, x, y);
      
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  };

  const generateAllAsZip = async () => {
    setGenerating(true);
    setProgress(0);
    
    const zip = new JSZip();
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const total = letters.length * 2; // green + gold
    let completed = 0;
    
    // Generate green letters
    for (const letter of letters) {
      const blob = await generateLetter(letter, 'green');
      zip.file(`${letter}1.png`, blob);
      completed++;
      setProgress(Math.round((completed / total) * 100));
    }
    
    // Generate gold letters
    for (const letter of letters) {
      const blob = await generateLetter(letter, 'gold');
      zip.file(`${letter}1_gold.png`, blob);
      completed++;
      setProgress(Math.round((completed / total) * 100));
    }
    
    // Generate and download zip
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'letter-images.zip';
    link.click();
    URL.revokeObjectURL(url);
    
    setGenerating(false);
    setProgress(0);
  };

  const generateSinglePreview = async (letter: string, color: 'green' | 'gold') => {
    const blob = await generateLetter(letter, color);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${letter}1${color === 'gold' ? '_gold' : ''}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Letter Image Generator</h1>
      <p className="text-gray-400 mb-8">
        Generate letter images for Pump.fun (green) and Bonk (gold/yellow).
      </p>

      <div className="flex flex-col gap-4 mb-8">
        <button
          onClick={generateAllAsZip}
          disabled={generating}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-bold text-lg flex items-center justify-center gap-3"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating... {progress}%</span>
            </>
          ) : (
            <>
              <span>📦</span>
              <span>Download All as ZIP (52 images)</span>
            </>
          )}
        </button>
        
        {generating && (
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">Preview - Green letters (Pump.fun):</h2>
      <div className="grid grid-cols-13 gap-2 mb-8">
        {'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => (
          <button
            key={letter}
            onClick={() => generateSinglePreview(letter, 'green')}
            className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-xl transition-transform hover:scale-110"
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">Preview - Gold letters (Bonk):</h2>
      <div className="grid grid-cols-13 gap-2 mb-8">
        {'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => (
          <button
            key={`gold-${letter}`}
            onClick={() => generateSinglePreview(letter, 'gold')}
            className="w-12 h-12 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-xl transition-transform hover:scale-110"
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">Upload to Netlify:</h3>
        <ol className="list-decimal list-inside text-gray-300 space-y-1">
          <li>Click "Download All as ZIP" above</li>
          <li>Extract the zip file</li>
          <li>Drag & drop the extracted folder to <a href="https://app.netlify.com/drop" className="text-blue-400 underline" target="_blank">app.netlify.com/drop</a></li>
        </ol>
      </div>
    </div>
  );
}
