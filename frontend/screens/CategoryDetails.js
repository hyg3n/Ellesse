// screens/CategoryDetails.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CategoryDetails = ({ route, navigation }) => {
  const { category } = route.params; // category object from Home screen
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        // Adjust endpoint if necessary.
        const response = await axios.get(`http://10.0.2.2:3000/api/providersByCategory?category=${category.name}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.length > 0) {
          setProviders(response.data);
        } else {
          setMessage('No providers found in this category.');
        }
      } catch (error) {
        console.error('Error fetching providers by category:', error);
        setMessage('Error fetching providers.');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [category.name]);

  const renderProvider = ({ item }) => (
    <TouchableOpacity
      style={styles.provider}
      onPress={() => navigation.navigate('NewBooking', { provider: item })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text>
        {item.service_name} - £{item.price} - {item.rating}★
      </Text>
      <Button
        title="Book"
        onPress={() => navigation.navigate('NewBooking', { provider: item })}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{category.name}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : message ? (
        <Text style={styles.message}>{message}</Text>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderProvider}
          ListEmptyComponent={<Text style={styles.message}>No providers to display.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  provider: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 10 },
  name: { fontWeight: 'bold', fontSize: 16 },
  message: { marginTop: 10, color: 'red', textAlign: 'center' },
});

export default CategoryDetails;
