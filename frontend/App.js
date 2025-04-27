// App.js
import React, {useContext} from 'react';
import {View, ActivityIndicator, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Icon} from 'react-native-elements';
import {StripeProvider} from '@stripe/stripe-react-native';

import {AuthProvider, AuthContext} from './context/AuthContext';
import {ThemeProvider} from './context/ThemeContext';
import {Typography, useTheme} from './styles/theme';
import {STRIPE_PUBLISHABLE_KEY} from '@env';

// client screens
import Home from './screens/Home';
import Bookings from './screens/Bookings';
import Messages from './screens/Messages';
import Account from './screens/Account';
import PersonalInfoScreen from './screens/PersonalInfo';
import ChatScreen from './screens/ChatScreen';
import NewBooking from './screens/NewBooking';
import BookingDetails from './screens/BookingDetails';
import CategoryDetails from './screens/CategoryDetails';
import BecomeProvider from './screens/BecomeProvider';
import Login from './screens/Login';
import Register from './screens/Register';

// provider screens
import ProviderDashboard from './screens/ProviderDashboard';
import ProviderServices from './screens/ProviderServices';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function tabScreenOptions(route, palette) {
  const icons = {
    Home: 'home',
    Bookings: 'event',
    Messages: 'chat',
    Account: 'person',
    Services: 'build',
  };
  const isServiceTab = route.name === 'Services';

  return {
    headerStyle: {backgroundColor: palette.backgroundLight},
    headerTintColor: palette.text,
    headerTitleStyle: {...Typography.h2, color: palette.text},
    headerShown: isServiceTab,
    tabBarIcon: ({color, size}) => (
      <Icon
        name={icons[route.name] || 'help-outline'}
        type="material"
        size={size}
        color={color}
      />
    ),
    tabBarActiveTintColor: palette.primary,
    tabBarInactiveTintColor: palette.placeholder,
    tabBarStyle: {
      backgroundColor: palette.card,
      borderTopColor: palette.border,
    },
  };
}

function ClientTabs() {
  const {palette} = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({route}) => tabScreenOptions(route, palette)}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Bookings" component={Bookings} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}

function ProviderTabs() {
  const {palette} = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({route}) => tabScreenOptions(route, palette)}>
      <Tab.Screen name="Home" component={ProviderDashboard} />
      <Tab.Screen name="Services" component={ProviderServices} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const {isAuthenticated, activeView, currentUser} = useContext(AuthContext);
  const {palette} = useTheme();

  // splash while restoring token
  if (isAuthenticated === null) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  // if not logged in, send to Login/Register
  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{gestureEnabled: false}}
        />
      </Stack.Navigator>
    );
  }

  const isProvider = currentUser.role?.includes('provider');
  const Tabs = !isProvider
    ? ClientTabs
    : activeView === 'provider'
    ? ProviderTabs
    : ClientTabs;

  return (
    <Stack.Navigator
      // all stack screens by default show a themed header + back arrow
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: palette.backgroundLight,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: palette.text,
        headerTitleStyle: {...Typography.h2, color: palette.text},
        headerBackTitleVisible: false,
      }}>
      {/* no header on the tab navigator itself */}
      <Stack.Screen
        name="MainTabs"
        component={Tabs}
        options={{headerShown: false}}
      />

      {/* secondary screens all get back arrow + custom title */}
      <Stack.Screen
        name="NewBooking"
        component={NewBooking}
        options={{headerTitle: 'New Booking'}}
      />
      <Stack.Screen
        name="BookingDetails"
        component={BookingDetails}
        options={{headerTitle: 'Booking Details'}}
      />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen
        name="CategoryDetails"
        component={CategoryDetails}
        options={{headerTitle: 'Category Details'}}
      />

      <Stack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={{headerTitle: 'Personal Information'}}
      />

      {/* onboarding stays full-screen */}
      <Stack.Screen
        name="BecomeProvider"
        component={BecomeProvider}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const {palette, scheme} = useTheme();
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
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <AppContent />
        </StripeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
