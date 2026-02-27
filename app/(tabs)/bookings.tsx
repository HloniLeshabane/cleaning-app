import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { Booking } from '@/types/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
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

  // Edit modal state
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editNotes, setEditNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const openEditModal = (booking: Booking) => {
    setEditBooking(booking);
    setEditDate(new Date(booking.scheduled_at));
    setEditNotes(booking.notes ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editBooking) return;
    setIsSaving(true);
    try {
      await apiClient.updateBooking(editBooking.id, {
        scheduledAt: editDate.toISOString(),
        notes: editNotes,
      });
      setEditBooking(null);
      await loadBookings();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
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
              // When a cleaner has been offered the job but hasn't accepted yet
              const offerSent = booking.status === 'PENDING' && !!booking.cleaner_id;
              const statusColor = offerSent ? '#f59e0b' : (statusColors[booking.status] || '#9E9E9E');
              const statusLabel = offerSent ? 'Offer Sent' : (statusLabels[booking.status] || booking.status);
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
                        {statusLabel}
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
                  {['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status) && (
                    <Pressable
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                      onPress={() => router.push('/(tabs)/track')}>
                      <ThemedText style={styles.actionButtonText}>Track Cleaner</ThemedText>
                    </Pressable>
                  )}

                  {/* Edit — only while PENDING and no cleaner assigned yet */}
                  {booking.status === 'PENDING' && !booking.cleaner_id && (
                    <Pressable
                      style={[styles.outlineButton, { borderColor: colors.primary }]}
                      onPress={() => openEditModal(booking)}>
                      <ThemedText style={[styles.outlineButtonText, { color: colors.primary }]}>✏️ Edit Booking</ThemedText>
                    </Pressable>
                  )}

                  {/* Cancel */}
                  {['PENDING', 'MATCHED', 'ACCEPTED'].includes(booking.status) && (
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

      {/* Edit Booking Modal */}
      <Modal visible={!!editBooking} transparent animationType="slide" onRequestClose={() => setEditBooking(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setEditBooking(null)} />
        <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Edit Booking</ThemedText>
          <ThemedText style={[styles.modalHint, { color: colors.icon }]}>
            Changes are only allowed while the booking is pending.
          </ThemedText>

          {/* Date & Time */}
          <ThemedText style={[styles.modalLabel, { color: colors.text }]}>Date &amp; Time</ThemedText>
          <Pressable
            style={[styles.modalDateBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => setShowDatePicker(true)}>
            <ThemedText style={{ color: colors.text }}>
              {editDate.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' })}
              {'  '}
              {editDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={editDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setEditDate(date);
              }}
            />
          )}

          {/* Notes */}
          <ThemedText style={[styles.modalLabel, { color: colors.text }]}>Notes</ThemedText>
          <TextInput
            style={[styles.modalInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            value={editNotes}
            onChangeText={setEditNotes}
            placeholder="Any special instructions..."
            placeholderTextColor={colors.icon}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <Pressable
              style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              onPress={() => setEditBooking(null)}>
              <ThemedText style={{ color: colors.text, fontWeight: '600' }}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.modalSaveBtn, { backgroundColor: colors.primary, opacity: isSaving ? 0.6 : 1 }]}
              onPress={handleSaveEdit}
              disabled={isSaving}>
              <ThemedText style={{ color: '#fff', fontWeight: '700' }}>{isSaving ? 'Saving…' : 'Save Changes'}</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalHint: {
    fontSize: 13,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modalDateBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
  },
});
