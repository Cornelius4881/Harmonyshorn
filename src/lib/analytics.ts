// Simple analytics wrapper
export const analytics = {
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    // In a production environment, you would integrate with a real analytics service
    console.log('Analytics Event:', eventName, properties);
  },

  trackPageView: (pageName: string) => {
    console.log('Page View:', pageName);
  },

  trackError: (error: Error) => {
    console.error('Error:', error);
  },

  trackFeatureUsage: (featureName: string) => {
    console.log('Feature Used:', featureName);
  },
};