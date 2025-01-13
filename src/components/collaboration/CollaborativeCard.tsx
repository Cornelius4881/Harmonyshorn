import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Users, Save, Share2 } from 'lucide-react';

interface Collaborator {
  user_id: string;
  role: 'editor' | 'viewer';
  user_email?: string;
}

interface CollaborativeCardProps {
  cardId: string;
  onSave: () => void;
}

export function CollaborativeCard({ cardId, onSave }: CollaborativeCardProps) {
  const [content, setContent] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCardData();
    fetchCollaborators();
  }, [cardId]);

  const fetchCardData = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborative_cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (error) throw error;
      setContent(data.content.text || '');
    } catch (error) {
      console.error('Error fetching card:', error);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('card_collaborators')
        .select(`
          *,
          user_email:auth.users(email)
        `)
        .eq('card_id', cardId);

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('collaborative_cards')
        .update({
          content: { text: content },
          updated_at: new Date().toISOString(),
        })
        .eq('id', cardId);

      if (error) throw error;
      onSave();
    } catch (error) {
      console.error('Error saving card:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = collaborators.some(
    (c) => c.user_id === user?.id && c.role === 'editor'
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-[#2E8B57]" />
          <span className="text-sm text-gray-500">
            {collaborators.length} collaborator(s)
          </span>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-1 text-[#2E8B57] hover:text-opacity-80"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
          )}
          <button className="flex items-center space-x-1 text-[#2E8B57] hover:text-opacity-80">
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={!canEdit}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent resize-none"
        rows={6}
        placeholder={
          canEdit
            ? 'Write your message here...'
            : 'You are in view-only mode'
        }
      />

      <div className="mt-4">
        <h4 className="font-semibold text-gray-700 mb-2">Collaborators</h4>
        <div className="space-y-2">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.user_id}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
            >
              <span className="text-gray-700">
                {collaborator.user_email?.[0]?.email?.split('@')[0] || 'Anonymous'}
              </span>
              <span className="text-sm text-gray-500 capitalize">
                {collaborator.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}