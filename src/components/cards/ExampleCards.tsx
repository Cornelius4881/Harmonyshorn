import React from 'react';
import { Heart, Star } from 'lucide-react';

export default function ExampleCards() {
  const examples = [
    {
      id: 1,
      title: "Birthday Blessings",
      image: "https://images.unsplash.com/photo-1464347744102-11db6282f854?auto=format&fit=crop&w=800&q=80",
      verse: "May the Lord bless you and keep you...",
      category: "Birthday"
    },
    {
      id: 2,
      title: "Easter Joy",
      image: "https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=800&q=80",
      verse: "He is risen!",
      category: "Holiday"
    },
    {
      id: 3,
      title: "Encouragement",
      image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80",
      verse: "Be strong and courageous...",
      category: "Encouragement"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-500/10 to-amber-200/10 rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <Heart className="text-emerald-500 h-6 w-6" />
          <h2 className="text-2xl font-bold text-center text-gray-800">Example Cards</h2>
          <Star className="text-amber-400 h-6 w-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((card) => (
            <div key={card.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative aspect-video">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-center font-script text-xl px-4">
                    {card.verse}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}