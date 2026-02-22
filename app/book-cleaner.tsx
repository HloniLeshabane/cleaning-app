import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiClient } from '@/services/api';
import { Service } from '@/types/api';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookCleanerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { serviceId: preselectedServiceId } = useLocalSearchParams<{ serviceId?: string }>();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date(),
    address: '',
    notes: '',
    serviceId: '',
    locationLat: 0,
    locationLng: 0,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getServices();
      if (Array.isArray(data)) {
        const activeServices = data.filter((s) => s.active);
        setServices(activeServices);
        if (activeServices.length > 0) {
          const defaultId =
            preselectedServiceId && activeServices.some((s) => s.id === preselectedServiceId)
              ? preselectedServiceId
              : activeServices[0].id;
          setFormData((prev) => ({ ...prev, serviceId: defaultId }));
        }
      } else {
        Alert.alert('Error', 'Invalid response from server.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to load services.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const addr = addresses[0];
        const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.postalCode || ''}`.replace(/, ,/g, ',').trim();
        setFormData((prev) => ({ ...prev, address: fullAddress, locationLat: latitude, locationLng: longitude }));
        Alert.alert('Success', 'Current location retrieved!');
      }
    } catch {
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
        setFormData((prev) => ({ ...prev, locationLat: latitude, locationLng: longitude }));
      }
    } catch { /* silently ignore */ }
  };

  const handleSubmit = async () => {
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
      Alert.alert('Error', err.response?.data?.message || err.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const showDateTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: formData.date,
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
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

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setFormData({ ...formData, date: selectedDate });
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
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Book a Cleaning</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.icon }]}>Select your preferences below</ThemedText>
        </View>

        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={[styles.loadingText, { color: colors.icon }]}>Loading services...</ThemedText>
          </View>
        ) : (
          <View style={styles.form}>
            {/* Service Selection */}
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>🧹 Select Service</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceRow}>
                {services.map((service) => {
                  const selected = formData.serviceId === service.id;
                  return (
                    <Pressable
                      key={service.id}
                      style={[
                        styles.serviceCard,
                        {
                          backgroundColor: selected ? colors.primary : colors.card,
                          borderColor: selected ? colors.primary : colors.border,
                          shadowColor: colors.shadow,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, serviceId: service.id })}>
                      <ThemedText style={styles.serviceIcon}>🧹</ThemedText>
                      <ThemedText
                        style={[styles.serviceCardName, { color: selected ? '#FFFFFF' : colors.text }]}
                        numberOfLines={2}>
                        {service.name}
                      </ThemedText>
                      <ThemedText style={[styles.serviceCardPrice, { color: selected ? '#FFE4CC' : colors.primary }]}>
                        R {service.price}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Date & Time */}
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>📅 Select Date & Time</ThemedText>
              <Pressable
                style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={showDateTimePicker}>
                <ThemedText style={[styles.inputRowText, { color: colors.text }]}>{formatDate(formData.date)}</ThemedText>
                <ThemedText style={[styles.inputRowIcon, { color: colors.primary }]}>›</ThemedText>
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
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>📍 Service Location</ThemedText>
              <Pressable
                style={[styles.locationButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }, isLoadingLocation && styles.disabledBtn]}
                onPress={getCurrentLocation}
                disabled={isLoadingLocation}>
                {isLoadingLocation ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.locationButtonText}>📍 Use Current Location</ThemedText>
                )}
              </Pressable>
              <ThemedText style={[styles.orText, { color: colors.icon }]}>— or enter manually —</ThemedText>
              <TextInput
                style={[styles.textInput, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Enter your full address"
                placeholderTextColor={colors.icon}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                onBlur={() => geocodeAddress(formData.address)}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>📝 Special Instructions (Optional)</ThemedText>
              <TextInput
                style={[styles.textInput, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Any special requests or instructions..."
                placeholderTextColor={colors.icon}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Submit */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: colors.primary, shadowColor: colors.shadow },
                pressed && styles.pressedBtn,
                isSubmitting && styles.disabledBtn,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Create Booking</ThemedText>
              )}
            </Pressable>
          </View>
        )}
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
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  serviceRow: {
    gap: 12,
    paddingRight: 8,
  },
  serviceCard: {
    width: 130,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  serviceCardName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  serviceCardPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  inputRowText: {
    flex: 1,
    fontSize: 15,
  },
  inputRowIcon: {
    fontSize: 22,
    fontWeight: '300',
  },
  locationButton: {
    paddingVertical: 15,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  orText: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 17,
    borderRadius: 100,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  pressedBtn: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
