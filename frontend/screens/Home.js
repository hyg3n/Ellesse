// screens/Home.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {iconsMap} from '../assets/icons/categoryIcons';
import {useTheme, Typography, Spacing} from '../styles/theme';

const Home = ({navigation}) => {
  const {palette, styles: themeStyles} = useTheme();
  const [service, setService] = useState('');
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]); // State for service categories
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [region, setRegion] = useState(null);

  // Request location permission and set region
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
      <View style={themeStyles.screen}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={localStyles.map}
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
              description={`${provider.service_name} - £${provider.price} - ${provider.rating}★`}
            />
          ))}
        </MapView>
        <View style={localStyles.backButtonContainer}>
          <Button
            title="Back to List"
            onPress={() => setShowMap(false)}
            color={palette.primary}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={themeStyles.container}>
      <Text
        style={[
          Typography.h1,
          {color: palette.text, textAlign: 'center', marginBottom: Spacing.m},
        ]}>
        Service Search
      </Text>

      <TextInput
        style={themeStyles.input}
        placeholder="Enter a service (e.g., Plumbing)"
        placeholderTextColor={palette.placeholder}
        value={service}
        onChangeText={setService}
        autoCapitalize="none"
      />

      <Button
        title="Search"
        onPress={searchProviders}
        color={palette.primary}
      />

      {providers.length > 0 && (
        <View style={localStyles.fixedButtonContainer}>
          <Button
            title="Show on Map"
            onPress={() => setShowMap(true)}
            color={palette.primary}
          />
        </View>
      )}

      {loading && (
        <ActivityIndicator
          size="large"
          color={palette.primary}
          style={localStyles.loading}
        />
      )}

      {message ? (
        <Text
          style={[
            Typography.body,
            {color: palette.error, textAlign: 'center', marginTop: Spacing.s},
          ]}>
          {message}
        </Text>
      ) : null}

      {/* Show categories area only if no search term is active */}
      {service.trim() === '' && categories.length > 0 && (
        <View style={localStyles.categoriesContainer}>
          <Text
            style={[
              Typography.subtitle,
              {color: palette.text, marginBottom: Spacing.s},
            ]}>
            Browse Services:
          </Text>
          <FlatList
            data={categories}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={localStyles.columnWrapper}
            renderItem={({item}) => {
              const Icon = iconsMap[item.icon_path];
              return (
                <TouchableOpacity
                  style={[
                    localStyles.categoryTab,
                    {backgroundColor: palette.card},
                  ]}
                  onPress={() =>
                    navigation.navigate('CategoryDetails', {category: item})
                  }>
                  <View style={localStyles.categoryContent}>
                    {Icon && <Icon width={50} height={50} />}
                    <Text
                      style={[
                        Typography.body,
                        {color: palette.text, maxWidth: '75%'},
                      ]}>
                      {item.name}
                    </Text>
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
            style={localStyles.provider}
            onPress={() => navigation.navigate('NewBooking', {provider: item})}>
            <Text
              style={[
                Typography.body,
                {fontWeight: 'bold', color: palette.text},
              ]}>
              {item.name}
            </Text>
            <Text style={[Typography.body, {color: palette.text}]}>
              {item.service_name} - £{item.price} - {item.rating}★
            </Text>
            <Button
              title="Book"
              onPress={() =>
                navigation.navigate('NewBooking', {provider: item})
              }
              color={palette.primary}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && !message ? (
            <Text
              style={[
                Typography.body,
                {color: palette.error, textAlign: 'center'},
              ]}>
              No providers to display.
            </Text>
          ) : null
        }
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  map: {flex: 1},
  fixedButtonContainer: {
    position: 'absolute',
    bottom: Spacing.m,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.m,
  },
  loading: {marginVertical: Spacing.l},
  backButtonContainer: {
    position: 'absolute',
    top: Spacing.l,
    left: Spacing.m,
    right: Spacing.m,
  },
  categoriesContainer: {marginVertical: Spacing.m},
  columnWrapper: {justifyContent: 'space-between', marginBottom: Spacing.m},
  categoryTab: {
    borderRadius: 8,
    width: '48%',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.s,
    justifyContent: 'center',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  provider: {
    padding: Spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
});

export default Home;
