// screens/Register.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {useTheme, Typography, Spacing} from '../styles/theme';

const Register = ({navigation}) => {
  const {palette} = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState('user'); // default

  const handleRegister = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3000/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name,
          email,
          phone_number: phone,
          password,
          role,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Registration successful!');
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      } else {
        Alert.alert('Error', data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View
      style={[styles.container, {backgroundColor: palette.backgroundLight}]}>
      <Text style={[Typography.h2, styles.title, {color: palette.text}]}>
        Create Account
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            borderColor: palette.border,
            backgroundColor: palette.card,
            color: palette.text,
          },
        ]}
        placeholder="Full Name"
        placeholderTextColor={palette.placeholder}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: palette.border,
            backgroundColor: palette.card,
            color: palette.text,
          },
        ]}
        placeholder="Email"
        placeholderTextColor={palette.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: palette.border,
            backgroundColor: palette.card,
            color: palette.text,
          },
        ]}
        placeholder="Phone Number"
        placeholderTextColor={palette.placeholder}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: palette.border,
            backgroundColor: palette.card,
            color: palette.text,
          },
        ]}
        placeholder="Password"
        placeholderTextColor={palette.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, {backgroundColor: palette.primary}]}
        onPress={handleRegister}
        activeOpacity={0.8}>
        <Text
          style={[
            Typography.body,
            {color: palette.backgroundLight, fontWeight: '600'},
          ]}>
          Sign Up
        </Text>
      </TouchableOpacity>

      <Text
        style={[Typography.body, styles.link, {color: palette.primary}]}
        onPress={() => navigation.navigate('Login')}>
        Already have an account?{' '}
        <Text style={{fontWeight: '600', color: palette.primary}}>Log in</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.m,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.l,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: Spacing.s,
    marginBottom: Spacing.m,
  },
  button: {
    paddingVertical: Spacing.s,
    borderRadius: Spacing.s,
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  link: {
    textAlign: 'center',
    marginTop: Spacing.m,
  },
});

export default Register;
