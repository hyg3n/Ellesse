// screens/BookingDetails.js

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const BookingDetails = ({ route, navigation }) => {
  const { booking } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Booking Details</Text>
      <Text style={styles.label}>Provider:</Text>
      <Text style={styles.value}>{booking.provider_name}</Text>
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.value}>{booking.description}</Text>
      <Text style={styles.label}>Status:</Text>
      <Text style={styles.value}>{booking.status}</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Chat with Provider"
          onPress={() => navigation.navigate('ChatScreen', { booking })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  value: { fontSize: 16, marginBottom: 10 },
  buttonContainer: { marginTop: 20 },
});

export default BookingDetails;
