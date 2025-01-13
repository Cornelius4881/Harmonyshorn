import React from 'react';
import { BibleLibrary } from './BibleLibrary';
import { useAuthStore } from '../../store/authStore';

export default function Library() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 mb-6">
        Scripture Library
      </h2>
      <BibleLibrary />
    </div>
  );
}