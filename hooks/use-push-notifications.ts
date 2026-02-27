import { apiClient } from '@/services/api';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Remote push notifications are not supported in Expo Go since SDK 53.
// Only attempt registration in a real/development build.
const isExpoGo = Constants.appOwnership === 'expo';

// Handle notifications while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;

    const register = async () => {
      // Remote push notifications are unsupported in Expo Go (SDK 53+).
      if (isExpoGo) {
        console.log('[push] Skipping push registration in Expo Go');
        return;
      }

      try {
        // 1. Request permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('[push] Notification permission denied');
          return;
        }

        // 2. Android notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF6B00',
            sound: 'default',
          });
        }

        // 3. Get Expo push token
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        const tokenData = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        );

        if (!mounted) return;

        // 4. Register with backend
        await apiClient.registerPushToken(tokenData.data);
        console.log('[push] Token registered:', tokenData.data);
      } catch (err: any) {
        console.warn('[push] Registration failed:', err?.message ?? err);
      }
    };

    register();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);
}
