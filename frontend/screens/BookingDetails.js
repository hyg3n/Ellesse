// screens/BookingDetails.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme, Typography, Spacing} from '../styles/theme';

const BookingDetails = ({route, navigation}) => {
  const {booking} = route.params;
  const {palette, styles: themeStyles} = useTheme();
  const [loading, setLoading] = React.useState(false);

  // When user taps "Chat with Provider", find or create the chat and then navigate
  const goToChat = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      // hit your endpoint to get or create the chat
      const {data} = await axios.post(
        'http://10.0.2.2:3000/api/chats/findOrCreateChat',
        {otherUserId: booking.provider_id},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      const chatId = data.chat.id;
      // now navigate with the actual chatId
      navigation.navigate('ChatScreen', {chatId});
    } catch (err) {
      console.error('Error finding/creating chat:', err);
      Alert.alert('Error', 'Could not open chat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={themeStyles.container}
      contentContainerStyle={localStyles.scroll}>

      {/* Detail card */}
      <View
        style={[
          localStyles.card,
          {backgroundColor: palette.card, shadowColor: palette.shadow},
        ]}>
        <View style={localStyles.row}>
          <Text style={[Typography.subtitle, {color: palette.text}]}>
            Provider
          </Text>
          <Text style={[Typography.body, {color: palette.text}]}>
            {booking.provider_name}
          </Text>
        </View>
        <View style={localStyles.row}>
          <Text style={[Typography.subtitle, {color: palette.text}]}>
            Service
          </Text>
          <Text style={[Typography.body, {color: palette.text}]}>
            {booking.service_name || '—'}
          </Text>
        </View>
        <View style={localStyles.row}>
          <Text style={[Typography.subtitle, {color: palette.text}]}>
            Description
          </Text>
          <Text style={[Typography.body, {color: palette.text}]}>
            {booking.description || 'No details provided.'}
          </Text>
        </View>
        <View style={localStyles.row}>
          <Text style={[Typography.subtitle, {color: palette.text}]}>
            Status
          </Text>
          <View
            style={[
              localStyles.statusBadge,
              {borderColor: getStatusColor(booking.status, palette)},
            ]}>
            <Text
              style={[
                Typography.caption,
                {color: getStatusColor(booking.status, palette)},
              ]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={localStyles.row}>
          <Text style={[Typography.subtitle, {color: palette.text}]}>
            Requested on
          </Text>
          <Text style={[Typography.body, {color: palette.text}]}>
            {new Date(booking.created_at).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </Text>
        </View>
      </View>

      {/* Chat button */}
      <TouchableOpacity
        style={[
          localStyles.chatButton,
          {
            backgroundColor: palette.primary,
            opacity: loading ? 0.6 : 1, // fade when loading
          },
        ]}
        onPress={goToChat}
        disabled={loading} // disable button while loading
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color={palette.background} />
        ) : (
          <Text
            style={[
              Typography.body,
              {color: palette.background, fontWeight: '600'},
            ]}>
            Chat with Provider
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStatusColor = (status, palette) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return palette.primary;
    case 'accepted':
      return 'green';
    case 'declined':
      return palette.error;
    case 'completed':
      return palette.border;
    default:
      return palette.primary;
  }
};

const localStyles = StyleSheet.create({
  scroll: {
    padding: Spacing.m,
    paddingBottom: Spacing.l,
  },
  card: {
    borderRadius: Spacing.s,
    padding: Spacing.m,
    marginBottom: Spacing.l,
    // shadow
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.s,
  },
  statusBadge: {
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.xs,
    borderWidth: 1,
  },
  chatButton: {
    paddingVertical: Spacing.m,
    alignItems: 'center',
    borderRadius: Spacing.s,
  },
});

export default BookingDetails;
