// screens/Login.js
import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import {useTheme, Typography, Spacing} from '../styles/theme';

const Login = ({navigation}) => {
  const {palette} = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {login} = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3000/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.token);
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Error', data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View
      style={[styles.container, {backgroundColor: palette.backgroundLight}]}>
      <Text style={[Typography.h2, styles.title, {color: palette.text}]}>
        Welcome Back
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
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
            backgroundColor: palette.card,
            borderColor: palette.border,
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
        onPress={handleLogin}
        activeOpacity={0.8}>
        <Text
          style={[
            Typography.body,
            {color: palette.backgroundLight, fontWeight: '600'},
          ]}>
          Log In
        </Text>
      </TouchableOpacity>
      <Text
        style={[Typography.body, styles.link, {color: palette.primary}]}
        onPress={() => navigation.navigate('Register')}>
        Don’t have an account?{' '}
        <Text style={{fontWeight: '600', color: palette.primary}}>Sign up</Text>
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

export default Login;
