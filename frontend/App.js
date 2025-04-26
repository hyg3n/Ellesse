// App.js
import React, { useContext } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from 'react-native-elements';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './styles/theme';

import Home from './screens/Home';
import Bookings from './screens/Bookings';
import Messages from './screens/Messages';
import ChatScreen from './screens/ChatScreen';
import Account from './screens/Account';
import Login from './screens/Login';
import Register from './screens/Register';
import NewBooking from './screens/NewBooking';
import BookingDetails from './screens/BookingDetails';
import CategoryDetails from './screens/CategoryDetails';
import BecomeProvider from './screens/BecomeProvider';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabNavigator() {
  const { palette } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'help-outline';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Bookings') iconName = 'event';
          else if (route.name === 'Messages') iconName = 'chat';
          else if (route.name === 'Account') iconName = 'person';

          return <Icon name={iconName} type="material" size={size} color={color} />;
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.placeholder,
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: palette.border,
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Bookings" component={Bookings} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="NewBooking" component={NewBooking} />
          <Stack.Screen name="BookingDetails" component={BookingDetails} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="CategoryDetails" component={CategoryDetails} />
          <Stack.Screen name="BecomeProvider" component={BecomeProvider} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
}

function AppContent() {
  const { palette, scheme } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={palette.backgroundLight}
      />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
