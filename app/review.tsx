import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function ReviewScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    // Submit review logic here
    alert('Thank you for your review!');
    router.push('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Rate Your Service
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Help us improve by sharing your experience
          </ThemedText>
        </View>

        {/* Cleaner Info */}
        <View style={[styles.cleanerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.avatarText}>SJ</ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.cleanerName}>Sarah Johnson</ThemedText>
          <ThemedText style={styles.serviceType}>Standard Cleaning</ThemedText>
        </View>

        {/* Rating Section */}
        <View style={[styles.ratingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>How was your experience?</ThemedText>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}>
                <ThemedText style={styles.star}>
                  {star <= rating ? '⭐' : '☆'}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {rating > 0 && (
            <ThemedText style={[styles.ratingText, { color: colors.primary }]}>
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Great!'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Fair'}
              {rating === 1 && 'Poor'}
            </ThemedText>
          )}
        </View>

        {/* Review Text */}
        <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Share your thoughts</ThemedText>
          
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Tell us about your experience..."
            placeholderTextColor={colors.icon}
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Quick feedback options */}
        <View style={[styles.feedbackCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>What did you like?</ThemedText>
          
          <View style={styles.feedbackOptions}>
            {[
              { icon: '✨', label: 'Quality Work' },
              { icon: '⏰', label: 'On Time' },
              { icon: '😊', label: 'Friendly' },
              { icon: '💼', label: 'Professional' },
              { icon: '🧹', label: 'Thorough' },
              { icon: '💬', label: 'Good Communication' },
            ].map((option, index) => (
              <Pressable
                key={index}
                style={[styles.feedbackOption, { borderColor: colors.border }]}>
                <ThemedText style={styles.feedbackIcon}>{option.icon}</ThemedText>
                <ThemedText style={styles.feedbackLabel}>{option.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          style={[
            styles.submitButton,
            { backgroundColor: rating > 0 ? colors.primary : colors.border }
          ]}
          onPress={handleSubmit}
          disabled={rating === 0}>
          <ThemedText style={styles.submitButtonText}>Submit Review</ThemedText>
        </Pressable>

        {/* Skip Button */}
        <Pressable
          style={styles.skipButton}
          onPress={() => router.push('/(tabs)')}>
          <ThemedText style={[styles.skipButtonText, { color: colors.icon }]}>Skip for now</ThemedText>
        </Pressable>
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
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  cleanerCard: {
    margin: 24,
    padding: 28,
    borderRadius: 20,
    borderWidth: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  cleanerName: {
    marginBottom: 4,
  },
  serviceType: {
    opacity: 0.7,
  },
  ratingCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  reviewCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  feedbackCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 40,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  feedbackOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  feedbackOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  feedbackIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  feedbackLabel: {
    fontSize: 14,
  },
  submitButton: {
    margin: 20,
    marginTop: 0,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 40,
  },
  skipButtonText: {
    fontSize: 16,
  },
});
