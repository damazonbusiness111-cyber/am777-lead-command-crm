import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import Icon from './Icon';

export default function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied(true);
      showToast('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast('Could not copy — select and copy manually', 'error');
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand-light px-3 py-1.5 text-xs font-medium text-brand-dark hover:bg-brand/10 transition-colors"
    >
      <Icon name={copied ? 'check' : 'copy'} className="w-3.5 h-3.5" />
      {copied ? 'Copied' : label}
    </button>
  );
}
