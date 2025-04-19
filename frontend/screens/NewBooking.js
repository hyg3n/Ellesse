// screens/NewBooking.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NewBooking = ({ route, navigation }) => {
  const { provider } = route.params; // Provider details passed from Home screen
  const [description, setDescription] = useState('');

  const requestBooking = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        'http://10.0.2.2:3000/api/bookings',
        { provider_id: provider.id, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Booking Requested', 'Your booking is now pending provider approval.');
      navigation.goBack(); // Navigate back or to another screen as needed
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking for {provider.name}</Text>
      <Text style={styles.subtitle}>Enter details for your request (optional):</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe your service needs..."
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Button title="Request Booking" onPress={requestBooking} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default NewBooking;
