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
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme, Typography, Spacing} from '../styles/theme';

const NewBooking = ({route}) => {
  const {provider} = route.params; // Provider details passed from Home screen
  const {palette, styles: themeStyles} = useTheme();
  const navigation = useNavigation();
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [loading, setLoading] = useState(false);

  const requestBooking = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');

      // Create booking
      const bookingRes = await axios.post(
        'http://10.0.2.2:3000/api/bookings',
        {
          provider_id: provider.user_id,
          provider_service_id: provider.ps_id,
          description,
          appointment: dateTime,
        },
        {headers: {Authorization: `Bearer ${token}`}},
      );
      const booking = bookingRes.data;

      // Find or create chat
      const chatRes = await axios.post(
        'http://10.0.2.2:3000/api/chats/findOrCreateChat',
        {
          otherUserId: provider.user_id,
        },
        {headers: {Authorization: `Bearer ${token}`}},
      );
      const chatId = chatRes.data.chat.id;

      // Send system message to chat
      await axios.post(
        'http://10.0.2.2:3000/api/messages',
        {
          chat_id: chatId,
          receiver_id: provider.user_id,
          message: `Your booking request for '${provider.service_name}' has been sent.`,
          type: 'system',
        },
        {headers: {Authorization: `Bearer ${token}`}},
      );

      Alert.alert(
        'Booking Requested',
        'Your booking is now pending provider approval.',
        [
          {
            text: 'View Chat',
            onPress: () => navigation.navigate('ChatScreen', {chatId}),
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      console.error('Error creating booking or chat:', error);
      Alert.alert('Error', 'Failed to create booking or open chat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={themeStyles.container}
      contentContainerStyle={localStyles.scroll}>
      {/* Provider info card */}
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

      {/* Date/time selector */}
      <Text
        style={[
          Typography.subtitle,
          {color: palette.text, marginBottom: Spacing.xs},
        ]}>
        Appointment Time
      </Text>
      <TouchableOpacity
        style={[themeStyles.input, {justifyContent: 'center'}]}
        onPress={() => {
          /* TODO: open native date/time picker to set dateTime */
        }}>
        <Text
          style={[
            Typography.body,
            {color: dateTime ? palette.text : palette.placeholder},
          ]}>
          {dateTime || 'Select date & time'}
        </Text>
      </TouchableOpacity>

      {/* Description input */}
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

      {/* Submit button */}
      <TouchableOpacity
        disabled={loading}
        style={[
          localStyles.submitButton,
          {backgroundColor: palette.primary, opacity: loading ? 0.6 : 1},
        ]}
        onPress={requestBooking}>
        <Text
          style={[localStyles.submitButtonText, {color: palette.background}]}>
          {loading ? 'Sending...' : 'Request Booking'}
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
    // Shadow for iOS
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    // Elevation for Android
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
