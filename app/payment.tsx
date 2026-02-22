import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaymentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedPayment, setSelectedPayment] = useState('card');
  const [tipAmount, setTipAmount] = useState(0);

  const tipOptions = [0, 20, 50, 100];
  const servicePrice = 299;
  const totalAmount = servicePrice + tipAmount;

  const paymentMethods = [
    { id: 'card', icon: '💳', label: 'Credit/Debit Card' },
    { id: 'cash', icon: '💵', label: 'Cash on Service' },
    { id: 'eft', icon: '🏦', label: 'EFT/Bank Transfer' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <View style={[styles.backCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.backArrow, { color: colors.text }]}>←</ThemedText>
            </View>
          </Pressable>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Payment</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.icon }]}>Complete your booking</ThemedText>
        </View>

        {/* Booking Summary */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>Booking Summary</ThemedText>
          <View style={styles.summaryRow}>
            <ThemedText style={[styles.summaryLabel, { color: colors.icon }]}>Service</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: colors.text }]}>Standard Cleaning</ThemedText>
          </View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <ThemedText style={[styles.summaryLabel, { color: colors.icon }]}>Date & Time</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: colors.text }]}>Today, 2:00 PM</ThemedText>
          </View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <ThemedText style={[styles.summaryLabel, { color: colors.icon }]}>Base price</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: colors.primary, fontWeight: '700' }]}>R {servicePrice}</ThemedText>
          </View>
        </View>

        {/* Tip */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>Add a Tip (Optional)</ThemedText>
          <ThemedText style={[styles.cardSubtitle, { color: colors.icon }]}>Show your appreciation for great service</ThemedText>
          <View style={styles.tipRow}>
            {tipOptions.map((amount) => {
              const selected = tipAmount === amount;
              return (
                <Pressable
                  key={amount}
                  style={[
                    styles.tipBtn,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => setTipAmount(amount)}>
                  <ThemedText style={[styles.tipBtnText, { color: selected ? '#FFFFFF' : colors.text }]}>
                    {amount === 0 ? 'No Tip' : `R ${amount}`}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            style={[styles.tipInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Custom amount"
            placeholderTextColor={colors.icon}
            keyboardType="numeric"
            onChangeText={(text) => setTipAmount(parseInt(text) || 0)}
          />
        </View>

        {/* Payment Method */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>Payment Method</ThemedText>
          {paymentMethods.map((method) => {
            const selected = selectedPayment === method.id;
            return (
              <Pressable
                key={method.id}
                style={[
                  styles.paymentOption,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.iconBg : 'transparent',
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedPayment(method.id)}>
                <View style={[styles.paymentIconBox, { backgroundColor: selected ? colors.primary : colors.iconBg }]}>
                  <ThemedText style={styles.paymentIconText}>{method.icon}</ThemedText>
                </View>
                <ThemedText style={[styles.paymentLabel, { color: colors.text }]}>{method.label}</ThemedText>
                {selected && (
                  <View style={[styles.checkDot, { backgroundColor: colors.primary }]}>
                    <ThemedText style={styles.checkDotText}>✓</ThemedText>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Total */}
        <View style={[styles.totalCard, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}>
          <View style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>Total Amount</ThemedText>
            <ThemedText style={styles.totalAmount}>R {totalAmount}</ThemedText>
          </View>
          {tipAmount > 0 && (
            <ThemedText style={styles.tipNote}>Includes R {tipAmount} tip — thank you! ❤️</ThemedText>
          )}
        </View>

        {/* Confirm */}
        <Pressable
          style={[styles.confirmButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
          onPress={() => router.push('/review')}>
          <ThemedText style={styles.confirmButtonText}>Confirm & Pay  R {totalAmount}</ThemedText>
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
    gap: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 14,
    marginTop: -8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  tipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 100,
    borderWidth: 1.5,
    minWidth: 76,
    alignItems: 'center',
  },
  tipBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
  },
  paymentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  paymentIconText: {
    fontSize: 20,
  },
  paymentLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  checkDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDotText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  totalCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tipNote: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 8,
  },
  confirmButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 17,
    borderRadius: 100,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 7,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
});
