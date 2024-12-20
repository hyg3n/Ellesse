import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

const App = () => {
  const [service, setService] = useState('');
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const searchProviders = async () => {
    // Trim the input to remove leading/trailing whitespace
    const trimmedService = service.trim();

    // Prevent empty searches
    if (trimmedService === '') {
      setMessage('Please enter a service to search.');
      setProviders([]);
      return;
    }

    setLoading(true);      // Show loading indicator
    setMessage('');        // Clear previous messages

    try {
      const response = await axios.get(`http://10.0.2.2:3000/api/providers?service=${trimmedService}`);
      
      if (response.data.length === 0) {
        setMessage('No providers found for this service.');
        setProviders([]);
      } else {
        setProviders(response.data);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setMessage('An error occurred while fetching providers.');
      setProviders([]);
    } finally {
      setLoading(false);   // Hide loading indicator
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Service Search</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter a service (e.g., Plumbing)"
        value={service}
        onChangeText={setService}
        autoCapitalize="none"       // Prevent automatic capitalization
      />
      
      <Button title="Search" onPress={searchProviders} />
      
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />}
      
      {message ? <Text style={styles.message}>{message}</Text> : null}
      
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.provider}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.service} - {item.rating}★</Text>
          </View>
        )}
        ListEmptyComponent={!loading && !message ? <Text style={styles.message}>No providers to display.</Text> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5'  // Optional: Add a light background color
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    textAlign: 'center'        // Optional: Center the title
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc',        // Optional: Add a border color
    borderRadius: 5,            // Optional: Add rounded corners
    padding: 10, 
    marginBottom: 10,
    backgroundColor: '#fff'     // Optional: White background for input
  },
  provider: { 
    padding: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee'   // Optional: Light border color
  },
  name: { 
    fontWeight: 'bold', 
    fontSize: 16               // Optional: Increase font size for names
  },
  message: { 
    marginTop: 10, 
    color: 'red', 
    textAlign: 'center'        // Optional: Center the message text
  },
  loading: {
    marginVertical: 20
  }
});

export default App;
