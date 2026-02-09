import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Header logo displayed on top-level tab layout only.
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        {/* Uses the existing app icon; replace `icon.png` with your provided logo file if desired. */}
        <Image
          source={require('@/assets/images/efforix-klean.png')}
          style={styles.logo}
          contentFit="contain"
          accessible
          accessibilityLabel="Efforix Klean logo"
        />
      </View>

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Browse',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: 'Bookings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="track"
          options={{
            title: 'Track',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="location.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  logo: {
    maxWidth: 140,
    height: 40,
    alignSelf: 'center',
  },
});

