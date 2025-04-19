// screens/Bookings.js

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Bookings = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Pending'); // Options: Pending, Upcoming, History
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://10.0.2.2:3000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings based on status.
  // (Assuming statuses: "pending" for pending, "accepted" for upcoming, and "declined"/"completed" for history.)
  const filteredBookings = bookings.filter(booking => {
    if (selectedFilter === 'Pending') return booking.status.toLowerCase() === 'pending';
    if (selectedFilter === 'Upcoming') return booking.status.toLowerCase() === 'accepted';
    if (selectedFilter === 'History')
      return (
        booking.status.toLowerCase() === 'declined' ||
        booking.status.toLowerCase() === 'completed'
      );
    return true;
  });

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookingItem}
      onPress={() => navigation.navigate('BookingDetails', { booking: item })}
    >
      <Text style={styles.bookingTitle}>Booking with {item.provider_name}</Text>
      <Text>Status: {item.status}</Text>
      <Text numberOfLines={1}>Description: {item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Bookings</Text>
      <View style={styles.filterContainer}>
        <Button
          title="Pending"
          onPress={() => setSelectedFilter('Pending')}
          color={selectedFilter === 'Pending' ? '#007BFF' : 'gray'}
        />
        <Button
          title="Upcoming"
          onPress={() => setSelectedFilter('Upcoming')}
          color={selectedFilter === 'Upcoming' ? '#007BFF' : 'gray'}
        />
        <Button
          title="History"
          onPress={() => setSelectedFilter('History')}
          color={selectedFilter === 'History' ? '#007BFF' : 'gray'}
        />
      </View>
      {loading && <ActivityIndicator size="large" color="#007BFF" />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id.toString()}
        renderItem={renderBookingItem}
        ListEmptyComponent={
          !loading && <Text style={styles.empty}>No bookings in this category.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  bookingItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  bookingTitle: { fontSize: 18, fontWeight: 'bold' },
  error: { color: 'red', textAlign: 'center' },
  empty: { textAlign: 'center', marginTop: 20 },
});

export default Bookings;
