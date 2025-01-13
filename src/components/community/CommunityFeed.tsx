import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, MoreVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { CommentModal } from './CommentModal';
import { ShareModal } from './ShareModal';

interface SharedContent {
  id: string;
  user_id: string;
  type: 'affirmation' | 'card' | 'gif';
  content: {
    text?: string;
    imageUrl?: string;
    verse?: string;
  };
  likes: number;
  created_at: string;
  user_email?: string;
}

export function CommunityFeed() {
  const [content, setContent] = useState<SharedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<SharedContent | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_content')
        .select(`
          *,
          user_email:auth.users(email)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (contentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('shared_content')
        .update({ likes: content.find(c => c.id === contentId)!.likes + 1 })
        .eq('id', contentId);

      if (error) throw error;
      await fetchContent();
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[#2E8B57] mb-6">Community Feed</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2E8B57]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {content.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-800">
                    {item.user_email?.[0]?.email?.split('@')[0] || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {item.type === 'affirmation' && (
                <p className="text-lg font-script mb-4">{item.content.text}</p>
              )}

              {item.type === 'card' && item.content.imageUrl && (
                <img
                  src={item.content.imageUrl}
                  alt="Shared card"
                  className="w-full rounded-lg mb-4"
                />
              )}

              {item.content.verse && (
                <p className="text-gray-600 italic mb-4">{item.content.verse}</p>
              )}

              <div className="flex items-center space-x-4 text-gray-500">
                <button
                  onClick={() => handleLike(item.id)}
                  className="flex items-center space-x-1 hover:text-[#2E8B57]"
                >
                  <Heart className="h-5 w-5" />
                  <span>{item.likes}</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedContent(item);
                    setShowCommentModal(true);
                  }}
                  className="flex items-center space-x-1 hover:text-[#2E8B57]"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Comment</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedContent(item);
                    setShowShareModal(true);
                  }}
                  className="flex items-center space-x-1 hover:text-[#2E8B57]"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCommentModal && selectedContent && (
        <CommentModal
          content={selectedContent}
          onClose={() => setShowCommentModal(false)}
          onComment={fetchContent}
        />
      )}

      {showShareModal && selectedContent && (
        <ShareModal
          content={selectedContent}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}