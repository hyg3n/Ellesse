// screens/ProviderDashboard.js
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
  Button,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme, Typography, Spacing} from '../styles/theme';

export default function ProviderDashboard() {
  const {palette} = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    comingUpNext: null,
    pendingRequests: [],
    earnings: {week_to_date: 0, year_to_date: 0},
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(
        'http://10.0.2.2:3000/api/provider/dashboard',
        {headers: {Authorization: `Bearer ${token}`}},
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Change a booking from "pending" → "accepted" or "declined"
  const changeStatus = async (bookingId, action) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `http://10.0.2.2:3000/api/bookings/${bookingId}/${action}`,
        {},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      // Refresh the list after success
      fetchDashboard();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', `Could not ${action} booking`);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, []);

  const {comingUpNext, pendingRequests, earnings} = data;

  return (
    <ScrollView
      style={styles.container(palette)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[palette.primary]}
        />
      }>
      <Text
        style={[Typography.h2, {color: palette.text, marginBottom: Spacing.m}]}>
        Dashboard
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={palette.primary} />
      ) : (
        <>
          {/* Next Appointment */}
          <View
            style={[
              styles.card,
              {backgroundColor: palette.card, borderLeftColor: palette.primary},
            ]}>
            <Text
              style={[
                Typography.subtitle,
                {color: palette.text, marginBottom: Spacing.s},
              ]}>
              Next Appointment
            </Text>
            {comingUpNext ? (
              <>
                <Text style={[Typography.body, {color: palette.text}]}>
                  Client: {comingUpNext.client_name}
                </Text>
                <Text style={[Typography.body, {color: palette.text}]}>
                  Service: {comingUpNext.service_name}
                </Text>
                <Text style={[Typography.body, {color: palette.text}]}>
                  When:{' '}
                  {new Date(comingUpNext.appointment_time).toLocaleString()}
                </Text>
                <Text style={[Typography.body, {color: palette.text}]}>
                  Price: £{comingUpNext.service_price}
                </Text>
              </>
            ) : (
              <Text style={[Typography.body, {color: palette.placeholder}]}>
                No upcoming appointments
              </Text>
            )}
          </View>

          {/* Pending Requests */}
          <Text
            style={[
              Typography.subtitle,
              {color: palette.text, marginBottom: Spacing.s},
            ]}>
            Pending Requests
          </Text>
          {pendingRequests.length > 0 ? (
            pendingRequests.map(r => (
              <View
                key={r.booking_id}
                style={[styles.card, {backgroundColor: palette.card}]}>
                <Text
                  style={[
                    Typography.body,
                    {color: palette.text, fontWeight: '600'},
                  ]}>
                  {r.client_name}
                </Text>
                <Text style={[Typography.caption, {color: palette.text}]}>
                  {r.service_name} • £{r.service_price}
                </Text>
                <Text style={[Typography.caption, {color: palette.text}]}>
                  {new Date(r.appointment_time).toLocaleString()}
                </Text>

                {/* Accept / Decline buttons */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: Spacing.s,
                  }}>
                  <View style={{marginRight: Spacing.s}}>
                    <Button
                      title="Decline"
                      onPress={() => changeStatus(r.booking_id, 'decline')}
                      color={palette.error}
                    />
                  </View>
                  <Button
                    title="Accept"
                    onPress={() => changeStatus(r.booking_id, 'accept')}
                    color={palette.primary}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={[Typography.body, {color: palette.placeholder}]}>
              No pending requests
            </Text>
          )}

          {/* Earnings */}
          <View style={[styles.card, {backgroundColor: palette.card}]}>
            <Text
              style={[
                Typography.subtitle,
                {color: palette.text, marginBottom: Spacing.s},
              ]}>
              Earnings
            </Text>
            <View style={styles.earningsRow}>
              <View style={styles.earningCol}>
                <Text style={[Typography.body, {color: palette.text}]}>
                  This Week
                </Text>
                <Text style={[Typography.h2, {color: palette.text}]}>
                  £{earnings.week_to_date}
                </Text>
              </View>
              <View style={styles.earningCol}>
                <Text style={[Typography.body, {color: palette.text}]}>
                  This Year
                </Text>
                <Text style={[Typography.h2, {color: palette.text}]}>
                  £{earnings.year_to_date}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: palette => ({
    flex: 1,
    backgroundColor: palette.backgroundLight,
    padding: Spacing.m,
  }),
  card: {
    borderLeftWidth: 4,
    borderRadius: Spacing.s,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    // Android elevation
    elevation: 2,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningCol: {
    flex: 1,
    alignItems: 'center',
  },
});
