import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ArrowRight, Heart, Share2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { List, AutoSizer } from 'react-virtualized';
import { BibleVerse } from '../../types/bible';
import { useBibleStore } from '../../store/bibleStore';

const categories = [
  'Wisdom',
  'Encouragement',
  'Prayer',
  'Faith',
  'Love',
  'Hope',
  'Strength',
  'Peace',
];

export function BibleLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [translation, setTranslation] = useState('KJV');
  const { user } = useAuthStore();
  const { searchResults, loading, error, searchVerses } = useBibleStore();

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchVerses(searchQuery, translation);
    }
  };

  const renderRow = ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
    const verse = searchResults[index];
    if (!verse) return null;

    return (
      <div key={key} style={style} className="p-4 border-b hover:bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-800">
              {verse.book} {verse.chapter}:{verse.verse}
            </h3>
            <p className="text-gray-600 mt-1">{verse.text}</p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Heart className="h-5 w-5 text-[#2E8B57]" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Share2 className="h-5 w-5 text-[#2E8B57]" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scriptures..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <select
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent"
        >
          <option value="KJV">KJV</option>
          <option value="NIV">NIV</option>
          <option value="ESV">ESV</option>
        </select>
        <button
          onClick={handleSearch}
          className="bg-[#2E8B57] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
        >
          <span>Search</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
            className={`px-4 py-2 rounded-full text-sm ${
              category === selectedCategory
                ? 'bg-[#2E8B57] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2E8B57]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : searchResults.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md h-[600px]">
          <AutoSizer>
            {({ width, height }) => (
              <List
                width={width}
                height={height}
                rowCount={searchResults.length}
                rowHeight={100}
                rowRenderer={renderRow}
              />
            )}
          </AutoSizer>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Search for scriptures or select a category to begin</p>
        </div>
      )}
    </div>
  );
}