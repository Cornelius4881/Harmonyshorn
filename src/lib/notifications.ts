export const notifications = {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  async scheduleNotification(title: string, options: NotificationOptions, delay: number) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    setTimeout(() => {
      new Notification(title, options);
    }, delay);
  },

  async sendDailyScripture() {
    const scriptures = [
      { verse: 'John 3:16', text: 'For God so loved the world...' },
      { verse: 'Psalm 23:1', text: 'The Lord is my shepherd...' },
      // Add more scriptures
    ];

    const scripture = scriptures[Math.floor(Math.random() * scriptures.length)];
    
    await this.scheduleNotification(
      'Daily Scripture',
      {
        body: `${scripture.verse}: ${scripture.text}`,
        icon: '/icon.png',
      },
      0
    );
  }
};