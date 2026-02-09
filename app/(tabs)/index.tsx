import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const services = [
  {
    id: '1',
    name: 'Standard Clean',
    description: 'Perfect for regular maintenance',
    price: 'R 299',
    duration: '2-3 hours',
    icon: '🏠',
    gradient: ['#FF6B35', '#FF8C61'],
  },
  {
    id: '2',
    name: 'Deep Clean',
    description: 'Thorough deep cleaning service',
    price: 'R 499',
    duration: '4-5 hours',
    icon: '✨',
    gradient: ['#2A9D8F', '#4DBAA9'],
  },
  {
    id: '3',
    name: 'Office Clean',
    description: 'Professional workspace cleaning',
    price: 'R 399',
    duration: '3-4 hours',
    icon: '🏢',
    gradient: ['#264653', '#2A9D8F'],
  },
  {
    id: '4',
    name: 'Move-In/Out',
    description: 'Complete move-in/out cleaning',
    price: 'R 699',
    duration: '5-6 hours',
    icon: '📦',
    gradient: ['#E76F51', '#F4A261'],
  },
];

export default function BrowseServicesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

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
          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <Pressable
                key={service.id}
                style={({ pressed }) => [
                  styles.serviceCard,
                  { backgroundColor: colors.card },
                  pressed && styles.serviceCardPressed,
                ]}
                onPress={() => router.push('/book-cleaner')}>
                <View style={[styles.serviceIconContainer, { backgroundColor: `${service.gradient[0]}15` }]}>
                  <ThemedText style={styles.iconText}>{service.icon}</ThemedText>
                </View>
                <View style={styles.serviceContent}>
                  <ThemedText type="subtitle" style={styles.serviceName}>
                    {service.name}
                  </ThemedText>
                  <ThemedText style={styles.serviceDescription}>{service.description}</ThemedText>
                  
                  <View style={styles.serviceFooter}>
                    <View>
                      <ThemedText style={[styles.servicePrice, { color: service.gradient[0] }]}>
                        {service.price}
                      </ThemedText>
                      <ThemedText style={styles.serviceDuration}>⏱️ {service.duration}</ThemedText>
                    </View>
                    <View style={[styles.bookButton, { backgroundColor: service.gradient[0] }]}>
                      <ThemedText style={styles.bookButtonText}>Book →</ThemedText>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
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
});
