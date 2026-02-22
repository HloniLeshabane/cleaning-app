import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const menuItems = [
  { icon: '👤', title: 'Personal Information', subtitle: 'Edit your profile details' },
  { icon: '💳', title: 'Payment Methods', subtitle: 'Manage your payment options' },
  { icon: '📍', title: 'Saved Addresses', subtitle: 'Manage your service locations' },
  { icon: '🔔', title: 'Notifications', subtitle: 'Manage notification preferences' },
  { icon: '⭐', title: 'My Reviews', subtitle: 'View your service reviews' },
  { icon: '🎁', title: 'Promotions & Offers', subtitle: 'View available discounts' },
  { icon: '❓', title: 'Help & Support', subtitle: 'Get help with your bookings' },
  { icon: '⚙️', title: 'Settings', subtitle: 'App preferences' },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bookingCount, setBookingCount] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      apiClient.getBookings()
        .then((data) => setBookingCount(data.length))
        .catch(() => {});
    } else {
      setBookingCount(null);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to log out.');
          }
        },
      },
    ]);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    return '?';
  };

  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User' : 'Guest';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header / Avatar */}
        <View style={[styles.headerSection, { paddingTop: insets.top + 16 }]}>
          {isAuthenticated && user ? (
            <>
              <View style={[styles.avatar, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}>
                <ThemedText style={styles.avatarText}>{getInitials(user.firstName, user.lastName)}</ThemedText>
              </View>
              <ThemedText style={[styles.userName, { color: colors.text }]}>{fullName}</ThemedText>
              <ThemedText style={[styles.userEmail, { color: colors.icon }]}>{user.email}</ThemedText>
              {user.phone ? (
                <ThemedText style={[styles.userPhone, { color: colors.icon }]}>{user.phone}</ThemedText>
              ) : null}
            </>
          ) : (
            <>
              <View style={[styles.avatar, { backgroundColor: colors.iconBg }]}>
                <ThemedText style={[styles.avatarText, { color: colors.primary }]}>?</ThemedText>
              </View>
              <ThemedText style={[styles.userName, { color: colors.text }]}>Guest</ThemedText>
              <ThemedText style={[styles.userEmail, { color: colors.icon }]}>Not logged in</ThemedText>
              <Pressable
                style={[styles.loginButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
                onPress={() => router.push('/modal')}>
                <ThemedText style={styles.loginButtonText}>Log In</ThemedText>
              </Pressable>
            </>
          )}
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
              {bookingCount !== null ? bookingCount : '—'}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.icon }]}>Bookings</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>—</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.icon }]}>Avg Rating</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>—</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.icon }]}>Saved</ThemedText>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => {}}>
              <View style={[styles.menuIconBox, { backgroundColor: colors.iconBg }]}>
                <ThemedText style={styles.menuIconText}>{item.icon}</ThemedText>
              </View>
              <View style={styles.menuTexts}>
                <ThemedText style={[styles.menuTitle, { color: colors.text }]}>{item.title}</ThemedText>
                <ThemedText style={[styles.menuSubtitle, { color: colors.icon }]}>{item.subtitle}</ThemedText>
              </View>
              <ThemedText style={[styles.menuArrow, { color: colors.icon }]}>›</ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        {isAuthenticated && (
          <Pressable
            style={[styles.logoutButton, { borderColor: colors.error }]}
            onPress={handleLogout}>
            <ThemedText style={[styles.logoutButtonText, { color: colors.error }]}>Log Out</ThemedText>
          </Pressable>
        )}

        <ThemedText style={[styles.version, { color: colors.icon }]}>Version 1.0.0</ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
  },
  loginButton: {
    marginTop: 16,
    paddingVertical: 13,
    paddingHorizontal: 36,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 16,
    shadowColor: '#FF974F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuIconText: {
    fontSize: 20,
  },
  menuTexts: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
  },
  menuArrow: {
    fontSize: 22,
    fontWeight: '300',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 40,
  },
});
