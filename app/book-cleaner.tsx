import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { Service } from '@/types/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function BookCleanerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    address: '',
    notes: '',
    serviceId: '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getServices();
      console.log('Services API response:', data);
      if (Array.isArray(data)) {
        const activeServices = data.filter((s) => s.active);
        setServices(activeServices);
        if (activeServices.length > 0) {
          setFormData((prev) => ({ ...prev, serviceId: activeServices[0].id }));
        }
      } else {
        console.error('API response is not an array:', data);
        Alert.alert('Error', 'Invalid response from server.');
      }
    } catch (err: any) {
      console.error('Failed to load services:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load services. Please try again.';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to book a service.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/modal') },
      ]);
      return;
    }

    if (!formData.date) {
      Alert.alert('Missing Information', 'Please select a date.');
      return;
    }

    if (!formData.time) {
      Alert.alert('Missing Information', 'Please select a time.');
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert('Missing Information', 'Please enter your service address.');
      return;
    }

    if (!formData.serviceId) {
      Alert.alert('Missing Information', 'Please select a service.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert date to YYYY-MM-DD format
      const dateObj = new Date(formData.date);
      const formattedDate = dateObj.toISOString().split('T')[0];

      // Convert time from "09:00 AM" to "09:00" (24-hour format)
      const formattedTime = convert12to24(formData.time);

      await apiClient.createBooking({
        serviceId: formData.serviceId,
        bookingDate: formattedDate,
        bookingTime: formattedTime,
        address: formData.address,
        specialInstructions: formData.notes || undefined,
      });

      Alert.alert('Success', 'Booking created successfully!', [
        { text: 'OK', onPress: () => router.push('/(tabs)/bookings') },
      ]);
    } catch (err: any) {
      console.error('Failed to create booking:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to create booking. Please try again.';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const convert12to24 = (time12: string): string => {
    const [time, period] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    if (period === 'PM' && hours !== '12') {
      hours = String(parseInt(hours, 10) + 12);
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const timeSlots = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];

  const selectedService = services.find((s) => s.id === formData.serviceId);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButtonContainer}>
            <ThemedText style={styles.backButton}>← Back</ThemedText>
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>
            Book a Cleaning
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Book using cleaning service:
          </ThemedText>
        </View>

        {/* Form */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={styles.loadingText}>Loading services...</ThemedText>
          </View>
        ) : (
          <View style={styles.form}>
            {/* Service Type Selection */}
            <View style={styles.formGroup}>
              <ThemedText type="subtitle" style={styles.label}>
                🧹 Select Service
              </ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.serviceTypeRow}>
                {services.map((service) => (
                  <Pressable
                    key={service.id}
                    style={[
                      styles.serviceTypeCard,
                      { backgroundColor: formData.serviceId === service.id ? colors.primary : colors.card },
                      { borderColor: formData.serviceId === service.id ? colors.primary : colors.border },
                    ]}
                    onPress={() => setFormData({ ...formData, serviceId: service.id })}>
                    <ThemedText style={styles.serviceTypeIcon}>🧹</ThemedText>
                    <ThemedText
                      style={[
                        styles.serviceTypeText,
                        { color: formData.serviceId === service.id ? '#FFFFFF' : colors.text },
                      ]} 
                      numberOfLines={2}>
                      {service.name}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.servicePriceText,
                        { color: formData.serviceId === service.id ? '#FFFFFF' : colors.text },
                      ]}>
                      R {service.price}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Date Selection */}
            <View style={styles.formGroup}>
              <ThemedText type="subtitle" style={styles.label}>
                📅 Select Date
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="YYYY-MM-DD (e.g., 2026-02-15)"
                placeholderTextColor={colors.icon}
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />
            </View>

          {/* Time Selection */}
          <View style={styles.formGroup}>
            <ThemedText type="subtitle" style={styles.label}>
              ⏰ Select Time
            </ThemedText>
            <View style={styles.timeSlots}>
              {timeSlots.map((slot) => (
                <Pressable
                  key={slot}
                  style={({ pressed }) => [
                    styles.timeSlot,
                    { 
                      backgroundColor: formData.time === slot ? colors.primary : colors.card,
                      borderColor: formData.time === slot ? colors.primary : colors.border,
                    },
                    pressed && styles.timeSlotPressed,
                  ]}
                  onPress={() => setFormData({ ...formData, time: slot })}>
                  <ThemedText style={[
                    styles.timeSlotText,
                    formData.time === slot && styles.timeSlotTextSelected,
                  ]}>
                    {slot}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Address */}
          <View style={styles.formGroup}>
            <ThemedText type="subtitle" style={styles.label}>
              📍 Service Address
            </ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter your full address"
              placeholderTextColor={colors.icon}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Additional Notes */}
          <View style={styles.formGroup}>
            <ThemedText type="subtitle" style={styles.label}>
              📝 Special Instructions (Optional)
            </ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Any special requests or instructions..."
              placeholderTextColor={colors.icon}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Book Button */}
          <Pressable
            style={({ pressed }) => [
              styles.bookButton,
              { backgroundColor: colors.primary },
              pressed && styles.bookButtonPressed,
              isSubmitting && styles.bookButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.bookButtonText}>Create Booking</ThemedText>
            )}
          </Pressable>
        </View>
        )}
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
  form: {
    padding: 24,
    paddingTop: 0,
  },
  formGroup: {
    marginBottom: 28,
  },
  label: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  serviceTypeRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 12,
  },
  serviceTypeCard: {
    width: 140,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceTypeText: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  servicePriceText: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeSlotPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  timeSlotText: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  bookButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  bookButtonDisabled: {
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
});
