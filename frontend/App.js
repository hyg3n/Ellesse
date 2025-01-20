import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

const App = () => {
  const [service, setService] = useState('');
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [region, setRegion] = useState(null);

  // Fetch live location on app load
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Location permission denied');
          return;
        }
      }
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          console.log('Current Position:', position.coords);
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        },
        error => {
          console.error('Geolocation error:', error);
          setMessage(
            'Unable to fetch location. Please enable location services.'
          );
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
      );
    };

    requestLocationPermission();
  }, []);

  const searchProviders = async () => {
    console.log('Search button pressed. Service:', service);
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
      console.log('API Response:', response.data);

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

  // If user toggles showMap to true, show the map screen
  if (showMap) {
    console.log('Rendering map screen. showMap is true.');
    return (
      <View style={{flex: 1}}>
        <MapView
          provider={PROVIDER_GOOGLE} // Use Google if you have a Google Maps API Key
          style={styles.map}
          // Provide a fallback initialRegion if region is not yet available
          initialRegion={
            region || {
              latitude: 37.7749,
              longitude: -122.4194,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
          }
          region={region} // Once set, it overrides initialRegion
          showsUserLocation
        >
          {providers.map(provider => (
            <Marker
              key={provider.id}
              coordinate={{
                latitude: provider.latitude,
                longitude: provider.longitude,
              }}
              title={provider.name}
              description={`${provider.service} - ${provider.rating}★`}
            />
          ))}
        </MapView>

        {/* Simple "Back" button to return to the list view */}
        <View style={styles.backButtonContainer}>
          <Button
            title="Back to List"
            onPress={() => {
              console.log('Back to List pressed.');
              setShowMap(false);
            }}
          />
        </View>
      </View>
    );
  }

  // Otherwise, show the main list/search view
  console.log('Rendering main screen. showMap is false.');
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

      {providers.length > 0 && (
        <View style={styles.fixedButtonContainer}>
          <Button
            title="Show on Map"
            onPress={() => {
              console.log('Show on Map pressed!');
              Alert.alert('Debug', 'Show on Map pressed!');
              setShowMap(true);
            }}
            color="#007BFF"
          />
        </View>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <FlatList
        data={providers}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.provider}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>
              {item.service} - {item.rating}★
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !loading && !message ? (
            <Text style={styles.message}>No providers to display.</Text>
          ) : null
        }
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
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 20, // Distance from the bottom of the screen
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 999, // ensure button is on top
  },
  backButtonContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 999,
  },
});

export default App;
