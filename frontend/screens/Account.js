// screens/Account.js

import React, {useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import {Icon} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../context/AuthContext';
import {useTheme, Typography, Spacing} from '../styles/theme';

const Account = ({navigation}) => {
  const {palette, styles: themeStyles, scheme, setOverride} = useTheme();
  const {logout, currentUser, activeView, setActiveView} =
    useContext(AuthContext);

  const isProvider = (currentUser.role || '').includes('provider');

  const toggleView = async () => {
    const next = activeView === 'user' ? 'provider' : 'user';
    setActiveView(next);
    await AsyncStorage.setItem('activeView', next);
  };

  const toggleTheme = async val => {
    const next = val ? 'dark' : 'light';
    setOverride(next);
    await AsyncStorage.setItem('themeOverride', next);
  };

  const Section = ({title, children}) => (
    <View style={styles.section}>
      <Text
        style={[
          Typography.subtitle,
          {color: palette.text, marginBottom: Spacing.s},
        ]}>
        {title}
      </Text>
      <View style={{backgroundColor: palette.card, borderRadius: Spacing.s}}>
        {children}
      </View>
    </View>
  );

  const Row = ({label, onPress, right}) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, {borderBottomColor: palette.border}]}>
      <Text style={[Typography.body, {color: palette.text}]}>{label}</Text>
      {right ?? (
        <Text style={[Typography.body, {color: palette.placeholder}]}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={themeStyles.container}>
      <Text
        style={[Typography.h2, {color: palette.text, marginBottom: Spacing.m}]}>
        Account
      </Text>

      {/* CONTENT AREA */}
      <View style={{flex: 1}}>
        <ScrollView
        style={{flex: 1}}
          contentContainerStyle={{paddingBottom: Spacing.xl, flexGrow: 1}}>
          {/* Profile Info */}
          <View style={styles.profileRow}>
            <View style={[styles.avatar, {backgroundColor: palette.primary}]}>
              <Icon name="user" type="font-awesome" color="#fff" size={24} />
            </View>
            <View>
              <Text
                style={[
                  Typography.subtitle,
                  {color: palette.text, fontWeight: '600'},
                ]}>
                {currentUser.name || 'Your Name'}
              </Text>
              {currentUser.email && (
                <Text
                  style={[
                    Typography.caption,
                    {color: palette.placeholder, marginTop: Spacing.xs},
                  ]}>
                  {currentUser.email}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.divider, {backgroundColor: palette.border}]} />

          {/* Browsing As */}
          {isProvider && (
            <View style={styles.browsingContainer}>
              <Text style={[Typography.body, {color: palette.text}]}>
                Browsing as{' '}
                <Text style={{fontWeight: '600'}}>{activeView}</Text>
              </Text>
            </View>
          )}

          {/* Become Provider CTA */}
          {!isProvider && (
            <TouchableOpacity
              style={[
                styles.ctaCard,
                {
                  backgroundColor: palette.primary + '10',
                  borderColor: palette.primary + '30',
                },
              ]}
              onPress={() => navigation.navigate('BecomeProvider')}>
              <Text
                style={[
                  Typography.body,
                  {color: palette.primary, fontWeight: '600'},
                ]}>
                Offer Your Services
              </Text>
              <Text
                style={[
                  Typography.caption,
                  {color: palette.primary, marginTop: Spacing.xs},
                ]}>
                Become a provider and get booked by clients
              </Text>
            </TouchableOpacity>
          )}

          {/* Settings */}
          <Section title="Settings">
            {[
              {label: 'Personal Information', screen: 'PersonalInfo'},
              {label: 'Payments and Payouts'},
              {label: 'Taxes'},
              {label: 'Login and Security'},
              {label: 'Notifications'},
              {label: 'Privacy and Sharing'},
            ].map(({label, screen}) => (
              <Row
                key={label}
                label={label}
                onPress={screen ? () => navigation.navigate(screen) : undefined}
              />
            ))}

            <Row
              label="Dark Mode"
              right={
                <Switch
                  value={scheme === 'dark'}
                  onValueChange={toggleTheme}
                  thumbColor={palette.primary}
                  trackColor={{
                    false: palette.border,
                    true: palette.primary + '60',
                  }}
                />
              }
            />
          </Section>

          {/* Support */}
          <Section title="Support">
            {['Help Centre', 'Feedback'].map(label => (
              <Row key={label} label={label} />
            ))}
          </Section>

          {/* Legal */}
          <Section title="Legal">
            {['Terms of Service', 'Privacy Policy'].map(label => (
              <Row key={label} label={label} />
            ))}
          </Section>

          {/* Logout */}
          <View style={[styles.section, {marginTop: Spacing.l}]}>
            <TouchableOpacity onPress={logout} style={styles.row}>
              <Text style={[Typography.body, {color: palette.error}]}>
                Log out
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* STICKY FOOTER (only takes its own height, won’t cover entire screen) */}
      {isProvider && (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.footerButton, {backgroundColor: palette.primary}]}
            onPress={toggleView}>
            <Icon name="swap-horiz" type="material" color="#fff" size={24} />
            <Text
              style={[
                Typography.body,
                {color: '#fff', marginLeft: Spacing.s, fontWeight: '600'},
              ]}>
              Switch to {activeView === 'user' ? 'Provider' : 'Client'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {marginBottom: Spacing.l},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ctaCard: {
    padding: Spacing.m,
    borderRadius: Spacing.s,
    borderWidth: 1,
    marginHorizontal: Spacing.m,
    marginBottom: Spacing.l,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.m,
  },
  avatar: {
    marginRight: Spacing.m,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.m,
  },
  browsingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.l,
  },
  footerContainer: {
    position: 'absolute',
    bottom: Spacing.m,
    width: '100%',
    padding: Spacing.s,
    alignItems: 'center',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.xl,
    borderRadius: 40,
    minWidth: 140,
  },
});

export default Account;
