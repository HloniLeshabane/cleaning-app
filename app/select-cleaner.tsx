import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { CleanerMatch, FindCleanersResponse } from '@/types/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SelectCleanerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
        Alert.alert('No Cleaners Available', 'No cleaners are available in your area right now. Please try again later.', [
          { text: 'Go Back', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to load cleaners.', [
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
      await apiClient.assignCleaner({ bookingId: params.bookingId, cleanerId });
      Alert.alert('Booking Confirmed! 🎉', 'Your cleaner has been assigned. We\'ll notify you when they accept.', [
        { text: 'View Bookings', onPress: () => router.push('/(tabs)/bookings') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to assign cleaner.');
      setSelectedCleanerId(null);
    } finally {
      setIsAssigning(false);
    }
  };

  const formatDistance = (meters: number) => `${(meters / 1000).toFixed(1)}km away`;
  const formatScore = (score: number) => `${Math.round(score)}%`;
  const formatReliability = (rate: number) => {
    if (rate === 0) return 'Perfect reliability';
    if (rate < 0.05) return 'Excellent reliability';
    if (rate < 0.10) return 'Good reliability';
    return 'Fair reliability';
  };

  const renderCleanerCard = (cleaner: CleanerMatch, isRecommended: boolean) => {
    const isSelected = selectedCleanerId === cleaner.id;
    return (
      <Pressable
        key={cleaner.id}
        style={[
          styles.cleanerCard,
          {
            backgroundColor: colors.card,
            borderColor: isRecommended ? colors.primary : colors.border,
            borderWidth: isRecommended ? 2 : 1.5,
            shadowColor: colors.shadow,
            opacity: isSelected ? 0.75 : 1,
          },
        ]}
        onPress={() => handleSelectCleaner(cleaner.id)}
        disabled={isAssigning}>

        {/* Top row: recommended badge + score badge */}
        <View style={styles.topBadgeRow}>
          {isRecommended ? (
            <View style={[styles.recommendedBadge, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.recommendedText}>⭐ Recommended</ThemedText>
            </View>
          ) : <View />}
          <View style={[styles.scoreBadge, { backgroundColor: colors.iconBg }]}>
            <ThemedText style={[styles.scoreText, { color: colors.primary }]}>{formatScore(cleaner.score)}</ThemedText>
            <ThemedText style={[styles.scoreLabel, { color: colors.icon }]}>match</ThemedText>
          </View>
        </View>

        <View style={styles.cleanerHeader}>
          {cleaner.profilePhotoUrl ? (
            <Image
              source={{ uri: cleaner.profilePhotoUrl }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.avatarText}>
                {cleaner.firstName?.[0] || '?'}{cleaner.lastName?.[0] || ''}
              </ThemedText>
            </View>
          )}
          <View style={styles.cleanerInfo}>
            <ThemedText style={[styles.cleanerName, { color: colors.text }]}>
              {cleaner.firstName || 'Cleaner'} {cleaner.lastName || ''}
            </ThemedText>
            <ThemedText style={[styles.cleanerDetail, { color: colors.icon }]}>
              {formatDistance(cleaner.distance_meters)} · {cleaner.vehicle_type}
            </ThemedText>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <ThemedText style={[styles.ratingText, { color: colors.text }]}>⭐ {cleaner.rating.toFixed(1)}</ThemedText>
          {cleaner.reviews_count ? (
            <ThemedText style={[styles.reviewsText, { color: colors.icon }]}>({cleaner.reviews_count} reviews)</ThemedText>
          ) : null}
        </View>

        {cleaner.has_previous_bookings && (
          <View style={[styles.booked, { backgroundColor: colors.iconBg, borderColor: colors.border }]}>
            <ThemedText style={[styles.bookedText, { color: colors.primary }]}>✓ Booked Before</ThemedText>
          </View>
        )}

        <ThemedText style={[styles.reliability, { color: colors.icon }]}>
          {formatReliability(cleaner.cancellation_rate)}
        </ThemedText>

        {/* Score Breakdown */}
        <View style={[styles.breakdownSection, { borderTopColor: colors.border }]}>
          <ThemedText style={[styles.breakdownTitle, { color: colors.icon }]}>Score Breakdown</ThemedText>
          <View style={styles.breakdownBars}>
            {Object.entries(cleaner.score_breakdown).map(([key, value]) => (
              <View key={key} style={styles.breakdownRow}>
                <ThemedText style={[styles.breakdownLabel, { color: colors.text }]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </ThemedText>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${value}%` as any }]} />
                </View>
                <ThemedText style={[styles.breakdownValue, { color: colors.icon }]}>{Math.round(value)}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {isAssigning && isSelected && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <View style={[styles.backCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.backArrow, { color: colors.text }]}>←</ThemedText>
            </View>
          </Pressable>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Select Your Cleaner</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.icon }]}>Choose from our best-matched cleaners</ThemedText>
        </View>

        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={[styles.loadingText, { color: colors.icon }]}>Finding cleaners near you...</ThemedText>
          </View>
        ) : cleanersData ? (
          <View style={styles.content}>
            {cleanersData.metadata && (
              <View style={[styles.metaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={[styles.metaText, { color: colors.icon }]}>
                  Found {cleanersData.metadata.total_cleaners_found} cleaners within {cleanersData.metadata.search_radius_km}km
                </ThemedText>
              </View>
            )}

            {cleanersData.recommended.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>🏆 Recommended For You</ThemedText>
                {cleanersData.recommended.map((c) => renderCleanerCard(c, true))}
              </View>
            )}

            {cleanersData.others.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Other Available Cleaners</ThemedText>
                {cleanersData.others.map((c) => renderCleanerCard(c, false))}
              </View>
            )}
          </View>
        ) : null}
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
  backBtn: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  centerContent: {
    paddingVertical: 64,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  metaCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  cleanerCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cleanerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    flexShrink: 0,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cleanerInfo: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  cleanerDetail: {
    fontSize: 13,
  },
  scoreBadge: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexShrink: 0,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 13,
  },
  booked: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  bookedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reliability: {
    fontSize: 13,
    marginBottom: 12,
  },
  breakdownSection: {
    borderTopWidth: 1,
    paddingTop: 14,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  breakdownBars: {
    gap: 6,
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
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownValue: {
    fontSize: 12,
    width: 28,
    textAlign: 'right',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});
