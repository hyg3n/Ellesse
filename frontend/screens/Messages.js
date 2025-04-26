// screens/Messages.js
//
// Shows the list of chat threads for both client-side and provider-side users.
// Uses the /api/chats endpoint (filter query) and refreshes automatically
// when the screen regains focus.  Also adds pull-to-refresh support.
//

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme, Typography, Spacing} from '../styles/theme';

// Local constants
const FILTERS = ['All', 'Client', 'Provider', 'Support'];

const Messages = ({navigation}) => {
  const {palette, styles: globalStyles} = useTheme();

  // component state
  const [chats, setChats]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Fetch conversations / threads for the selected filter
  const fetchChats = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      const {data} = await axios.get(
        `http://10.0.2.2:3000/api/chats?filter=${selectedFilter.toLowerCase()}`,
        {headers: {Authorization: `Bearer ${token}`}},
      );
      setChats(data);
    } catch (e) {
      console.error('Error fetching chats:', e);
      setError('Could not load chats.');
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  // load when the selected filter changes
  useEffect(() => {
    fetchChats();
  }, [selectedFilter]);

  // auto-refresh every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchChats(true);   // silent refresh
    }, [selectedFilter]),
  );

  // pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchChats(true);
  };

  // Render helpers
  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.card,
        {backgroundColor: palette.card, shadowColor: palette.shadow},
      ]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ChatScreen', {chatId: item.id})}>
      <View style={styles.cardContent}>
        <Text style={[Typography.subtitle, {color: palette.text}]}>
          {item.otherUserName}
        </Text>
        <Text
          style={[
            Typography.caption,
            {color: palette.placeholder, marginTop: Spacing.xs},
          ]}
          numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <Text
        style={[Typography.h2, {color: palette.primary, fontWeight: '600'}]}>
        ›
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <Text
        style={[Typography.h2, {color: palette.text, marginBottom: Spacing.m}]}>
        Messages
      </Text>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              selectedFilter === f && {backgroundColor: palette.primary},
            ]}
            onPress={() => setSelectedFilter(f)}
            activeOpacity={0.7}>
            <Text
              style={[
                Typography.body,
                {
                  color:
                    selectedFilter === f ? palette.background : palette.text,
                },
              ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Thread list / loading / error */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={palette.primary}
          style={{marginTop: Spacing.l}}
        />
      ) : error ? (
        <Text
          style={[
            Typography.body,
            {color: palette.error, textAlign: 'center', marginTop: Spacing.l},
          ]}>
          {error}
        </Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: Spacing.l}}
          refreshControl={
            <RefreshControl
              tintColor={palette.primary}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <Text
              style={[
                Typography.body,
                {
                  color: palette.text,
                  textAlign: 'center',
                  marginTop: Spacing.l,
                },
              ]}>
              No conversations yet.
            </Text>
          }
        />
      )}
    </View>
  );
};


// Local styles
const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    marginBottom: Spacing.m,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: Spacing.s,
    overflow: 'hidden',
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.s,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
    marginBottom: Spacing.m,
    borderRadius: Spacing.l,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {flex: 1},
});

export default Messages;
