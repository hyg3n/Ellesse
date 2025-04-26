import React, { useState, useEffect } from 'react';
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
import { useTheme, Typography, Spacing } from '../styles/theme';

const CategoryDetails = ({ route, navigation }) => {
  const { category } = route.params;  // category object from Home screen
  const { palette, styles: themeStyles } = useTheme();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        // Adjust endpoint if necessary.
        const response = await axios.get(
          `http://10.0.2.2:3000/api/providersByCategory?category=${category.name}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
    <View
      style={[
        localStyles.card,
        { backgroundColor: palette.card, borderLeftColor: palette.primary, shadowColor: palette.shadow, },
      ]}
    >
      {/* Left content: name, service, price & rating */}
      <View style={localStyles.contentContainer}>
        <Text style={[Typography.subtitle, { color: palette.text }]}>  
          {item.name}
        </Text>
        <Text
          style={[
            Typography.body,
            { color: palette.text, marginVertical: Spacing.xs },
          ]}
        >
          {item.service_name}
        </Text>
        <View style={localStyles.rowInline}>
          <View style={localStyles.tag}>
            <Text style={[Typography.body, { color: palette.primary }]}>£{item.price}</Text>
          </View>
          <View style={[localStyles.tag, { backgroundColor: palette.backgroundLight, marginLeft: Spacing.s }]}>  
            <Text style={[Typography.body, { color: palette.text }]}>★ {item.rating}</Text>
          </View>
        </View>
      </View>

      {/* Right content: Book button */}
      <TouchableOpacity
        style={[localStyles.bookButton, { backgroundColor: palette.primary }]}
        onPress={() => navigation.navigate('NewBooking', { provider: item })}
      >
        <Text style={[localStyles.bookButtonText, { color: palette.background }]}>Book</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={themeStyles.container}>
      <Text
        style={[
          Typography.h2,
          { color: palette.text, marginBottom: Spacing.m },
        ]}
      >
        {category.name}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={palette.primary} />
      ) : message ? (
        <Text
          style={[
            Typography.body,
            { color: palette.error, textAlign: 'center' },
          ]}
        >
          {message}
        </Text>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={item => item.ps_id.toString()}
          renderItem={renderProvider}
          contentContainerStyle={{ paddingBottom: Spacing.l }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[Typography.body, { color: palette.error, textAlign: 'center' }]}>No providers to display.</Text>
          }
        />
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderRadius: Spacing.s,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    // Shadow for iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    paddingRight: Spacing.m,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  tag: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.s,
    borderRadius: Spacing.xs,
  },
  bookButton: {
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: Spacing.s,
  },
  bookButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
});

export default CategoryDetails;
