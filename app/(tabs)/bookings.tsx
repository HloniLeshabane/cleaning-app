import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { Booking } from '@/types/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const statusColors: Record<string, string> = {
  pending: '#FF6B35',
  confirmed: '#2A9D8F',
  in_progress: '#2A9D8F',
  completed: '#4CAF50',
  cancelled: '#6B7280',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Upcoming',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function BookingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getBookings();
      console.log('Bookings API response:', data);
      if (Array.isArray(data)) {
        console.log('Booking IDs:', data.map(b => ({ id: b.id, status: b.status })));
        setBookings(data);
      } else {
        console.error('API response is not an array:', data);
        setError('Invalid response from server.');
      }
    } catch (err: any) {
      console.error('Failed to load bookings:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load bookings. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    console.log('Attempting to cancel booking with ID:', bookingId);
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.cancelBooking(bookingId);
              Alert.alert('Success', 'Booking cancelled successfully');
              loadBookings();
            } catch (err: any) {
              console.error('Failed to cancel booking:', err);
              console.error('Cancel error response:', err.response?.data);
              console.error('Cancel error status:', err.response?.status);
              const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to cancel booking. Please try again.';
              Alert.alert('Error', errorMsg);
            }
          },
        },
      ]
    );
  };

  const formatDateTime = (date: string, time: string) => {
    const bookingDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = bookingDate.toDateString();
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();

    if (dateStr === todayStr) {
      return `Today, ${time}`;
    } else if (dateStr === tomorrowStr) {
      return `Tomorrow, ${time}`;
    } else {
      return `${bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`;
    }
  };

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

        {/* Auth Check */}
        {!isAuthenticated && (
          <View style={styles.centerContent}>
            <ThemedText style={styles.centerText}>Please log in to view your bookings</ThemedText>
            <Pressable
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/modal')}>
              <ThemedText style={styles.loginButtonText}>Log In</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Loading State */}
        {isAuthenticated && isLoading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={styles.centerText}>Loading bookings...</ThemedText>
          </View>
        )}

        {/* Error State */}
        {isAuthenticated && error && (
          <View style={styles.centerContent}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.tint }]}
              onPress={loadBookings}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Empty State */}
        {isAuthenticated && !isLoading && !error && bookings.length === 0 && (
          <View style={styles.centerContent}>
            <ThemedText style={styles.emptyIcon}>📅</ThemedText>
            <ThemedText style={styles.centerText}>No bookings yet</ThemedText>
            <ThemedText style={[styles.subText, { opacity: 0.6 }]}>
              Book your first cleaning service
            </ThemedText>
          </View>
        )}

        {/* Bookings List */}
        {isAuthenticated && !isLoading && !error && bookings.length > 0 && (
          <View style={styles.bookingsList}>
            {bookings.map((booking) => (
            <Pressable
              key={booking.id}
              style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => booking.status === 'in_progress' && router.push('/(tabs)/track')}>
              <View style={styles.bookingHeader}>
                <ThemedText type="subtitle" style={styles.serviceName}>
                  {booking.service?.name || 'Service'}
                </ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[booking.status] }]}>
                  <ThemedText style={styles.statusText}>{statusLabels[booking.status]}</ThemedText>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailIcon}>📍</ThemedText>
                  <ThemedText style={styles.detailText} numberOfLines={1}>{booking.address}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailIcon}>📅</ThemedText>
                  <ThemedText style={styles.detailText}>
                    {formatDateTime(booking.booking_date, booking.booking_time)}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailIcon}>💰</ThemedText>
                  <ThemedText style={styles.detailText}>R {booking.total_price}</ThemedText>
                </View>
              </View>

              {booking.status === 'in_progress' && (
                <Pressable
                  style={[styles.trackButton, { backgroundColor: colors.secondary }]}
                  onPress={() => router.push('/(tabs)/track')}>
                  <ThemedText style={styles.trackButtonText}>Track Cleaner</ThemedText>
                </Pressable>
              )}

              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <View style={styles.actionButtons}>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: colors.error }]}
                    onPress={() => handleCancelBooking(booking.id)}>
                    <ThemedText style={styles.actionBtnText}>Cancel Booking</ThemedText>
                  </Pressable>
                </View>
              )}

              {booking.status === 'completed' && (
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
        )}

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
  centerContent: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  centerText: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
