import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface Comment {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  user_email?: string;
}

interface CommentModalProps {
  content: {
    id: string;
    type: string;
    content: any;
  };
  onClose: () => void;
  onComment: () => void;
}

export function CommentModal({ content, onClose, onComment }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchComments();
  }, [content.id]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_email:auth.users(email)
        `)
        .eq('content_id', content.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content_id: content.id,
            text: newComment.trim(),
          },
        ]);

      if (error) throw error;
      setNewComment('');
      await fetchComments();
      onComment();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Comments</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {comments.map((comment) => (
            <div key={comment.id} className="mb-4 last:mb-0">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {comment.user_email?.[0]?.email?.split('@')[0] || 'Anonymous'}
                  </p>
                  <p className="text-gray-600">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent resize-none"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="bg-[#2E8B57] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}