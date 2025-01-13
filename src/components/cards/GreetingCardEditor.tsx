import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function GreetingCardEditor() {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-emerald-400 mb-4">Create a Greeting Card</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your message here..."
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
        rows={6}
      />
      <div className="mt-4 flex justify-end">
        <button className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
          Create Card
        </button>
      </div>
    </div>
  );
}