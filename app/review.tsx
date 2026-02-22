import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const feedbackOptions = [
  { icon: '✨', label: 'Quality Work' },
  { icon: '⏰', label: 'On Time' },
  { icon: '😊', label: 'Friendly' },
  { icon: '💼', label: 'Professional' },
  { icon: '🧹', label: 'Thorough' },
  { icon: '💬', label: 'Good Communication' },
];

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great!', 'Excellent!'];

export default function ReviewScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);

  const toggleFeedback = (label: string) => {
    setSelectedFeedback((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  const handleSubmit = () => {
    Alert.alert('Thank you! 🎉', 'Your review has been submitted.', [
      { text: 'Done', onPress: () => router.push('/(tabs)') },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Rate Your Service</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.icon }]}>
            Help us improve by sharing your experience
          </ThemedText>
        </View>

        {/* Cleaner Card */}
        <View style={[styles.cleanerCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.avatarText}>SJ</ThemedText>
          </View>
          <ThemedText style={[styles.cleanerName, { color: colors.text }]}>Sarah Johnson</ThemedText>
          <ThemedText style={[styles.serviceType, { color: colors.icon }]}>Standard Cleaning</ThemedText>
        </View>

        {/* Star Rating */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>How was your experience?</ThemedText>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                <ThemedText style={[styles.star, star <= rating && styles.starActive]}>
                  {star <= rating ? '⭐' : '☆'}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          {rating > 0 && (
            <View style={[styles.ratingBadge, { backgroundColor: colors.iconBg }]}>
              <ThemedText style={[styles.ratingLabel, { color: colors.primary }]}>{ratingLabels[rating]}</ThemedText>
            </View>
          )}
        </View>

        {/* Review Text */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>Share your thoughts</ThemedText>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Tell us about your experience..."
            placeholderTextColor={colors.icon}
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Feedback Chips */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>What did you like?</ThemedText>
          <View style={styles.chipsRow}>
            {feedbackOptions.map((option) => {
              const selected = selectedFeedback.includes(option.label);
              return (
                <Pressable
                  key={option.label}
                  style={[
                    styles.chip,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary + '18' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleFeedback(option.label)}>
                  <ThemedText style={styles.chipIcon}>{option.icon}</ThemedText>
                  <ThemedText style={[styles.chipLabel, { color: selected ? colors.primary : colors.icon, fontWeight: selected ? '700' : '500' }]}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Submit */}
        <Pressable
          style={[
            styles.submitButton,
            {
              backgroundColor: rating > 0 ? colors.primary : colors.border,
              shadowColor: rating > 0 ? colors.shadow : 'transparent',
            },
          ]}
          onPress={handleSubmit}
          disabled={rating === 0}>
          <ThemedText style={styles.submitButtonText}>Submit Review</ThemedText>
        </Pressable>

        {/* Skip */}
        <Pressable style={styles.skipButton} onPress={() => router.push('/(tabs)')}>
          <ThemedText style={[styles.skipText, { color: colors.icon }]}>Skip for now</ThemedText>
        </Pressable>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  cleanerCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  cleanerName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  starBtn: {
    padding: 6,
  },
  star: {
    fontSize: 38,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },
  ratingBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    minHeight: 110,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1.5,
    gap: 6,
  },
  chipIcon: {
    fontSize: 15,
  },
  chipLabel: {
    fontSize: 13,
  },
  submitButton: {
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 32,
  },
  skipText: {
    fontSize: 15,
  },
});
