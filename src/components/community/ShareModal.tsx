import React from 'react';
import { Copy, Facebook, Twitter } from 'lucide-react';

interface ShareModalProps {
  content: {
    id: string;
    type: string;
    content: any;
  };
  onClose: () => void;
}

export function ShareModal({ content, onClose }: ShareModalProps) {
  const shareUrl = `${window.location.origin}/share/${content.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (platform: string) => {
    let url = '';
    const text = encodeURIComponent("Check out this inspiring content from Harmony's Horn!");

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Share</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
            />
            <button
              onClick={handleCopy}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <Facebook className="h-5 w-5" />
              <span>Facebook</span>
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600"
            >
              <Twitter className="h-5 w-5" />
              <span>Twitter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}