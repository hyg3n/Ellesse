// App.js
import React, {useContext} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Icon} from 'react-native-elements';
import {AuthProvider, AuthContext} from './context/AuthContext'; 
import 'react-native-get-random-values';

import Home from './screens/Home';
import Bookings from './screens/Bookings';
import Chats from './screens/Chats';
import ChatScreen from './screens/ChatScreen';
import Account from './screens/Account';
import Login from './screens/Login';
import Register from './screens/Register';
import NewBooking from './screens/NewBooking';
import BookingDetails from './screens/BookingDetails';
import CategoryDetails from './screens/CategoryDetails';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Bottom Tabs (Main Screens After Login)
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      tabBarIcon: ({color, size}) => {
        let iconName;
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Bookings') iconName = 'event';
        else if (route.name === 'Chats') iconName = 'chat';
        else if (route.name === 'Account') iconName = 'person';
        return (
          <Icon name={iconName} type="material" size={size} color={color} />
        );
      },
      tabBarActiveTintColor: '#007BFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}>
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Bookings" component={Bookings} />
    <Tab.Screen name="Chats" component={Chats} />
    <Tab.Screen name="Account" component={Account} />
  </Tab.Navigator>
);

// Main App Navigation (Handles Authentication & Main App)
const AppNavigator = () => {
  const {isAuthenticated} = useContext(AuthContext); // Access auth state

  if (isAuthenticated === null) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="NewBooking" component={NewBooking} />
          <Stack.Screen name="BookingDetails" component={BookingDetails} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="CategoryDetails" component={CategoryDetails} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
