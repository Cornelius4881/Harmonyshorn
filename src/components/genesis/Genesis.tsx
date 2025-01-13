import React, { useState } from 'react';
import { Sparkles, Grid, List, Plus, Upload, FileText, Share2, Search, Palette, Clock, Settings, HelpCircle, Filter } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Creation {
  id: string;
  title: string;
  type: 'image' | 'logo' | 'animation';
  thumbnail: string;
  lastModified: string;
}

export default function Genesis() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();

  const handleNewCreation = () => {
    // Handle new creation logic
    console.log('New creation clicked');
  };

  const mockCreations: Creation[] = [
    {
      id: '1',
      title: 'Morning Prayer',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=800&q=80',
      lastModified: '2024-01-15'
    },
    {
      id: '2',
      title: 'Faith Journey',
      type: 'logo',
      thumbnail: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80',
      lastModified: '2024-01-14'
    },
    {
      id: '3',
      title: 'Hope Rises',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      lastModified: '2024-01-13'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">Genesis</h2>
          <p className="text-gray-600 dark:text-gray-400">Bring Your Creations to Life</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <button
          onClick={handleNewCreation}
          className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Creation</span>
        </button>
        
        <button className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <Upload className="h-5 w-5" />
          <span>Upload</span>
        </button>
        
        <button className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <FileText className="h-5 w-5" />
          <span>Templates</span>
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-600"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {mockCreations.map((creation) => (
          <div key={creation.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group">
            <div className="relative aspect-video">
              <img
                src={creation.thumbnail}
                alt={creation.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                <button className="p-2 bg-white rounded-full text-gray-700 hover:text-emerald-500">
                  <Settings className="h-5 w-5" />
                </button>
                <button className="p-2 bg-white rounded-full text-gray-700 hover:text-emerald-500">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{creation.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last modified: {creation.lastModified}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Help Button */}
      <button className="fixed bottom-20 right-6 p-3 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors">
        <HelpCircle className="h-6 w-6" />
      </button>
    </div>
  );
}