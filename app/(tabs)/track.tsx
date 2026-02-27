import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { getSupabaseClient, hasSupabaseConfig } from '@/services/supabase';
import { Booking, CleanerTrackingInfo } from '@/types/api';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_STATUSES: Booking['status'][] = ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'];

const STATUS_LABEL: Partial<Record<Booking['status'], string>> = {
  EN_ROUTE: 'Cleaner En Route',
  ARRIVED: 'Cleaner Has Arrived',
  IN_PROGRESS: 'Cleaning In Progress',
};

const STATUS_COLOR: Partial<Record<Booking['status'], string>> = {
  EN_ROUTE: '#0ea5e9',
  ARRIVED: '#8b5cf6',
  IN_PROGRESS: '#f59e0b',
};

export default function TrackCleanerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tracking, setTracking] = useState<CleanerTrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeBooking = bookings.find((b) => ACTIVE_STATUSES.includes(b.status)) ?? null;

  const fetchTracking = useCallback(async (bookingId: string) => {
    try {
      const info = await apiClient.getBookingTracking(bookingId);
      setTracking(info);
    } catch {
      // Tracking fetch failed — keep previous data
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const data = await apiClient.getBookings();
      setBookings(data);
    } catch {
      Alert.alert('Error', 'Could not load bookings.');
    }
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadBookings();
      setLoading(false);
    })();
  }, [loadBookings]);

  // When active booking changes — set up Supabase Broadcast + 5s polling for EN_ROUTE
  useEffect(() => {
    // Tear down previous subscription/polling
    if (channelRef.current) {
      getSupabaseClient()?.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (!activeBooking) {
      setTracking(null);
      return;
    }

    // Initial tracking fetch
    fetchTracking(activeBooking.id);

    // Supabase Broadcast subscription (instant updates)
    if (hasSupabaseConfig()) {
      const sb = getSupabaseClient();
      if (sb) {
        const channel = sb.channel(`job-tracking:${activeBooking.id}`, {
          config: { broadcast: { ack: false } },
        });
        channel.on('broadcast', { event: 'location' }, ({ payload }) => {
          setTracking((prev) =>
            prev
              ? {
                  ...prev,
                  location: {
                    lat: payload.lat,
                    lng: payload.lng,
                    heading: payload.heading ?? null,
                    speed: payload.speed ?? null,
                    last_updated: payload.timestamp ?? new Date().toISOString(),
                  },
                }
              : prev
          );
        });
        channel.subscribe();
        channelRef.current = channel;
      }
    }

    // 5s polling fallback (runs while EN_ROUTE)
    if (activeBooking.status === 'EN_ROUTE') {
      pollTimerRef.current = setInterval(() => fetchTracking(activeBooking.id), 5000);
    }

    return () => {
      if (channelRef.current) {
        getSupabaseClient()?.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBooking?.id, activeBooking?.status]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    if (activeBooking) await fetchTracking(activeBooking.id);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyWrap, { paddingTop: insets.top + 60 }]}>
          <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>Loading…</ThemedText>
        </View>
      </View>
    );
  }

  if (!activeBooking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[styles.emptyWrap, { paddingTop: insets.top + 60 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
          <ThemedText style={styles.emptyIcon}>🧹</ThemedText>
          <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>No Active Booking</ThemedText>
          <ThemedText style={[styles.emptySub, { color: colors.icon }]}>
            When your cleaner is on the way, you'll be able to track them here in real time.
          </ThemedText>
          <Pressable style={[styles.ghostBtn, { backgroundColor: colors.primary }]} onPress={onRefresh}>
            <ThemedText style={styles.ghostBtnText}>Check Again</ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const chipColor = STATUS_COLOR[activeBooking.status] ?? colors.primary;

  const mapRegion = tracking?.location
    ? { latitude: tracking.location.lat, longitude: tracking.location.lng, latitudeDelta: 0.025, longitudeDelta: 0.025 }
    : tracking?.destination
    ? { latitude: tracking.destination.lat, longitude: tracking.destination.lng, latitudeDelta: 0.06, longitudeDelta: 0.06 }
    : { latitude: -26.1076, longitude: 28.0567, latitudeDelta: 0.06, longitudeDelta: 0.06 };

  const cleanerInitials = `${tracking?.cleaner.first_name?.[0] ?? '?'}${tracking?.cleaner.last_name?.[0] ?? ''}`.toUpperCase();
  const cleanerName = tracking
    ? `${tracking.cleaner.first_name ?? ''} ${tracking.cleaner.last_name ?? ''}`.trim()
    : 'Your Cleaner';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>

        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Track Cleaner</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.icon }]}>Real-time tracking</ThemedText>
        </View>

        {/* Map */}
        <View style={[styles.mapContainer, { borderColor: colors.border }]}>
          <MapView style={styles.map} provider={PROVIDER_GOOGLE} region={mapRegion}>
            {tracking?.destination && (
              <Marker
                coordinate={{ latitude: tracking.destination.lat, longitude: tracking.destination.lng }}
                title="Your Location"
                description={tracking.destination.address}
                pinColor={colors.primary}
              />
            )}
            {tracking?.location && (
              <Marker
                coordinate={{ latitude: tracking.location.lat, longitude: tracking.location.lng }}
                title={cleanerName}
                description="Your cleaner"
                pinColor="#2A9D8F"
              />
            )}
          </MapView>
          <View style={styles.mapTopRow}>
            <View style={[styles.statusChip, { backgroundColor: chipColor }]}>
              <ThemedText style={styles.chipText}>{STATUS_LABEL[activeBooking.status] ?? activeBooking.status}</ThemedText>
            </View>
          </View>
        </View>

        {/* Cleaner card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cleanerRow}>
            <View style={[styles.avatar, { backgroundColor: chipColor }]}>
              <ThemedText style={styles.avatarText}>{cleanerInitials}</ThemedText>
            </View>
            <View style={styles.cleanerInfo}>
              <ThemedText style={[styles.cleanerName, { color: colors.text }]}>{cleanerName}</ThemedText>
              <ThemedText style={[styles.cleanerSub, { color: colors.icon }]}>
                {tracking?.location
                  ? `Updated ${new Date(tracking.location.last_updated).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
                  : 'Location pending…'}
              </ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: chipColor + '22', borderColor: chipColor }]}>
              <ThemedText style={[styles.statusBadgeText, { color: chipColor }]}>
                {activeBooking.status.replace('_', ' ')}
              </ThemedText>
            </View>
          </View>
          <View style={[styles.divider, { borderColor: colors.border }]} />
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.icon }]}>Service</ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>{activeBooking.service?.name ?? '—'}</ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.icon }]}>Amount</ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.primary }]}>
                R {Number(activeBooking.total_amount ?? 0).toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: colors.icon }]}>Time</ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                {new Date(activeBooking.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyWrap: { alignItems: 'center', paddingHorizontal: 40, paddingBottom: 40 },
  emptyIcon: { fontSize: 54, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  ghostBtn: { paddingVertical: 13, paddingHorizontal: 32, borderRadius: 100 },
  ghostBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  header: { paddingHorizontal: 24, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.4, marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  mapContainer: {
    marginHorizontal: 20, marginBottom: 14, height: 270,
    borderRadius: 24, borderWidth: 1.5, overflow: 'hidden', position: 'relative',
  },
  map: { width: '100%', height: '100%' },
  mapTopRow: { position: 'absolute', top: 14, left: 14 },
  statusChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 100 },
  chipText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  card: { marginHorizontal: 20, marginBottom: 14, borderRadius: 20, borderWidth: 1.5, padding: 18 },
  cleanerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cleanerInfo: { flex: 1 },
  cleanerName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  cleanerSub: { fontSize: 12 },
  statusBadge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 100, borderWidth: 1 },
  statusBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  divider: { borderBottomWidth: 1, marginVertical: 14 },
  detailGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 11, letterSpacing: 0.4, marginBottom: 3, textTransform: 'uppercase' },
  detailValue: { fontSize: 14, fontWeight: '600' },
});
