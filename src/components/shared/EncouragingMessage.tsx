import React from 'react';
import { Heart, Star } from 'lucide-react';

interface EncouragingMessage {
  message: string;
  verse?: string;
}

const messages: EncouragingMessage[] = [
  {
    message: "Remember, you are cherished and loved beyond measure",
    verse: "Jeremiah 31:3",
  },
  {
    message: "Your faith can move mountains",
    verse: "Matthew 17:20",
  },
  {
    message: "God's love for you is endless and unchanging",
    verse: "Romans 8:38-39",
  },
];

export function EncouragingMessage() {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="bg-gradient-to-r from-[#2E8B57]/10 to-[#F1C27D]/10 rounded-lg p-6 my-8">
      <div className="flex items-center justify-between mb-3">
        <Heart className="text-[#2E8B57] h-5 w-5" />
        <Star className="text-[#F1C27D] h-5 w-5" />
      </div>
      <p className="text-center font-script text-xl text-gray-700 mb-2">
        {randomMessage.message}
      </p>
      {randomMessage.verse && (
        <p className="text-center text-sm text-gray-500 italic">
          - {randomMessage.verse}
        </p>
      )}
    </div>
  );
}