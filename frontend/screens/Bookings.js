// screens/Bookings.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Bookings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bookings Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20 },
});

export default Bookings;
