// screens/Home.js
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
  Alert,
  TouchableOpacity,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {iconsMap} from '../assets/icons/categoryIcons'; 

const Home = ({navigation}) => {
  const [service, setService] = useState('');
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]); // State for service categories
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
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
            'Unable to fetch location. Please enable location services.',
          );
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
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
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      // Attach token in the Authorization header
      const response = await axios.get(
        `http://10.0.2.2:3000/api/users?service_name=${trimmedService}`,
        {headers: {Authorization: `Bearer ${token}`}},
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

  // Fetch service categories when no search term is entered
  useEffect(() => {
    const fetchCategories = async () => {
      if (service.trim() !== '') {
        setCategories([]); // Hide categories if user is searching
        return;
      }
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(
          'http://10.0.2.2:3000/api/service_categories',
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        if (response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [service]);

  if (showMap) {
    return (
      <View style={{flex: 1}}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={
            region || {
              latitude: 37.7749,
              longitude: -122.4194,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
          }
          region={region}
          showsUserLocation>
          {providers.map(provider => (
            <Marker
              key={provider.id}
              coordinate={{
                latitude: provider.latitude,
                longitude: provider.longitude,
              }}
              title={provider.name}
              description={`${provider.service_name} - $${provider.price} - ${provider.rating}★`}
            />
          ))}
        </MapView>
        <View style={styles.backButtonContainer}>
          <Button title="Back to List" onPress={() => setShowMap(false)} />
        </View>
      </View>
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
      {providers.length > 0 && (
        <View style={styles.fixedButtonContainer}>
          <Button
            title="Show on Map"
            onPress={() => {
              setShowMap(true);
            }}
            color="#007BFF"
          />
        </View>
      )}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loading}
        />
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {/* Show categories area only if no search term is active */}
      {service.trim() === '' && categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <Text style={styles.subtitle}>Browse Services:</Text>
          <FlatList
            data={categories}
            keyExtractor={item => item.id.toString()}
            numColumns={2} // <-- Use 2 columns for grid layout
            columnWrapperStyle={styles.columnWrapper} // optional style for row spacing
            renderItem={({item}) => {
              const Icon = iconsMap[item.icon_path];
              return (
                <TouchableOpacity
                  style={styles.categoryTab}
                  onPress={() =>
                    navigation.navigate('CategoryDetails', {category: item})
                  }>
                  <View style={styles.categoryContent}>
                    {Icon && <Icon width={50} height={50} />}
                    <Text style={styles.categoryText}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      <FlatList
        data={providers}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.provider}
            onPress={() => navigation.navigate('NewBooking', {provider: item})}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>
              {item.service_name} - £{item.price} - {item.rating}★
            </Text>
            <Button
              title="Book"
              onPress={() =>
                navigation.navigate('NewBooking', {provider: item})
              }
            />
          </TouchableOpacity>
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
  container: {flex: 1, padding: 20, backgroundColor: '#f5f5f5'},
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
  provider: {padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee'},
  name: {fontWeight: 'bold', fontSize: 16},
  message: {marginTop: 10, color: 'red', textAlign: 'center'},
  loading: {marginVertical: 20},
  map: {flex: 1},
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 999,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  categoriesContainer: {marginVertical: 20},
  subtitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  columnWrapper: {justifyContent: 'space-between', marginBottom: 10},
  categoryTab: {
    backgroundColor: '',
    borderRadius: 8,
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  categoryText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
    flexShrink: 1,
    maxWidth: '75%',
  },
});

export default Home;
