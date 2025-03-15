// screens/Chats.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Chats = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chats Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20 },
});

export default Chats;
