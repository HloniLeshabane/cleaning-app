import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { CleanerMatch, FindCleanersResponse } from '@/types/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function SelectCleanerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingId: string;
    serviceId: string;
    locationLat: string;
    locationLng: string;
    scheduledAt: string;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [cleanersData, setCleanersData] = useState<FindCleanersResponse | null>(null);
  const [selectedCleanerId, setSelectedCleanerId] = useState<string | null>(null);

  useEffect(() => {
    loadCleaners();
  }, []);

  const loadCleaners = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.findCleaners({
        serviceId: params.serviceId,
        locationLat: parseFloat(params.locationLat),
        locationLng: parseFloat(params.locationLng),
        scheduledAt: params.scheduledAt,
      });
      setCleanersData(data);
      
      if (data.recommended.length === 0 && data.others.length === 0) {
        Alert.alert(
          'No Cleaners Available',
          'Unfortunately, no cleaners are available in your area at this time. Please try again later.',
          [
            { text: 'Go Back', onPress: () => router.back() },
          ]
        );
      }
    } catch (err: any) {
      console.error('Failed to load cleaners:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load cleaners. Please try again.';
      Alert.alert('Error', errorMsg, [
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCleaner = async (cleanerId: string) => {
    try {
      setIsAssigning(true);
      setSelectedCleanerId(cleanerId);

      await apiClient.assignCleaner({
        bookingId: params.bookingId,
        cleanerId,
      });

      Alert.alert(
        'Success',
        'Cleaner assigned successfully! Your booking is confirmed.',
        [
          { text: 'View Bookings', onPress: () => router.push('/(tabs)/bookings') },
        ]
      );
    } catch (err: any) {
      console.error('Failed to assign cleaner:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to assign cleaner. Please try again.';
      Alert.alert('Error', errorMsg);
      setSelectedCleanerId(null);
    } finally {
      setIsAssigning(false);
    }
  };

  const formatDistance = (meters: number) => `${(meters / 1000).toFixed(1)}km away`;
  
  const formatScore = (score: number) => `${Math.round(score)}% match`;
  
  const formatReliability = (rate: number) => {
    if (rate === 0) return 'Perfect reliability';
    if (rate < 0.05) return 'Excellent reliability';
    if (rate < 0.10) return 'Good reliability';
    return 'Fair reliability';
  };

  const renderCleanerCard = (cleaner: CleanerMatch, isRecommended: boolean) => (
    <Pressable
      key={cleaner.id}
      style={[
        styles.cleanerCard,
        { 
          backgroundColor: colors.card,
          borderColor: isRecommended ? colors.primary : colors.border,
          borderWidth: isRecommended ? 2 : 1,
        },
        selectedCleanerId === cleaner.id && styles.selectedCard,
      ]}
      onPress={() => handleSelectCleaner(cleaner.id)}
      disabled={isAssigning}>
      
      {isRecommended && (
        <View style={[styles.recommendedBadge, { backgroundColor: colors.primary }]}>
          <ThemedText style={styles.recommendedText}>⭐ Recommended</ThemedText>
        </View>
      )}

      <View style={styles.cleanerHeader}>
        <View style={styles.cleanerAvatar}>
          <ThemedText style={styles.avatarText}>
            {cleaner.firstName?.[0] || '?'}{cleaner.lastName?.[0] || ''}
          </ThemedText>
        </View>
        <View style={styles.cleanerInfo}>
          <ThemedText type="subtitle" style={styles.cleanerName}>
            {cleaner.firstName || 'Cleaner'} {cleaner.lastName || ''}
          </ThemedText>
          <ThemedText style={[styles.cleanerDetail, { color: colors.icon }]}>
            {formatDistance(cleaner.distance_meters)} • {cleaner.vehicle_type}
          </ThemedText>
        </View>
        <View style={styles.scoreContainer}>
          <ThemedText style={[styles.scoreText, { color: colors.primary }]}>
            {formatScore(cleaner.score)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <ThemedText style={styles.rating}>⭐ {cleaner.rating.toFixed(1)}</ThemedText>
        {cleaner.reviews_count && (
          <ThemedText style={[styles.reviews, { color: colors.icon }]}>
            ({cleaner.reviews_count} reviews)
          </ThemedText>
        )}
      </View>

      {cleaner.has_previous_bookings && (
        <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
          <ThemedText style={[styles.badgeText, { color: colors.primary }]}>
            ✓ Booked Before
          </ThemedText>
        </View>
      )}

      <ThemedText style={[styles.reliability, { color: colors.icon }]}>
        {formatReliability(cleaner.cancellation_rate)}
      </ThemedText>

      {/* Score Breakdown */}
      <View style={styles.scoreBreakdown}>
        <ThemedText style={[styles.breakdownTitle, { color: colors.icon }]}>
          Score Breakdown:
        </ThemedText>
        <View style={styles.breakdownBars}>
          {Object.entries(cleaner.score_breakdown).map(([key, value]) => (
            <View key={key} style={styles.breakdownRow}>
              <ThemedText style={[styles.breakdownLabel, { color: colors.text }]}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </ThemedText>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { 
                      backgroundColor: colors.primary,
                      width: `${value}%`,
                    },
                  ]}
                />
              </View>
              <ThemedText style={[styles.breakdownValue, { color: colors.icon }]}>
                {Math.round(value)}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {isAssigning && selectedCleanerId === cleaner.id && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButtonContainer}>
            <ThemedText style={styles.backButton}>← Back</ThemedText>
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>
            Select Your Cleaner
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Choose from our best-matched cleaners
          </ThemedText>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={styles.loadingText}>Finding cleaners near you...</ThemedText>
          </View>
        ) : cleanersData ? (
          <View style={styles.content}>
            {/* Metadata */}
            {cleanersData.metadata && (
              <View style={[styles.metadataCard, { backgroundColor: colors.card }]}>
                <ThemedText style={[styles.metadataText, { color: colors.icon }]}>
                  Found {cleanersData.metadata.total_cleaners_found} cleaners within{' '}
                  {cleanersData.metadata.search_radius_km}km
                </ThemedText>
              </View>
            )}

            {/* Recommended Section */}
            {cleanersData.recommended.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  🏆 Recommended For You
                </ThemedText>
                {cleanersData.recommended.map((cleaner) => renderCleanerCard(cleaner, true))}
              </View>
            )}

            {/* Other Cleaners Section */}
            {cleanersData.others.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Other Available Cleaners
                </ThemedText>
                {cleanersData.others.map((cleaner) => renderCleanerCard(cleaner, false))}
              </View>
            )}
          </View>
        ) : null}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButtonContainer: {
    marginBottom: 16,
  },
  backButton: {
    fontSize: 18,
    opacity: 0.7,
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
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.6,
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  metadataCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  metadataText: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  cleanerCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  selectedCard: {
    opacity: 0.7,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cleanerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cleanerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cleanerInfo: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cleanerDetail: {
    fontSize: 14,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  reviews: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reliability: {
    fontSize: 14,
    marginBottom: 12,
  },
  scoreBreakdown: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  breakdownBars: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    width: 80,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownValue: {
    fontSize: 12,
    width: 30,
    textAlign: 'right',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
});
