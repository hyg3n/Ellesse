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
  const [activeView, setActiveView] = useState('user');

  // On mount, load token & initialise auth + user
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const storedView = await AsyncStorage.getItem('activeView');
      setIsAuthenticated(!!token);
      if (token) {
        setCurrentUser(decodeUserFromToken(token));
        setActiveView(storedView || 'user');
      }
    })();
  }, []);

  const login = async token => {
    await AsyncStorage.multiSet([
      ['token', token],
      ['activeView', 'user'],
    ]);
    setIsAuthenticated(true);
    setCurrentUser(decodeUserFromToken(token));
    setActiveView('user');
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'activeView']);
    setIsAuthenticated(false);
    setCurrentUser({});
    setActiveView('user');
  };

  // Only change reference when something actually changes
  const value = useMemo(
    () => ({isAuthenticated, currentUser, activeView, setActiveView, login, logout}),
    [isAuthenticated, currentUser, activeView],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
