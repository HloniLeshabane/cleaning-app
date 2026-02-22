import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TrackCleanerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const cleaner = {
    name: 'Sarah Johnson',
    rating: 4.8,
    phone: '+27 12 345 6789',
    eta: '15 minutes',
    status: 'On the way',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Track Cleaner</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.icon }]}>
            Real-time tracking of your cleaner
          </ThemedText>
        </View>

        {/* Map Placeholder */}
        <View style={[styles.mapContainer, { borderColor: colors.border, shadowColor: colors.shadow }]}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: -26.1076, // Default to Johannesburg area
              longitude: 28.0567,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {/* Customer Location */}
            <Marker
              coordinate={{ latitude: -26.1076, longitude: 28.0567 }}
              title="Your Location"
              description="123 Main St"
              pinColor={colors.primary}
            />
            
            {/* Cleaner Location (Simulated) */}
            <Marker
              coordinate={{ latitude: -26.1276, longitude: 28.0367 }}
              title={cleaner.name}
              description="On the way"
              pinColor="#2A9D8F"
            />
          </MapView>
          
          <View style={[styles.etaOverlay, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.etaLabel, { color: colors.icon }]}>ETA</ThemedText>
            <ThemedText style={[styles.etaValue, { color: colors.primary }]}>{cleaner.eta}</ThemedText>
          </View>
        </View>

        {/* Cleaner Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <View style={styles.cleanerRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.avatarText}>
                {cleaner.name.split(' ').map((n) => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={styles.cleanerInfo}>
              <ThemedText style={[styles.cleanerName, { color: colors.text }]}>{cleaner.name}</ThemedText>
              <ThemedText style={[styles.cleanerRating, { color: colors.icon }]}>⭐ {cleaner.rating} rating</ThemedText>
            </View>
            <View style={[styles.statusPill, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
              <ThemedText style={[styles.statusPillText, { color: colors.primary }]}>{cleaner.status}</ThemedText>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.iconBg, borderColor: colors.border }]}
              onPress={() => {}}>
              <ThemedText style={[styles.actionButtonText, { color: colors.text }]}>📞 Call</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => {}}>
              <ThemedText style={[styles.actionButtonText, { color: '#FFFFFF' }]}>💬 Message</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Service Details */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>Service Details</ThemedText>

          {[
            { label: '📅 Date', value: 'Today, 2:00 PM' },
            { label: '🏠 Service', value: 'Standard Cleaning' },
            { label: '⏱️ Duration', value: '2–3 hours' },
            { label: '📍 Address', value: '123 Main St, Johannesburg' },
          ].map((row, i) => (
            <View key={i} style={[styles.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <ThemedText style={[styles.detailLabel, { color: colors.icon }]}>{row.label}</ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>{row.value}</ThemedText>
            </View>
          ))}
        </View>

        {/* Cancel */}
        <Pressable
          style={[styles.cancelButton, { borderColor: colors.error }]}
          onPress={() => {}}>
          <ThemedText style={[styles.cancelButtonText, { color: colors.error }]}>Cancel Service</ThemedText>
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
    paddingBottom: 16,
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
  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    height: 260,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  etaOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  etaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  etaValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cleanerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  cleanerInfo: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  cleanerRating: {
    fontSize: 13,
  },
  statusPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 100,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  cancelButton: {
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
