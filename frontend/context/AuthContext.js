import React, {createContext, useState, useEffect, useMemo} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Buffer} from 'buffer';

export const AuthContext = createContext();

function decodeUserFromToken(token) {
  if (!token) return {};
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('utf8'),
    );
    const {id, role, name, avatar, email} = payload;
    return {id, role, name, avatar, email};
  } catch (error) {
    console.error('Failed to decode token:', error);
    return {};
  }
}

export const AuthProvider = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [currentUser, setCurrentUser] = useState({});

  // On mount, load token & initialise auth + user
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
      if (token) {
        setCurrentUser(decodeUserFromToken(token));
      }
    })();
  }, []);

  const login = async token => {
    await AsyncStorage.setItem('token', token);
    setIsAuthenticated(true);
    setCurrentUser(decodeUserFromToken(token));
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser({});
  };

  // Only change reference when something actually changes
  const value = useMemo(
    () => ({isAuthenticated, currentUser, login, logout}),
    [isAuthenticated, currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
