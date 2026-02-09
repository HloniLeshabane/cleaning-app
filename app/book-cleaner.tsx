import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function BookCleanerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    address: '',
    notes: '',
    serviceType: 'standard',
  });

  const timeSlots = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];
  const serviceTypes = [
    { id: 'standard', name: 'Standard Clean', icon: '🏠' },
    { id: 'deep', name: 'Deep Clean', icon: '✨' },
  ];

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
        <View style={styles.form}>
          {/* Service Type Selection */}
          <View style={styles.formGroup}>
            <View style={styles.serviceTypeRow}>
              {serviceTypes.map((type) => (
                <Pressable
                  key={type.id}
                  style={[
                    styles.serviceTypeCard,
                    { backgroundColor: formData.serviceType === type.id ? colors.primary : colors.secondary },
                  ]}
                  onPress={() => setFormData({ ...formData, serviceType: type.id })}>
                  <ThemedText style={styles.serviceTypeIcon}>{type.icon}</ThemedText>
                  <ThemedText style={styles.serviceTypeText}>{type.name}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Date Selection */}
          <View style={styles.formGroup}>
            <ThemedText type="subtitle" style={styles.label}>
              📅 Select Date
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Select date"
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
            ]}
            onPress={() => router.push('/payment')}>
            <ThemedText style={styles.bookButtonText}>Next →</ThemedText>
          </Pressable>
        </View>
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
  },
  serviceTypeCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
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
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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
});
