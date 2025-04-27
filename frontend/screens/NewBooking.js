// screens/NewBooking.js

import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import { useStripe } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme, Typography, Spacing} from '../styles/theme';

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('token');
  return token ? {Authorization: `Bearer ${token}`} : {};
}

const NewBooking = ({route}) => {
  const {provider} = route.params;
  const {palette, styles: themeStyles, scheme} = useTheme();
  const navigation = useNavigation();
  const {initPaymentSheet, presentPaymentSheet} = useStripe();

  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const showPicker = () => setPickerVisible(true);
  const hidePicker = () => setPickerVisible(false);

  const handleConfirm = date => {
    setDateTime(date.toISOString());
    hidePicker();
  };

  const requestBooking = async () => {
    if (!dateTime) {
      return Alert.alert(
        'Missing appointment',
        'Please choose an appointment time.',
      );
    }
    setLoading(true);

    try {
      const headers = await getAuthHeaders();
      // Create a manual‐capture PaymentIntent
      const piRes = await fetch(
        'http://10.0.2.2:3000/api/payments/create-payment-intent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({amount: provider.price * 100}),
        },
      );
      if (!piRes.ok) {
        const err = await piRes.text();
        throw new Error(`PaymentIntent creation failed: ${err}`);
      }
      const {clientSecret, paymentIntentId} = await piRes.json();

      // Initialize & present the PaymentSheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'LSC',             
        merchantCountryCode: 'GB',                   
        paymentIntentClientSecret: clientSecret,
         applePay: true,
         googlePay: true,
      });
      if (initError) throw new Error(initError.message);

      setLoading(false);
      const {error: payError} = await presentPaymentSheet();
      setLoading(true);

      if (payError) {
        Alert.alert('Payment failed', payError.message);
        setLoading(false);
        return;
      }

      // On payment success, create the booking with the PI id
      const bookingRes = await axios.post(
        'http://10.0.2.2:3000/api/bookings',
        {
          provider_id: provider.user_id,
          provider_service_id: provider.ps_id,
          description,
          scheduled_at: dateTime,
          payment_intent_id: paymentIntentId,
        },
        {headers},
      );

      // Kick off chat & final alert
      const {data: chatRes} = await axios.post(
        'http://10.0.2.2:3000/api/chats/findOrCreateChat',
        {otherUserId: provider.user_id},
        {headers},
      );
      const chatId = chatRes.chat.id;

      await axios.post(
        'http://10.0.2.2:3000/api/messages',
        {
          chat_id: chatId,
          receiver_id: provider.user_id,
          message: `Your booking request for '${provider.service_name}' has been sent.`,
          type: 'system',
        },
        {headers},
      );

      Alert.alert(
        'Booking Requested',
        'Your booking is now pending provider approval.',
        [
          {
            text: 'View Chat',
            onPress: () => navigation.navigate('ChatScreen', {chatId}),
          },
          {text: 'OK', onPress: () => navigation.goBack(), style: 'cancel'},
        ],
        {cancelable: false},
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!dateTime && !loading;

  return (
    <ScrollView
      style={themeStyles.container}
      contentContainerStyle={localStyles.scroll}>
      {/* Provider info */}
      <View
        style={[
          localStyles.card,
          {
            backgroundColor: palette.card,
            borderLeftColor: palette.primary,
            shadowColor: palette.shadow,
          },
        ]}>
        <Text
          style={[
            Typography.h2,
            {color: palette.text, marginBottom: Spacing.s},
          ]}>
          Booking for
        </Text>
        <Text style={[Typography.h1, {color: palette.text}]}>
          {provider.name}
        </Text>
        <Text
          style={[
            Typography.body,
            {color: palette.text, marginTop: Spacing.xs},
          ]}>
          “{provider.service_name}”
        </Text>
        <View style={localStyles.rowInline}>
          <View
            style={[
              localStyles.tag,
              {backgroundColor: palette.backgroundLight},
            ]}>
            <Text style={[Typography.body, {color: palette.primary}]}>
              £{provider.price}
            </Text>
          </View>
          <View
            style={[
              localStyles.tag,
              {backgroundColor: palette.backgroundLight, marginLeft: Spacing.s},
            ]}>
            <Text style={[Typography.body, {color: palette.text}]}>
              ★ {provider.rating}
            </Text>
          </View>
        </View>
      </View>

      {/* Appointment picker */}
      <Text
        style={[
          Typography.subtitle,
          {color: palette.text, marginBottom: Spacing.xs},
        ]}>
        Appointment Time
      </Text>
      <TouchableOpacity
        style={[themeStyles.input, {justifyContent: 'center'}]}
        onPress={showPicker}>
        <Text
          style={[
            Typography.body,
            {color: dateTime ? palette.text : palette.placeholder},
          ]}>
          {dateTime
            ? new Date(dateTime).toLocaleString()
            : 'Select date & time'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        minimumDate={new Date()}
        isDarkModeEnabled={scheme === 'dark'}
      />

      {/* Details */}
      <Text
        style={[
          Typography.subtitle,
          {color: palette.text, marginTop: Spacing.m, marginBottom: Spacing.xs},
        ]}>
        Details (optional)
      </Text>
      <TextInput
        style={[themeStyles.input, {height: 120, textAlignVertical: 'top'}]}
        placeholder="Describe your service needs..."
        placeholderTextColor={palette.placeholder}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Submit */}
      <TouchableOpacity
        disabled={!canSubmit}
        style={[
          localStyles.submitButton,
          {
            backgroundColor: palette.primary,
            opacity: canSubmit ? 1 : 0.5,
          },
        ]}
        onPress={requestBooking}>
        <Text
          style={[localStyles.submitButtonText, {color: palette.background}]}>
          {loading ? 'Sending…' : 'Request Booking'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  scroll: {
    padding: Spacing.m,
    paddingBottom: Spacing.l,
  },
  card: {
    borderLeftWidth: 4,
    borderRadius: Spacing.s,
    padding: Spacing.m,
    marginBottom: Spacing.l,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  tag: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.s,
    borderRadius: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.l,
    paddingVertical: Spacing.m,
    borderRadius: Spacing.s,
    alignItems: 'center',
  },
  submitButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
});

export default NewBooking;
