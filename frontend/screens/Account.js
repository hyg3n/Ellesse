// screens/Account.js

import React, {useContext, useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import {Avatar, Icon} from 'react-native-elements';
import {useIsFocused} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Buffer} from 'buffer';
import {AuthContext} from '../context/AuthContext';
import {useTheme, Typography, Spacing} from '../styles/theme';

/** helper – safe JWT decode */
const decodeRoleFromToken = token => {
  if (!token) return 'user';
  try {
    const base64Payload = token.split('.')[1];
    const json = Buffer.from(base64Payload, 'base64').toString('utf8');
    const {role = 'user'} = JSON.parse(json);
    return role;
  } catch {
    return 'user';
  }
};

const Account = ({navigation}) => {
  const {palette, styles: themeStyles, scheme, setOverride} = useTheme();
  const {logout, currentUser} = useContext(AuthContext);

  const [role, setRole] = useState('user');
  const [activeView, setActiveView] = useState('user');
  const isFocused = useIsFocused();

  const hasAvatar =
    !!currentUser.avatar &&
    currentUser.avatar !== 'null' &&
    currentUser.avatar.trim() !== '';

  /* Fetch role whenever screen focuses */
  const refreshRole = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    setRole(decodeRoleFromToken(token));
  }, []);

  useEffect(() => {
    refreshRole();
  }, [isFocused, refreshRole]);

  /* toggle between client / provider view */
  const isProvider = role.includes('provider');
  const toggleView = () => {
    const next = activeView === 'user' ? 'provider' : 'user';
    setActiveView(next);
    AsyncStorage.setItem('activeView', next);
  };

  /* section helpers */
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

  const Row = ({label, onPress, labelStyle, right}) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, {borderBottomColor: palette.border}]}>
      <Text style={[Typography.body, {color: palette.text}, labelStyle]}>
        {label}
      </Text>
      {right ?? (
        <Text style={[Typography.body, {color: palette.placeholder}]}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={themeStyles.container}
      contentContainerStyle={{paddingBottom: Spacing.xl}}>
      {/* Profile header */}
      <View style={styles.profileHeaderContainer}>
        <Text style={[Typography.h2, {color: palette.text}]}>Account</Text>
      </View>
      <View style={styles.profileRow}>
        <Avatar
          rounded
          size="medium"
          source={hasAvatar ? {uri: currentUser.avatar} : undefined}
          icon={
            hasAvatar
              ? undefined
              : {name: 'user', type: 'font-awesome', color: '#fff'}
          }
          containerStyle={[
            styles.avatarFallback,
            {backgroundColor: palette.primary},
          ]}
        />

        <View>
          <Text
            style={[
              Typography.subtitle,
              {color: palette.text, fontWeight: '600'},
            ]}>
            {currentUser.name ?? 'Your Name'}
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
      {/* Provider toggle or CTA */}
      <View style={styles.section}>
        {isProvider ? (
          <View
            style={[styles.toggleContainer, {backgroundColor: palette.card}]}>
            <Text style={[Typography.body, {color: palette.text}]}>
              Browsing as <Text style={{fontWeight: '600'}}>{activeView}</Text>
            </Text>
            <View style={styles.switchRow}>
              <Text style={[Typography.caption, {color: palette.text}]}>
                Client
              </Text>
              <Switch
                value={activeView === 'provider'}
                onValueChange={toggleView}
              />
              <Text style={[Typography.caption, {color: palette.text}]}>
                Provider
              </Text>
            </View>
          </View>
        ) : (
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
      </View>
      {/* Settings */}
      <Section title="Settings">
        {[
          'Personal Information',
          'Payments and Payouts',
          'Taxes',
          'Login and Security',
          'Notifications',
          'Privacy and Sharing',
        ].map(label => (
          <Row key={label} label={label} />
        ))}

        <Row
          label="Dark Mode"
          labelStyle={{flex: 1}}
          right={
            <Switch
              value={scheme === 'dark'}
              onValueChange={async val => {
                const next = val ? 'dark' : 'light';
                await AsyncStorage.setItem('themeOverride', next);
                setOverride(next);
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
        <TouchableOpacity onPress={logout} style={[styles.row]}>
          <Text style={[Typography.body, {color: palette.error}]}>Log out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    borderColor: '#CCE0FF',
  },
  toggleContainer: {
    padding: Spacing.m,
    borderRadius: Spacing.s,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  profileHeaderContainer: {
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.l,
    paddingBottom: Spacing.s,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.m,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: Spacing.m,
  },
  avatarFallback: {
    marginRight: Spacing.m,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.m,
  },
});

export default Account;
