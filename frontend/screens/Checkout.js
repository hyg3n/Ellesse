// screens/Checkout.js

import React, {useEffect, useState} from 'react';
import {View, Button, Alert, ActivityIndicator, StyleSheet} from 'react-native';
import {CardField, useStripe} from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Checkout({route}) {
  const {amount} = route.params;         // e.g. 1000 for £10.00
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const [loading, setLoading] = useState(true);

  // 1) fetch client secret & init sheet
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          'http://10.0.2.2:3000/api/payments/create-payment-intent',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(await getAuthHeaders()),
            },
            body: JSON.stringify({amount}),
          }
        );
        const {clientSecret} = await resp.json();
        await initPaymentSheet({paymentIntentClientSecret: clientSecret});
      } catch (e) {
        Alert.alert('Error', e.message);
      }
      setLoading(false);
    })();
  }, []);

  // 2) present the sheet
  const openPayment = async () => {
    const {error} = await presentPaymentSheet();
    if (error) Alert.alert('Payment failed', error.message);
    else Alert.alert('Success', 'Payment confirmed!');
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <CardField
            postalCodeEnabled={false}
            placeholders={{number: '4242 4242 4242 4242'}}
            style={styles.card}
          />
          <Button
            title={`Pay £${(amount/100).toFixed(2)}`}
            onPress={openPayment}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, justifyContent:'center', padding:16},
  card: {height:50, marginVertical:20},
});
