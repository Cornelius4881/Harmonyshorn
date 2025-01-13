import React from 'react';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useAuthStore } from '../../store/authStore';

export function PremiumStore() {
  const { premiumContent, purchaseContent } = useSubscriptionStore();
  const { isGuest } = useAuthStore();

  const handlePurchase = async (contentId: string) => {
    if (isGuest) {
      alert('Please sign in to make purchases');
      return;
    }

    try {
      await purchaseContent(contentId);
      alert('Purchase successful!');
    } catch (error) {
      alert('Failed to complete purchase. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#2E8B57] mb-6">Premium Store</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {premiumContent.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2E8B57]">
                  ${(item.price / 100).toFixed(2)}
                </span>
                <button
                  onClick={() => handlePurchase(item.id)}
                  className="bg-[#F1C27D] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Purchase
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isGuest && (
        <p className="text-sm text-gray-500 mt-6 text-center">
          Sign in to purchase premium content
        </p>
      )}
    </div>
  );
}