import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { Service } from '@/types/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

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

const serviceGradients: Record<string, string[]> = {
  'Basic House Cleaning': ['#FF6B35', '#FF8C61'],
  'Standard Clean': ['#FF6B35', '#FF8C61'],
  'Deep Cleaning': ['#2A9D8F', '#4DBAA9'],
  'Deep Clean': ['#2A9D8F', '#4DBAA9'],
  'Bathroom Deep Clean': ['#2A9D8F', '#4DBAA9'],
  'Kitchen Deep Clean': ['#2A9D8F', '#4DBAA9'],
  'Office Cleaning': ['#264653', '#2A9D8F'],
  'Office Clean': ['#264653', '#2A9D8F'],
  'Move-In/Move-Out Cleaning': ['#E76F51', '#F4A261'],
  'Move-In/Out': ['#E76F51', '#F4A261'],
};

export default function BrowseServicesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

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
      console.log('Services API response:', data);
      if (Array.isArray(data)) {
        setServices(data.filter((s) => s.active));
      } else {
        console.error('API response is not an array:', data);
        setError('Invalid response from server.');
      }
    } catch (err: any) {
      console.error('Failed to load services:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load services. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => `R ${price}`;
  const formatDuration = (hours: number) => {
    if (hours === 1) return '1 hour';
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    return `${hours} hours`;
  };

  const getServiceIcon = (name: string) => serviceIcons[name] || '🧹';
  const getServiceGradient = (name: string) => serviceGradients[name] || ['#6B7280', '#9CA3AF'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <ThemedText style={styles.greeting}>Hello! 👋</ThemedText>
            <ThemedText type="title" style={styles.headerTitle}>
              Find Your Perfect Cleaning Service
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Professional cleaning at your doorstep
            </ThemedText>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.statNumber}>500+</ThemedText>
            <ThemedText style={styles.statLabel}>Happy Clients</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.statNumber}>4.9⭐</ThemedText>
            <ThemedText style={styles.statLabel}>Rating</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.statNumber}>24/7</ThemedText>
            <ThemedText style={styles.statLabel}>Support</ThemedText>
          </View>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Our Services
          </ThemedText>

          {isLoading && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={colors.tint} />
              <ThemedText style={styles.centerText}>Loading services...</ThemedText>
            </View>
          )}

          {error && (
            <View style={styles.centerContent}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <Pressable
                style={[styles.retryButton, { backgroundColor: colors.tint }]}
                onPress={loadServices}>
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </Pressable>
            </View>
          )}

          {!isLoading && !error && (
            <View style={styles.servicesGrid}>
              {services.map((service) => {
                const gradient = getServiceGradient(service.name);
                return (
                  <Pressable
                    key={service.id}
                    style={({ pressed }) => [
                      styles.serviceCard,
                      { backgroundColor: colors.card },
                      pressed && styles.serviceCardPressed,
                    ]}
                    onPress={() => router.push('/book-cleaner')}>
                    <View style={[styles.serviceIconContainer, { backgroundColor: `${gradient[0]}15` }]}>
                      <ThemedText style={styles.iconText}>{getServiceIcon(service.name)}</ThemedText>
                    </View>
                    <View style={styles.serviceContent}>
                      <ThemedText type="subtitle" style={styles.serviceName}>
                        {service.name}
                      </ThemedText>
                      <ThemedText style={styles.serviceDescription}>{service.description}</ThemedText>

                      <View style={styles.serviceFooter}>
                        <View>
                          <ThemedText style={[styles.servicePrice, { color: gradient[0] }]}>
                            {formatPrice(service.price)}
                          </ThemedText>
                          <ThemedText style={styles.serviceDuration}>⏱️ {formatDuration(service.duration_hours)}</ThemedText>
                        </View>
                        <View style={[styles.bookButton, { backgroundColor: gradient[0] }]}>
                          <ThemedText style={styles.bookButtonText}>Book →</ThemedText>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
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
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
  },
  greeting: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 40,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  servicesSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  serviceCardPressed: {
    opacity: 0.8,
    transform: [{scale: 0.98}],
  },
  serviceIconContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 48,
  },
  serviceContent: {
    padding: 20,
    paddingTop: 12,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 16,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 13,
    opacity: 0.6,
  },
  bookButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  bottomPadding: {
    height: 32,
  },
  centerContent: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 16,
  },
  centerText: {
    fontSize: 16,
    opacity: 0.6,
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
});
