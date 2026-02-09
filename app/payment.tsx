import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function PaymentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [selectedPayment, setSelectedPayment] = useState('card');
  const [tipAmount, setTipAmount] = useState(0);

  const tipOptions = [0, 20, 50, 100];
  const servicePrice = 299;
  const totalAmount = servicePrice + tipAmount;

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>← Back</ThemedText>
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>
            Payment
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Complete your booking
          </ThemedText>
        </View>

        {/* Service Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Booking Summary</ThemedText>
          
          <View style={styles.summaryRow}>
            <ThemedText>Standard Cleaning</ThemedText>
            <ThemedText>R {servicePrice}</ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText>Date & Time</ThemedText>
            <ThemedText>Today, 2:00 PM</ThemedText>
          </View>
        </View>

        {/* Tip Section */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Add a Tip (Optional)</ThemedText>
          <ThemedText style={styles.tipSubtitle}>Show your appreciation for great service</ThemedText>
          
          <View style={styles.tipOptions}>
            {tipOptions.map((amount) => (
              <Pressable
                key={amount}
                style={[
                  styles.tipButton,
                  { borderColor: colors.border },
                  tipAmount === amount && { backgroundColor: colors.secondary, borderColor: colors.secondary }
                ]}
                onPress={() => setTipAmount(amount)}>
                <ThemedText style={[
                  styles.tipButtonText,
                  tipAmount === amount && { color: '#FFFFFF' }
                ]}>
                  {amount === 0 ? 'No Tip' : `R ${amount}`}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={[styles.customTipInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Custom amount"
            placeholderTextColor={colors.icon}
            keyboardType="numeric"
            onChangeText={(text) => setTipAmount(parseInt(text) || 0)}
          />
        </View>

        {/* Payment Method */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Payment Method</ThemedText>
          
          <Pressable
            style={[
              styles.paymentOption,
              { borderColor: colors.border },
              selectedPayment === 'card' && { borderColor: colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setSelectedPayment('card')}>
            <ThemedText style={styles.paymentIcon}>💳</ThemedText>
            <ThemedText style={styles.paymentText}>Credit/Debit Card</ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.paymentOption,
              { borderColor: colors.border },
              selectedPayment === 'cash' && { borderColor: colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setSelectedPayment('cash')}>
            <ThemedText style={styles.paymentIcon}>💵</ThemedText>
            <ThemedText style={styles.paymentText}>Cash on Service</ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.paymentOption,
              { borderColor: colors.border },
              selectedPayment === 'eft' && { borderColor: colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setSelectedPayment('eft')}>
            <ThemedText style={styles.paymentIcon}>🏦</ThemedText>
            <ThemedText style={styles.paymentText}>EFT/Bank Transfer</ThemedText>
          </Pressable>
        </View>

        {/* Total */}
        <View style={[styles.totalCard, { backgroundColor: colors.secondary }]}>
          <View style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>Total Amount</ThemedText>
            <ThemedText style={styles.totalAmount}>R {totalAmount}</ThemedText>
          </View>
          {tipAmount > 0 && (
            <ThemedText style={styles.tipIncluded}>Includes R {tipAmount} tip</ThemedText>
          )}
        </View>

        {/* Confirm Button */}
        <Pressable
          style={[styles.confirmButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/review')}>
          <ThemedText style={styles.confirmButtonText}>Confirm & Pay R {totalAmount}</ThemedText>
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
  },
  backButton: {
    fontSize: 18,
    marginBottom: 20,
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
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  card: {
    margin: 24,
    marginTop: 0,
    padding: 24,
    borderRadius: 20,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  tipSubtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  tipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  tipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  tipButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customTipInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  tipIncluded: {
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 8,
  },
  confirmButton: {
    margin: 24,
    marginTop: 0,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
