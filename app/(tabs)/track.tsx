import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function TrackCleanerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Mock data for cleaner
  const cleaner = {
    name: 'Sarah Johnson',
    rating: 4.8,
    phone: '+27 12 345 6789',
    eta: '15 minutes',
    status: 'On the way',
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Track Cleaner
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Real-time tracking of your cleaner
          </ThemedText>
        </View>

        {/* Map Placeholder */}
        <View style={[styles.mapPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={styles.mapText}>🗺️</ThemedText>
          <ThemedText style={styles.mapLabel}>Map View</ThemedText>
          <ThemedText style={[styles.etaText, { color: colors.primary }]}>
            ETA: {cleaner.eta}
          </ThemedText>
        </View>

        {/* Cleaner Info Card */}
        <View style={[styles.cleanerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cleanerHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.avatarText}>
                {cleaner.name.split(' ').map(n => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={styles.cleanerInfo}>
              <ThemedText type="subtitle">{cleaner.name}</ThemedText>
              <ThemedText style={styles.rating}>⭐ {cleaner.rating} rating</ThemedText>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: colors.secondary }]}>
            <ThemedText style={styles.statusText}>{cleaner.status}</ThemedText>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => {}}>
              <ThemedText style={styles.actionButtonText}>📞 Call</ThemedText>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => {}}>
              <ThemedText style={styles.actionButtonText}>💬 Message</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Service Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.detailsTitle}>Service Details</ThemedText>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>📅 Date:</ThemedText>
            <ThemedText>Today, 2:00 PM</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>🏠 Service:</ThemedText>
            <ThemedText>Standard Cleaning</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>⏱️ Duration:</ThemedText>
            <ThemedText>2-3 hours</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>📍 Address:</ThemedText>
            <ThemedText style={styles.detailAddress}>123 Main St, Johannesburg</ThemedText>
          </View>
        </View>

        {/* Emergency Button */}
        <Pressable 
          style={[styles.emergencyButton, { backgroundColor: colors.error }]}
          onPress={() => {}}>
          <ThemedText style={styles.emergencyButtonText}>Cancel Service</ThemedText>
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
  mapPlaceholder: {
    margin: 24,
    marginTop: 20,
    height: 280,
    borderRadius: 20,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  mapText: {
    fontSize: 64,
    marginBottom: 12,
  },
  mapLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
  etaText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  cleanerCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cleanerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cleanerInfo: {
    flex: 1,
  },
  rating: {
    marginTop: 4,
    opacity: 0.7,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  detailsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  detailsTitle: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    width: 120,
    opacity: 0.7,
  },
  detailAddress: {
    flex: 1,
  },
  emergencyButton: {
    margin: 20,
    marginTop: 0,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
