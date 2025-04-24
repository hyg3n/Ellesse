// Account.js
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Account = () => {
  const { logout } = useContext(AuthContext);
  const [role, setRole] = useState('user');
  const [activeView, setActiveView] = useState('user');

  useEffect(() => {
    const fetchRole = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) return;
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      setRole(tokenPayload.role);
    };
    fetchRole();
  }, []);

  const isProvider = role.includes('provider');
  const toggleView = () => {
    const nextView = activeView === 'user' ? 'provider' : 'user';
    setActiveView(nextView);
    AsyncStorage.setItem('activeView', nextView);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Summary (Optional future enhancement) */}

      {/* Role Section */}
      <View style={styles.section}>
        {isProvider ? (
          <View style={styles.toggleContainer}>
            <Text style={styles.sectionTitle}>Browsing as {activeView}</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Client</Text>
              <Switch value={activeView === 'provider'} onValueChange={toggleView} />
              <Text style={styles.switchLabel}>Provider</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Offer Your Services</Text>
            <Text style={styles.ctaSubtitle}>Become a provider and get booked by clients</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {['Personal Information', 'Payments and Payouts', 'Taxes', 'Login and Security', 'Notifications', 'Privacy and Sharing'].map(label => (
          <TouchableOpacity key={label} style={styles.row}><Text>{label}</Text></TouchableOpacity>
        ))}
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {['Help Centre', 'Feedback'].map(label => (
          <TouchableOpacity key={label} style={styles.row}><Text>{label}</Text></TouchableOpacity>
        ))}
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        {['Terms of Service', 'Privacy Policy'].map(label => (
          <TouchableOpacity key={label} style={styles.row}><Text>{label}</Text></TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={logout} style={[styles.row, { marginTop: 30 }]}> 
        <Text style={{ color: 'red' }}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  section: { padding: 20, borderBottomWidth: 1, borderColor: '#ddd' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  row: { paddingVertical: 12 },
  ctaCard: {
    backgroundColor: '#e6f0ff',
    padding: 15,
    borderRadius: 10,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  toggleContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  switchLabel: { fontSize: 14, color: '#333' },
});

export default Account;
