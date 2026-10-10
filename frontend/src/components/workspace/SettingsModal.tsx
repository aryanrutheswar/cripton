import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyConfigured?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onKeyConfigured,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [model, setModel] = useState('gemini-3.8-flash');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    try {
      const health = await api.getHealth();
      setHasKey(health.has_api_key);
      setModel(health.model);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await api.setApiKey(apiKey.trim());
      setStatusMessage({ type: 'success', text: 'API key saved securely in backend!' });
      setHasKey(true);
      setApiKey('');
      if (onKeyConfigured) onKeyConfigured();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save API key' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMessage(null);
    try {
      const health = await api.getHealth();
      if (health.has_api_key) {
        setStatusMessage({ type: 'success', text: `Backend connected & ready with ${health.model}!` });
      } else {
        setStatusMessage({ type: 'error', text: 'Backend is online, but no API key is configured yet.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Could not connect to FastAPI backend.' });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#344536]/25 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white/95 border border-[#DCE8D5] shadow-xl p-6 sm:p-8 space-y-6 text-[#344536] backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#DCE8D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE8D5]/50 border border-[#DCE8D5] flex items-center justify-center text-[#596B3D]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#344536]">
                Workspace Settings
              </h3>
              <p className="text-xs text-[#596B3D]">
                AI Engine & Google Gemini Configuration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#89966A] hover:text-[#344536] hover:bg-[#FAFAF4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Badge */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
          hasKey
            ? 'bg-[#DCE8D5]/40 border-[#89966A] text-[#344536]'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {hasKey ? (
              <CheckCircle2 className="w-4 h-4 text-[#596B3D] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>
              {hasKey
                ? 'Gemini API Key is Active & Configured'
                : 'Action Required: Gemini API Key Not Configured'}
            </span>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="text-[11px] font-semibold underline hover:opacity-80 transition-opacity cursor-pointer text-[#596B3D]"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {/* Form to enter/update Key */}
        <form onSubmit={handleSaveKey} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#344536] mb-1.5 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[#596B3D] hover:underline flex items-center gap-1 font-normal text-[11px]"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your AI Studio API key (AIzaSy...)"
                className="w-full px-4 py-2.5 rounded-xl border border-[#DCE8D5] focus:border-[#89966A] focus:ring-2 focus:ring-[#B7E4A5]/30 text-xs font-mono text-[#344536] placeholder:text-[#89966A]/60 focus:outline-none bg-white"
              />
            </div>
            <p className="text-[11px] text-[#89966A] mt-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#89966A]" />
              Your key is saved to the local backend environment and never exposed to the client bundle.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#344536] mb-1.5">
              Active Gemini Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8D5] text-xs font-medium text-[#344536] bg-white focus:outline-none focus:border-[#89966A]"
            >
              <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Fastest ~3s response)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash (Standard)</option>
              <option value="gemini-flash-latest">gemini-flash-latest (Auto-updating)</option>
            </select>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs ${
              statusMessage.type === 'success'
                ? 'bg-[#DCE8D5]/50 text-[#344536] border border-[#89966A]'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {statusMessage.text}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#DCE8D5] hover:bg-[#FAFAF4] text-xs font-medium text-[#344536] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="px-5 py-2 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] disabled:opacity-40 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
              <span>Save & Apply Key</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
