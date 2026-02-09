import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

const bookings = [
  {
    id: '1',
    service: 'Standard Cleaning',
    cleaner: 'Sarah Johnson',
    date: 'Today, 2:00 PM',
    status: 'In Progress',
    statusColor: '#2A9D8F',
  },
  {
    id: '2',
    service: 'Deep Cleaning',
    cleaner: 'Michael Chen',
    date: 'Tomorrow, 10:00 AM',
    status: 'Upcoming',
    statusColor: '#FF6B35',
  },
  {
    id: '3',
    service: 'Office Cleaning',
    cleaner: 'Emma Wilson',
    date: 'Dec 15, 3:00 PM',
    status: 'Completed',
    statusColor: '#4CAF50',
  },
];

export default function BookingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            My Bookings
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            View and manage your cleaning services
          </ThemedText>
        </View>

        {/* Bookings List */}
        <View style={styles.bookingsList}>
          {bookings.map((booking) => (
            <Pressable
              key={booking.id}
              style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => booking.status === 'In Progress' && router.push('/(tabs)/track')}>
              <View style={styles.bookingHeader}>
                <ThemedText type="subtitle" style={styles.serviceName}>
                  {booking.service}
                </ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: booking.statusColor }]}>
                  <ThemedText style={styles.statusText}>{booking.status}</ThemedText>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailIcon}>👤</ThemedText>
                  <ThemedText style={styles.detailText}>{booking.cleaner}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailIcon}>📅</ThemedText>
                  <ThemedText style={styles.detailText}>{booking.date}</ThemedText>
                </View>
              </View>

              {booking.status === 'In Progress' && (
                <Pressable
                  style={[styles.trackButton, { backgroundColor: colors.secondary }]}
                  onPress={() => router.push('/(tabs)/track')}>
                  <ThemedText style={styles.trackButtonText}>Track Cleaner</ThemedText>
                </Pressable>
              )}

              {booking.status === 'Upcoming' && (
                <View style={styles.actionButtons}>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {}}>
                    <ThemedText style={styles.actionBtnText}>Reschedule</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: colors.error }]}
                    onPress={() => {}}>
                    <ThemedText style={styles.actionBtnText}>Cancel</ThemedText>
                  </Pressable>
                </View>
              )}

              {booking.status === 'Completed' && (
                <Pressable
                  style={[styles.reviewButton, { borderColor: colors.primary }]}
                  onPress={() => router.push('/review')}>
                  <ThemedText style={[styles.reviewButtonText, { color: colors.primary }]}>
                    Write Review
                  </ThemedText>
                </Pressable>
              )}
            </Pressable>
          ))}
        </View>

        {/* Book New Service Button */}
        <Pressable
          style={[styles.newBookingButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)')}>
          <ThemedText style={styles.newBookingButtonText}>+ Book New Service</ThemedText>
        </Pressable>
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
    padding: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  bookingsList: {
    padding: 20,
    gap: 16,
  },
  bookingCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceName: {
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.8,
  },
  trackButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  reviewButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  reviewButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  newBookingButton: {
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  newBookingButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
