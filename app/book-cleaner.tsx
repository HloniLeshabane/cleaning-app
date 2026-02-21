import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { Service } from '@/types/api';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
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
    date: new Date(),
    address: '',
    notes: '',
    serviceId: '',
    locationLat: 0,
    locationLng: 0,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions to use your current location.');
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get address from coordinates
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const addr = addresses[0];
        const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.postalCode || ''}`.replace(/, ,/g, ',').trim();
        
        setFormData((prev) => ({
          ...prev,
          address: fullAddress,
          locationLat: latitude,
          locationLng: longitude,
        }));
        
        Alert.alert('Success', 'Current location retrieved successfully!');
      }
    } catch (err: any) {
      console.error('Failed to get location:', err);
      Alert.alert('Error', 'Failed to get your location. Please enter address manually.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return;
    
    try {
      const locations = await Location.geocodeAsync(address);
      if (locations.length > 0) {
        const { latitude, longitude } = locations[0];
        setFormData((prev) => ({
          ...prev,
          locationLat: latitude,
          locationLng: longitude,
        }));
      }
    } catch (err: any) {
      console.error('Failed to geocode address:', err);
      // Don't show error here, will show during submission validation
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

    if (!formData.address.trim()) {
      Alert.alert('Missing Information', 'Please enter your service address or use current location.');
      return;
    }

    if (formData.locationLat === 0 || formData.locationLng === 0) {
      Alert.alert('Missing Information', 'Please use your current location or ensure address has valid coordinates.');
      return;
    }

    if (!formData.serviceId) {
      Alert.alert('Missing Information', 'Please select a service.');
      return;
    }

    try {
      setIsSubmitting(true);

      const booking = await apiClient.createBooking({
        serviceId: formData.serviceId,
        scheduledAt: formData.date.toISOString(),
        locationAddress: formData.address,
        locationLat: formData.locationLat,
        locationLng: formData.locationLng,
        notes: formData.notes || undefined,
      });

      // Redirect to cleaner selection with booking details
      router.push({
        pathname: '/select-cleaner',
        params: {
          bookingId: booking.id,
          serviceId: formData.serviceId,
          locationLat: formData.locationLat.toString(),
          locationLng: formData.locationLng.toString(),
          scheduledAt: formData.date.toISOString(),
        },
      });
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

  const selectedService = services.find((s) => s.id === formData.serviceId);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const showDateTimePicker = () => {
    if (Platform.OS === 'android') {
      // First show date picker
      DateTimePickerAndroid.open({
        value: formData.date,
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            // After date is selected, show time picker
            DateTimePickerAndroid.open({
              value: selectedDate,
              onChange: (timeEvent, selectedTime) => {
                if (timeEvent.type === 'set' && selectedTime) {
                  setFormData({ ...formData, date: selectedTime });
                }
              },
              mode: 'time',
              is24Hour: false,
            });
          }
        },
        mode: 'date',
        minimumDate: new Date(),
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

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

            {/* Date & Time Selection */}
            <View style={styles.formGroup}>
              <ThemedText type="subtitle" style={styles.label}>
                📅 Select Date & Time
              </ThemedText>
              <Pressable
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={showDateTimePicker}>
                <ThemedText style={{ color: colors.text }}>
                  {formatDate(formData.date)}
                </ThemedText>
              </Pressable>
              {showDatePicker && Platform.OS === 'ios' && (
                <DateTimePicker
                  value={formData.date}
                  mode="datetime"
                  display="spinner"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

          {/* Location */}
          <View style={styles.formGroup}>
            <ThemedText type="subtitle" style={styles.label}>
              📍 Service Location
            </ThemedText>
            <Pressable
              style={[
                styles.locationButton,
                { backgroundColor: colors.primary, borderColor: colors.primary },
                isLoadingLocation && styles.locationButtonDisabled,
              ]}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}>
              {isLoadingLocation ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.locationButtonText}>
                  📍 Use Current Location
                </ThemedText>
              )}
            </Pressable>
            <ThemedText style={[styles.orText, { color: colors.icon }]}>or enter manually</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter your full address"
              placeholderTextColor={colors.icon}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              onBlur={() => geocodeAddress(formData.address)}
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
  locationButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  locationButtonDisabled: {
    opacity: 0.6,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
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
