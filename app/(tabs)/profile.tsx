import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Success', 'Logged out successfully');
            } catch (err: any) {
              console.error('Logout failed:', err);
              const errorMsg = err.response?.data?.message || err.message || 'Failed to log out. Please try again.';
              Alert.alert('Error', errorMsg);
            }
          },
        },
      ]
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        {isAuthenticated && user ? (
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.avatarText}>{getInitials(user.fullName)}</ThemedText>
            </View>
            <ThemedText type="title" style={styles.userName}>
              {user.fullName || 'User'}
            </ThemedText>
            <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
            <ThemedText style={styles.userPhone}>{user.phone}</ThemedText>
          </View>
        ) : (
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.avatarText}>?</ThemedText>
            </View>
            <ThemedText type="title" style={styles.userName}>
              Guest
            </ThemedText>
            <ThemedText style={styles.userEmail}>Not logged in</ThemedText>
            <Pressable
              style={[styles.loginPromptButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/modal')}>
              <ThemedText style={styles.loginPromptButtonText}>Log In</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>12</ThemedText>
            <ThemedText style={styles.statLabel}>Bookings</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.statNumber, { color: colors.secondary }]}>4.9</ThemedText>
            <ThemedText style={styles.statLabel}>Avg Rating</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>R 250</ThemedText>
            <ThemedText style={styles.statLabel}>Saved</ThemedText>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {}}>
              <View style={styles.menuItemLeft}>
                <ThemedText style={styles.menuIcon}>{item.icon}</ThemedText>
                <View style={styles.menuTexts}>
                  <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.menuSubtitle}>{item.subtitle}</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.menuArrow}>›</ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Logout Button */}
        {isAuthenticated && (
          <Pressable
            style={[styles.logoutButton, { backgroundColor: colors.error }]}
            onPress={handleLogout}>
            <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
          </Pressable>
        )}

        <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 15,
    opacity: 0.6,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    opacity: 0.5,
  },
  loginPromptButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  loginPromptButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  menu: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuTexts: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  menuArrow: {
    fontSize: 24,
    opacity: 0.3,
  },
  logoutButton: {
    margin: 20,
    marginTop: 0,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 40,
  },
});
