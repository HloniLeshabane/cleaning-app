import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { Service } from '@/types/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const serviceIcons: Record<string, string> = {
  'Basic House Cleaning': '🏠',
  'Standard Clean': '🏠',
  'Deep Cleaning': '✨',
  'Deep Clean': '✨',
  'Bathroom Deep Clean': '🛁',
  'Kitchen Deep Clean': '🍳',
  'Office Cleaning': '🏢',
  'Office Clean': '🏢',
  'Move-In/Move-Out Cleaning': '📦',
  'Move-In/Out': '📦',
};

export default function BrowseServicesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getServices();
      if (Array.isArray(data)) {
        setServices(data.filter((s) => s.active));
      } else {
        setError('Invalid response from server.');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load services. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => `R ${price}`;
  const formatDuration = (hours: number) => {
    if (hours === 1) return '1 hr';
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours} hrs`;
  };

  const getServiceIcon = (name: string) => serviceIcons[name] || '🧹';

  const greetingText = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}>

        {/* Header */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + 32 }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextGroup}>
              <ThemedText style={[styles.greeting, { color: colors.icon }]}>
                {greetingText()} 👋
              </ThemedText>
              <ThemedText style={[styles.userName, { color: colors.text }]}>
                {user?.firstName ? `${user.firstName}` : 'Welcome back'}
              </ThemedText>
            </View>
            {/* Avatar circle */}
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.avatarInitial}>
                {user?.firstName ? user.firstName[0].toUpperCase() : '?'}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={[styles.headerSubtitle, { color: colors.icon }]}>
            What service do you need today?
          </ThemedText>
        </View>

        {/* Stats Pill */}
        <View style={[styles.statsPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>500+</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.icon }]}>Clients</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>4.9★</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.icon }]}>Rating</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>24/7</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.icon }]}>Support</ThemedText>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Our Services
          </ThemedText>

          {isLoading && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText style={[styles.centerText, { color: colors.icon }]}>Loading services...</ThemedText>
            </View>
          )}

          {error && (
            <View style={styles.centerContent}>
              <ThemedText style={[styles.errorText, { color: colors.error }]}>{error}</ThemedText>
              <Pressable
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
                onPress={loadServices}>
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </Pressable>
            </View>
          )}

          {!isLoading && !error && (
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <Pressable
                  key={service.id}
                  style={({ pressed }) => [
                    styles.serviceCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      shadowColor: colors.shadow,
                      opacity: pressed ? 0.88 : 1,
                      transform: pressed ? [{ scale: 0.975 }] : [],
                    },
                  ]}
                  onPress={() => router.push({ pathname: '/book-cleaner', params: { serviceId: service.id } })}>

                  {/* Icon container */}
                  <View style={[styles.iconWrapper, { backgroundColor: colors.iconBg }]}>
                    <ThemedText style={styles.iconText}>{getServiceIcon(service.name)}</ThemedText>
                  </View>

                  {/* Card body */}
                  <View style={styles.cardBody}>
                    <ThemedText style={[styles.serviceName, { color: colors.text }]} numberOfLines={1}>
                      {service.name}
                    </ThemedText>
                    <ThemedText style={[styles.serviceDesc, { color: colors.icon }]} numberOfLines={2}>
                      {service.description}
                    </ThemedText>

                    <View style={styles.cardFooter}>
                      <View>
                        <ThemedText style={[styles.servicePrice, { color: colors.primary }]}>
                          {formatPrice(service.price)}
                        </ThemedText>
                        <ThemedText style={[styles.serviceDuration, { color: colors.icon }]}>
                          ⏱ {formatDuration(service.duration_hours)}
                        </ThemedText>
                      </View>
                      <View style={[styles.bookButton, { backgroundColor: colors.primary }]}>
                        <ThemedText style={styles.bookButtonText}>Book →</ThemedText>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Guarantees */}
        {!isLoading && !error && services.length > 0 && (
          <View style={[styles.guaranteesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { text: 'Vetted & insured cleaners' },
              { text: 'Satisfaction guaranteed' },
              { text: 'Easy cancellation' },
            ].map((g, i) => (
              <View key={i} style={styles.guaranteeRow}>
                <View style={[styles.checkCircle, { backgroundColor: colors.iconBg }]}>
                  <ThemedText style={[styles.checkMark, { color: colors.primary }]}>✓</ThemedText>
                </View>
                <ThemedText style={[styles.guaranteeText, { color: colors.text }]}>{g.text}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTextGroup: {
    flex: 1,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  statsPill: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 28,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 16,
    shadowColor: '#FF974F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  servicesSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 30,
  },
  cardBody: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  serviceDuration: {
    fontSize: 11,
    marginTop: 1,
  },
  bookButton: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 100,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  centerContent: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 16,
  },
  centerText: {
    fontSize: 15,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 100,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  guaranteesCard: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    shadowColor: '#FF974F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 14,
    fontWeight: '700',
  },
  guaranteeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
