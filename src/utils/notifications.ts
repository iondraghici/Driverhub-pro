/**
 * Utility functions for browser Web Notifications API
 */

export const isWebNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isWebNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestWebNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!isWebNotificationSupported()) return 'unsupported';

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting Web Notification permission:', err);
    return Notification.permission;
  }
};

export const dispatchWebNotification = (
  title: string,
  options?: NotificationOptions
): boolean => {
  if (!isWebNotificationSupported()) return false;

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: 'https://cdn-icons-png.flaticon.com/512/2099/2099058.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/2099/2099058.png',
        dir: 'auto',
        lang: 'en-US',
        requireInteraction: false,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (err) {
      console.warn('Could not trigger browser notification:', err);
      return false;
    }
  }

  return false;
};
