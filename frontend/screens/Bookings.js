//screens/Bookings.js

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme, Typography, Spacing} from '../styles/theme';

const Booking = ({item, onPress, palette}) => {
  const statusColor = getStatusColor(item.status, palette);
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          shadowColor: palette.shadow,
          borderLeftColor: statusColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.accent} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[Typography.subtitle, {color: palette.text}]}>
            {item.provider_name}
          </Text>
          <Text style={[Typography.subtitle, {color: palette.text}]}>
            {item.service_name}
          </Text>
        </View>
        <Text
          style={[
            Typography.caption,
            {color: palette.text, marginTop: Spacing.xs},
          ]}>
          {item.description || 'No details'}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.statusBadge, {borderColor: statusColor}]}>
            <Text style={[Typography.caption, {color: statusColor}]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          <Text style={[Typography.caption, {color: palette.text}]}>
            {new Date(item.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>
      <Text style={[styles.chevron, {color: palette.primary}]}>›</Text>
    </TouchableOpacity>
  );
};

const Bookings = ({navigation}) => {
  const {palette, styles: themeStyles} = useTheme();
  const [bookings, setBookings] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Upcoming');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://10.0.2.2:3000/api/bookings', {
        headers: {Authorization: `Bearer ${token}`},
      });
      setBookings(response.data);
    } catch {
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const filters = ['Upcoming', 'Pending', 'History'];
  const filtered = bookings.filter(b => {
    const st = b.status.toLowerCase();
    if (selectedFilter === 'Upcoming') return st === 'accepted';
    if (selectedFilter === 'Pending') return st === 'pending';
    if (selectedFilter === 'History')
      return ['declined', 'completed'].includes(st);
    return true;
  });

  return (
    <View style={themeStyles.container}>
      <Text
        style={[Typography.h2, {color: palette.text, marginBottom: Spacing.m}]}>
        My Bookings
      </Text>
      <View style={styles.filterRow}>
        {filters.map(f => {
          const isSel = selectedFilter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setSelectedFilter(f)}
              style={[
                styles.filterTab,
                isSel && {backgroundColor: palette.primary},
              ]}
              activeOpacity={0.7}>
              <Text
                style={[
                  Typography.body,
                  {color: isSel ? palette.background : palette.text},
                ]}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={palette.primary}
          style={{marginTop: Spacing.l}}
        />
      ) : error ? (
        <Text
          style={[
            Typography.body,
            {color: palette.error, textAlign: 'center', marginTop: Spacing.l},
          ]}>
          {error}
        </Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.booking_id.toString()}
          renderItem={({item}) => (
            <Booking
              item={item}
              palette={palette}
              onPress={() =>
                navigation.navigate('BookingDetails', {booking: item})
              }
            />
          )}
          contentContainerStyle={{paddingBottom: Spacing.l}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text
              style={[
                Typography.body,
                {
                  color: palette.text,
                  textAlign: 'center',
                  marginTop: Spacing.l,
                },
              ]}>
              No bookings to show.
            </Text>
          }
        />
      )}
    </View>
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

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    marginBottom: Spacing.m,
    borderRadius: Spacing.s,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.s,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
    marginBottom: Spacing.m,
    borderRadius: Spacing.l,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  accent: {
    width: 4,
    height: '100%',
    borderTopLeftRadius: Spacing.l,
    borderBottomLeftRadius: Spacing.l,
    marginRight: Spacing.m,
  },
  content: {flex: 1},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.xs,
    borderWidth: 1,
  },
  chevron: {
    fontSize: 24,
    marginLeft: Spacing.s,
  },
});

export default Bookings;
