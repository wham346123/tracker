"use client";

import { X, Trash2, Copy, Upload, Settings, Download, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { importWallet } from "@/services/tokenApi";

interface Wallet {
  id: string;
  type: 'solana' | 'evm';
  publicKey: string;
  privateKey: string;
  compositeKey: string; // The backend's encrypted composite key
  balance: number;
  isActive: boolean;
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
}

interface DeploySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletChange?: (wallet: Wallet | null) => void;
  presets: CustomPreset[];
  onPresetsChange: (presets: CustomPreset[]) => void;
}

export default function DeploySettingsModal({ isOpen, onClose, onWalletChange, presets, onPresetsChange }: DeploySettingsModalProps) {
  const [activeTab, setActiveTab] = useState("wallets");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<'solana' | 'evm'>('solana');
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  
  // Custom Presets form state
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [isCapturingKeybind, setIsCapturingKeybind] = useState(false);
  const [newPreset, setNewPreset] = useState<CustomPreset>({
    id: '',
    name: '',
    namePrefix: '',
    nameSuffix: '',
    deployPlatform: 'Use Account Default',
    tickerMode: 'Selected Text',
    imageType: 'Image in Post',
    keybind: ''
  });

  if (!isOpen) return null;

  const handleImportWallet = async () => {
    if (!privateKeyInput.trim()) return;

    try {
      let publicKey: string;
      let compositeKey: string;
      
      if (importType === 'solana') {
        // Derive real Solana public key from private key (for display)
        try {
          const privateKeyBytes = bs58.decode(privateKeyInput.trim());
          const keypair = Keypair.fromSecretKey(privateKeyBytes);
          publicKey = keypair.publicKey.toBase58();
          
          // Import wallet to backend and get composite key
          console.log('Importing wallet to backend...');
          const result = await importWallet(privateKeyInput.trim());
          compositeKey = result.wallet;
          console.log('✅ Wallet imported successfully');
        } catch (error) {
          console.error('Import error:', error);
          alert('Failed to import wallet. Please check your private key and try again.');
          return;
        }
      } else {
        // For EVM, generate mock public key
        let result = '0x';
        for (let i = 0; i < 40; i++) {
          const charIndex = (privateKeyInput.charCodeAt(i % privateKeyInput.length) + i) % 16;
          result += charIndex.toString(16);
        }
        publicKey = result;
        compositeKey = `${publicKey}:mock_encrypted_key`;
      }

      // Fetch real SOL balance using Solscan API (fast and accurate)
      let balance = 0;
      if (importType === 'solana') {
        try {
          const response = await fetch(`/api/solscan?address=${publicKey}`);
          if (response.ok) {
            const data = await response.json();
            balance = data.balance || 0;
          }
        } catch (error) {
          console.error('Failed to fetch balance from Solscan:', error);
          balance = 0;
        }
      }

      const newWallet: Wallet = {
        id: Date.now().toString(),
        type: importType,
        publicKey: publicKey,
        privateKey: privateKeyInput.trim(),
        compositeKey: compositeKey,
        balance: balance,
        isActive: wallets.length === 0
      };

      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      
      if (newWallet.isActive && onWalletChange) {
        onWalletChange(newWallet);
      }
      
      setPrivateKeyInput("");
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing wallet:', error);
      alert('Error importing wallet. Please check your private key and try again.');
    }
  };

  const handleSetActive = (walletId: string) => {
    const updatedWallets = wallets.map(w => ({
      ...w,
      isActive: w.id === walletId
    }));
    setWallets(updatedWallets);
    
    const activeWallet = updatedWallets.find(w => w.id === walletId);
    if (onWalletChange) {
      onWalletChange(activeWallet || null);
    }
  };

  const handleDeleteWallet = (walletId: string) => {
    const updatedWallets = wallets.filter(w => w.id !== walletId);
    setWallets(updatedWallets);
    
    // If deleted wallet was active, set first wallet as active
    if (updatedWallets.length > 0 && !updatedWallets.some(w => w.isActive)) {
      updatedWallets[0].isActive = true;
      if (onWalletChange) {
        onWalletChange(updatedWallets[0]);
      }
    } else if (updatedWallets.length === 0 && onWalletChange) {
      onWalletChange(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const solanaWallets = wallets.filter(w => w.type === 'solana');
  const evmWallets = wallets.filter(w => w.type === 'evm');

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex border border-gray-800">
          {/* Sidebar */}
          <div className="w-64 bg-black border-r border-gray-800 overflow-y-auto">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Deploy Settings</h2>
            </div>
            <nav className="p-2">
              {[
                { id: 'general', label: 'General', icon: '🏠' },
                { id: 'wallets', label: 'Wallets', icon: '💼' },
                { id: 'claim-fees', label: 'Claim Fees', icon: '💰' },
                { id: 'auto-deploy', label: 'Auto-Deploy', icon: '⚡' },
                { id: 'insta-deploy', label: 'Insta-Deploy', icon: '📱' },
                { id: 'extensions', label: 'Extensions', icon: '🔌' },
                { id: 'custom-presets', label: 'Custom Presets', icon: '📋' },
                { id: 'preset-buttons', label: 'Preset Buttons', icon: '🔘' },
                { id: 'whitelists', label: 'Whitelists', icon: '👥' },
                { id: 'image-settings', label: 'Image Settings', icon: '🖼️' },
                { id: 'referral', label: 'Referral', icon: '🔗' },
                { id: 'advanced', label: 'Advanced', icon: '⚙️' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-white">
                {activeTab === 'wallets' && 'Wallet Management'}
                {activeTab === 'general' && 'General Settings'}
                {activeTab !== 'wallets' && activeTab !== 'general' && activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'wallets' && (
                <div className="space-y-6">
                  {/* Import Wallet Button */}
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                  >
                    <Upload size={20} />
                    Import Wallet
                  </button>

                  {/* Solana Wallets */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-blue-400">≡</span> Solana Wallets
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {solanaWallets.map((wallet) => (
                        <div key={wallet.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-start justify-between mb-3">
                            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded">ACTIVE</span>
                            <button
                              onClick={() => handleDeleteWallet(wallet.id)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white text-sm font-mono break-all">{wallet.publicKey}</p>
                            <button
                              onClick={() => copyToClipboard(wallet.publicKey)}
                              className="text-gray-400 hover:text-white flex-shrink-0"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <p className="text-green-400 text-sm font-semibold mb-3">
                            Balance: {wallet.balance.toFixed(4)} SOL
                          </p>
                          {!wallet.isActive && (
                            <button
                              onClick={() => handleSetActive(wallet.id)}
                              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium mb-2"
                            >
                              Set Active
                            </button>
                          )}
                          <button
                            onClick={() => setShowApiKey(showApiKey === wallet.id ? null : wallet.id)}
                            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium"
                          >
                            {showApiKey === wallet.id ? 'Hide' : 'Show'} API Key
                          </button>
                          {showApiKey === wallet.id && (
                            <div className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-400 font-mono break-all">
                              {wallet.privateKey}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EVM Wallets */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-purple-400">⟡</span> EVM Wallets
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {evmWallets.map((wallet) => (
                        <div key={wallet.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-start justify-between mb-3">
                            {wallet.isActive && (
                              <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded">ACTIVE</span>
                            )}
                            <button
                              onClick={() => handleDeleteWallet(wallet.id)}
                              className="text-red-500 hover:text-red-400 ml-auto"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <p className="text-white text-sm font-mono break-all">{wallet.publicKey}</p>
                            <button
                              onClick={() => copyToClipboard(wallet.publicKey)}
                              className="text-gray-400 hover:text-white flex-shrink-0"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          {!wallet.isActive && (
                            <button
                              onClick={() => handleSetActive(wallet.id)}
                              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium mb-2"
                            >
                              Set Active
                            </button>
                          )}
                          <button
                            onClick={() => setShowApiKey(showApiKey === wallet.id ? null : wallet.id)}
                            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium"
                          >
                            {showApiKey === wallet.id ? 'Hide' : 'Show'} API Key
                          </button>
                          {showApiKey === wallet.id && (
                            <div className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-400 font-mono break-all">
                              {wallet.privateKey}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'custom-presets' && (
                <div className="space-y-6">
                  {/* Description */}
                  <p className="text-gray-400 text-center italic">
                    Create custom deploy presets with keybinds for quick deployment
                  </p>

                  {/* Action Buttons Row */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPresetForm(true)}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                    >
                      + Add New Preset
                    </button>
                    
                    <button
                      onClick={() => {
                        // Export presets to JSON file
                        const dataStr = JSON.stringify(presets, null, 2);
                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `custom-presets-${Date.now()}.json`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                      title="Export Presets"
                    >
                      <Download size={20} />
                      Export
                    </button>
                    
                    <button
                      onClick={() => {
                        // Import presets from JSON file
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'application/json';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const importedPresets = JSON.parse(event.target?.result as string);
                                if (Array.isArray(importedPresets)) {
                                  // Merge with existing presets (avoid ID conflicts)
                                  const newPresets = importedPresets.map(p => ({
                                    ...p,
                                    id: Date.now().toString() + Math.random()
                                  }));
                                  onPresetsChange([...presets, ...newPresets]);
                                  alert(`Successfully imported ${newPresets.length} preset(s)!`);
                                } else {
                                  alert('Invalid preset file format!');
                                }
                              } catch (error) {
                                alert('Failed to parse preset file!');
                              }
                            };
                            reader.readAsText(file);
                          }
                        };
                        input.click();
                      }}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                      title="Import Presets"
                    >
                      <UploadCloud size={20} />
                      Import
                    </button>
                  </div>

                  {/* Presets List */}
                  {presets.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {presets.map((preset) => (
                        <div key={preset.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-white font-bold">{preset.name}</h4>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  // Duplicate preset
                                  const duplicatedPreset = {
                                    ...preset,
                                    id: Date.now().toString(),
                                    name: `${preset.name} (Copy)`,
                                    keybind: '' // Clear keybind to avoid conflicts
                                  };
                                  onPresetsChange([...presets, duplicatedPreset]);
                                }}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Duplicate Preset"
                              >
                                <Copy size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPresetId(preset.id);
                                  setNewPreset(preset);
                                  setShowPresetForm(true);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Edit Preset"
                              >
                                <Settings size={18} />
                              </button>
                              <button
                                onClick={() => onPresetsChange(presets.filter(p => p.id !== preset.id))}
                                className="text-red-500 hover:text-red-400"
                                title="Delete Preset"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-400">Prefix: <span className="text-white">{preset.namePrefix || 'None'}</span></p>
                            <p className="text-gray-400">Suffix: <span className="text-white">{preset.nameSuffix || 'None'}</span></p>
                            <p className="text-gray-400">Platform: <span className="text-white">{preset.deployPlatform}</span></p>
                            <p className="text-gray-400">Keybind: <span className="text-blue-400 font-mono">{preset.keybind || 'Not Set'}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab !== 'wallets' && activeTab !== 'custom-presets' && (
                <div className="text-center text-gray-400 py-12">
                  <p>Content for {activeTab} will be added here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Preset Form Modal */}
      {showPresetForm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-2 text-center">{editingPresetId ? 'Edit Preset' : 'Add New Preset'}</h3>
            <p className="text-gray-400 text-sm text-center mb-6 italic">
              {editingPresetId ? 'Update your custom deploy preset' : 'Create custom deploy presets with keybinds for quick deployment'}
            </p>
            
            {/* Preset Name */}
            <div className="mb-4">
              <label className="text-white text-sm font-medium mb-2 block">Preset Name</label>
              <input
                type="text"
                placeholder="e.g., COIN OF AMERICA"
                value={newPreset.name}
                onChange={(e) => setNewPreset({...newPreset, name: e.target.value})}
                className="w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Name Prefix and Suffix */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Name Prefix</label>
                <input
                  type="text"
                  placeholder="e.g., Justice For"
                  value={newPreset.namePrefix}
                  onChange={(e) => setNewPreset({...newPreset, namePrefix: e.target.value})}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Name Suffix</label>
                <input
                  type="text"
                  placeholder="e.g., ification"
                  value={newPreset.nameSuffix}
                  onChange={(e) => setNewPreset({...newPreset, nameSuffix: e.target.value})}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Deploy Platform */}
            <div className="mb-4">
              <label className="text-white text-sm font-medium mb-2 block">Deploy Platform</label>
              <select
                value={newPreset.deployPlatform}
                onChange={(e) => setNewPreset({...newPreset, deployPlatform: e.target.value})}
                className="w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option>Use Account Default</option>
                <option>Pump.fun</option>
                <option>Jupiter</option>
                <option>Binance</option>
                <option>USD1</option>
                <option>BONK</option>
              </select>
            </div>

            {/* Ticker Mode */}
            <div className="mb-4">
              <label className="text-white text-sm font-medium mb-2 block">Ticker Mode</label>
              <select
                value={newPreset.tickerMode}
                onChange={(e) => setNewPreset({...newPreset, tickerMode: e.target.value})}
                className="w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option>Selected Text</option>
                <option>Abbreviation</option>
                <option>First Word</option>
                <option>Custom</option>
              </select>
            </div>

            {/* Image Type */}
            <div className="mb-4">
              <label className="text-white text-sm font-medium mb-2 block">Image Type</label>
              <select
                value={newPreset.imageType}
                onChange={(e) => setNewPreset({...newPreset, imageType: e.target.value})}
                className="w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option>Image in Post</option>
                <option>ASCII Art</option>
                <option>SOL ASCII (Gradient)</option>
                <option>Letter Image</option>
                <option>Custom Image</option>
              </select>
            </div>

            {/* Keybind */}
            <div className="mb-6">
              <label className="text-white text-sm font-medium mb-2 block">Keybind</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsCapturingKeybind(true);
                    // Capture next keypress
                    const handleKeyPress = (e: KeyboardEvent) => {
                      e.preventDefault();
                      
                      // Ignore if only modifier keys are pressed
                      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
                        return;
                      }
                      
                      const key = e.key.toUpperCase();
                      const modifiers = [];
                      if (e.ctrlKey) modifiers.push('Ctrl');
                      if (e.altKey) modifiers.push('Alt');
                      if (e.shiftKey) modifiers.push('Shift');
                      
                      const keybind = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
                      setNewPreset({...newPreset, keybind});
                      setIsCapturingKeybind(false);
                      document.removeEventListener('keydown', handleKeyPress);
                    };
                    document.addEventListener('keydown', handleKeyPress);
                  }}
                  className={`flex-1 py-2 ${isCapturingKeybind ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 text-white rounded font-medium transition-colors`}
                >
                  {isCapturingKeybind ? 'Press any key...' : (newPreset.keybind || 'Not Set')}
                </button>
                <button
                  onClick={() => setNewPreset({...newPreset, keybind: ''})}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPresetForm(false);
                  setEditingPresetId(null);
                  setNewPreset({
                    id: '',
                    name: '',
                    namePrefix: '',
                    nameSuffix: '',
                    deployPlatform: 'Use Account Default',
                    tickerMode: 'Selected Text',
                    imageType: 'Image in Post',
                    keybind: ''
                  });
                  setIsCapturingKeybind(false);
                }}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newPreset.name) {
                    if (editingPresetId) {
                      // Update existing preset
                      const updatedPresets = presets.map(p => 
                        p.id === editingPresetId ? { ...newPreset, id: editingPresetId } : p
                      );
                      onPresetsChange(updatedPresets);
                    } else {
                      // Create new preset
                      const preset = { ...newPreset, id: Date.now().toString() };
                      onPresetsChange([...presets, preset]);
                    }
                    setShowPresetForm(false);
                    setEditingPresetId(null);
                    setNewPreset({
                      id: '',
                      name: '',
                      namePrefix: '',
                      nameSuffix: '',
                      deployPlatform: 'Use Account Default',
                      tickerMode: 'Selected Text',
                      imageType: 'Image in Post',
                      keybind: ''
                    });
                  }
                }}
                className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-medium"
              >
                {editingPresetId ? 'Update Preset' : 'Save Preset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Wallet Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Import Wallet</h3>
            
            <div className="mb-4">
              <label className="text-white text-sm font-medium mb-2 block">Wallet Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setImportType('solana')}
                  className={`flex-1 py-2 rounded font-medium ${
                    importType === 'solana'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  Solana
                </button>
                <button
                  onClick={() => setImportType('evm')}
                  className={`flex-1 py-2 rounded font-medium ${
                    importType === 'evm'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  EVM
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-white text-sm font-medium mb-2 block">Private Key</label>
              <textarea
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleImportWallet();
                  }
                }}
                placeholder="Enter your private key..."
                className="w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 text-sm focus:outline-none focus:border-blue-500 min-h-[100px] font-mono"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setPrivateKeyInput("");
                }}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleImportWallet}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
