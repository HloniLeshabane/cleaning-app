import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { Booking } from '@/types/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const statusColors: Record<string, string> = {
  PENDING: '#FF6B00',
  MATCHED: '#FF8A1F',
  ACCEPTED: '#2A9D8F',
  EN_ROUTE: '#2A9D8F',
  ARRIVED: '#2A9D8F',
  IN_PROGRESS: '#2A9D8F',
  COMPLETED: '#4CAF50',
  CANCELLED: '#9E9E9E',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  MATCHED: 'Matched',
  ACCEPTED: 'Confirmed',
  EN_ROUTE: 'En Route',
  ARRIVED: 'Arrived',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function BookingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

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
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setError('Invalid response from server.');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load bookings. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
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
              const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to cancel booking. Please try again.';
              Alert.alert('Error', errorMsg);
            }
          },
        },
      ]
    );
  };

  const formatDateTime = (scheduledAt: string) => {
    const bookingDate = new Date(scheduledAt);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = bookingDate.toDateString();
    const timeStr = bookingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (dateStr === today.toDateString()) return `Today, ${timeStr}`;
    if (dateStr === tomorrow.toDateString()) return `Tomorrow, ${timeStr}`;
    return `${bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>My Bookings</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.icon }]}>
            View and manage your cleaning services
          </ThemedText>
        </View>

        {/* Auth Check */}
        {!isAuthenticated && (
          <View style={styles.centerContent}>
            <ThemedText style={[styles.emptyIcon]}>📅</ThemedText>
            <ThemedText style={[styles.centerText, { color: colors.text }]}>Please log in to view your bookings</ThemedText>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/modal')}>
              <ThemedText style={styles.primaryButtonText}>Log In</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Loading */}
        {isAuthenticated && isLoading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={[styles.centerText, { color: colors.icon }]}>Loading bookings...</ThemedText>
          </View>
        )}

        {/* Error */}
        {isAuthenticated && error && (
          <View style={styles.centerContent}>
            <ThemedText style={[styles.errorText, { color: colors.error }]}>{error}</ThemedText>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={loadBookings}>
              <ThemedText style={styles.primaryButtonText}>Retry</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Empty */}
        {isAuthenticated && !isLoading && !error && bookings.length === 0 && (
          <View style={styles.centerContent}>
            <ThemedText style={styles.emptyIcon}>📅</ThemedText>
            <ThemedText style={[styles.centerText, { color: colors.text }]}>No bookings yet</ThemedText>
            <ThemedText style={[styles.subText, { color: colors.icon }]}>Book your first cleaning service</ThemedText>
          </View>
        )}

        {/* Bookings List */}
        {isAuthenticated && !isLoading && !error && bookings.length > 0 && (
          <View style={styles.bookingsList}>
            {bookings.map((booking) => {
              const statusColor = statusColors[booking.status] || '#9E9E9E';
              return (
                <View
                  key={booking.id}
                  style={[styles.bookingCard, {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                  }]}>

                  {/* Card Header */}
                  <View style={styles.bookingHeader}>
                    <ThemedText style={[styles.serviceName, { color: colors.text }]} numberOfLines={1}>
                      {booking.service?.name || 'Service'}
                    </ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
                      <ThemedText style={[styles.statusText, { color: statusColor }]}>
                        {statusLabels[booking.status]}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={[styles.detailsBlock, { borderColor: colors.border }]}>
                    <View style={styles.detailRow}>
                      <View style={[styles.detailIconBox, { backgroundColor: colors.iconBg }]}>
                        <ThemedText style={styles.detailIconText}>📍</ThemedText>
                      </View>
                      <ThemedText style={[styles.detailText, { color: colors.icon }]} numberOfLines={1}>
                        {booking.location_address}
                      </ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={[styles.detailIconBox, { backgroundColor: colors.iconBg }]}>
                        <ThemedText style={styles.detailIconText}>📅</ThemedText>
                      </View>
                      <ThemedText style={[styles.detailText, { color: colors.icon }]}>
                        {formatDateTime(booking.scheduled_at)}
                      </ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={[styles.detailIconBox, { backgroundColor: colors.iconBg }]}>
                        <ThemedText style={styles.detailIconText}>💰</ThemedText>
                      </View>
                      <ThemedText style={[styles.detailText, { color: colors.primary }]}>
                        R {booking.total_amount}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Track button */}
                  {booking.status === 'IN_PROGRESS' && (
                    <Pressable
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                      onPress={() => router.push('/(tabs)/track')}>
                      <ThemedText style={styles.actionButtonText}>Track Cleaner</ThemedText>
                    </Pressable>
                  )}

                  {/* Cancel */}
                  {['PENDING', 'MATCHED'].includes(booking.status) && (
                    <Pressable
                      style={[styles.outlineButton, { borderColor: colors.error }]}
                      onPress={() => handleCancelBooking(booking.id)}>
                      <ThemedText style={[styles.outlineButtonText, { color: colors.error }]}>Cancel Booking</ThemedText>
                    </Pressable>
                  )}

                  {/* Review */}
                  {booking.status === 'COMPLETED' && (
                    <Pressable
                      style={[styles.outlineButton, { borderColor: colors.primary }]}
                      onPress={() => router.push('/review')}>
                      <ThemedText style={[styles.outlineButtonText, { color: colors.primary }]}>Write Review</ThemedText>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Book New Service */}
        <Pressable
          style={[styles.newBookingButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
          onPress={() => router.push('/(tabs)')}>
          <ThemedText style={styles.newBookingButtonText}>+ Book New Service</ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  bookingsList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  bookingCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
    gap: 14,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsBlock: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailIconText: {
    fontSize: 14,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  actionButton: {
    paddingVertical: 13,
    borderRadius: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  outlineButton: {
    paddingVertical: 11,
    borderRadius: 100,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  outlineButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  newBookingButton: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  newBookingButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  centerContent: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 14,
  },
  centerText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
  },
  primaryButton: {
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 100,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
