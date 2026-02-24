import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';

const API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey ?? '';

// Log key status on load so we can confirm it's being received
console.log('[AddressAutocomplete] API_KEY present:', !!API_KEY, '| length:', API_KEY.length);

interface AddressAutocompleteProps {
  value: string;
  onSelect: (address: string, lat: number, lng: number) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onSelect,
  onClear,
  placeholder = 'Search for your address...',
}: AddressAutocompleteProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const ref = useRef<GooglePlacesAutocompleteRef>(null);

  // Sync text when parent sets value externally (e.g. GPS fill)
  useEffect(() => {
    if (value && ref.current?.getAddressText() !== value) {
      ref.current?.setAddressText(value);
    }
  }, [value]);

  return (
    <View style={styles.wrapper}>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={placeholder}
        fetchDetails
        enablePoweredByContainer={false}
        minLength={3}
        debounce={300}
        textInputProps={{
          defaultValue: value,
          placeholderTextColor: colors.icon,
          onChangeText: (text) => console.log('[AddressAutocomplete] typing:', text),
          onSubmitEditing: () => {},
        }}
        query={{
          key: API_KEY,
          language: 'en',
          components: 'country:za', // restrict to South Africa — remove or change as needed
        }}
        onPress={(data, details) => {
          if (!details?.geometry?.location) {
            console.warn('[AddressAutocomplete] onPress: no geometry in details', details);
            return;
          }
          const { lat, lng } = details.geometry.location;
          const address = data.description;
          console.log('[AddressAutocomplete] Selected:', address, lat, lng);
          onSelect(address, lat, lng);
        }}
        onFail={(error) => console.error('[AddressAutocomplete] API error:', error)}
        onNotFound={() => console.warn('[AddressAutocomplete] No results found')}
        onTimeout={() => console.warn('[AddressAutocomplete] Request timed out')}
        requestUrl={undefined} // use default Google endpoint
        styles={{
          container: {
            flex: 0,
          },
          textInputContainer: {
            backgroundColor: 'transparent',
          },
          textInput: {
            backgroundColor: colors.card,
            borderWidth: 1.5,
            borderColor: colors.border,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
            color: colors.text,
            height: 52,
          },
          listView: {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            marginTop: 4,
            overflow: 'hidden',
          },
          row: {
            backgroundColor: colors.card,
            paddingVertical: 14,
            paddingHorizontal: 16,
          },
          separator: {
            height: 1,
            backgroundColor: colors.border,
          },
          description: {
            color: colors.text,
            fontSize: 14,
          },
          poweredContainer: {
            display: 'none',
          },
        }}
        keepResultsAfterBlur={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
  },
});
