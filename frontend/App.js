import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MapView from 'react-native-maps';

const App = () => {
  const [service, setService] = useState('');
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const searchProviders = async () => {
    const trimmedService = service.trim();

    if (trimmedService === '') {
      setMessage('Please enter a service to search.');
      setProviders([]);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.get(
        `http://10.0.2.2:3000/api/providers?service=${trimmedService}`
      );

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
      setLoading(false);
    }
  };

  if (showMap) {
    return (
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 51.5074,
          longitude: -0.1278,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Service Search</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter a service (e.g., Plumbing)"
        value={service}
        onChangeText={setService}
        autoCapitalize="none"
      />

      <Button title="Search" onPress={searchProviders} />

      <Button
        title="Show Map"
        onPress={() => setShowMap(true)}
        color="#007BFF"
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <FlatList
        data={providers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.provider}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>
              {item.service} - {item.rating}★
            </Text>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  provider: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    marginTop: 10,
    color: 'red',
    textAlign: 'center',
  },
  loading: {
    marginVertical: 20,
  },
  map: {
    flex: 1,
  },
});

export default App;
