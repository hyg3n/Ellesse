// screens/ChatScreen.js
// - Loads chat meta to set the header title
// - Loads the most-recent 20 messages, then paginates older ones on scroll
// - Sends and receives messages via Socket.IO in realtime

import React, {useState, useEffect, useLayoutEffect, useCallback} from 'react';
import {View} from 'react-native';
import {GiftedChat, SystemMessage} from 'react-native-gifted-chat';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {useTheme, Spacing} from '../styles/theme';
import {Icon} from 'react-native-elements';

const ChatScreen = ({route, navigation}) => {
  const {chatId} = route.params;
  const {palette, scheme} = useTheme();

  // local state
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUserName, setOtherUserName] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // helper: convert backend message → GiftedChat message
  const toGifted = m =>
    m.type === 'system'
      ? {
          _id: m.id,
          text: m.message,
          createdAt: new Date(m.created_at),
          system: true,
        }
      : {
          _id: m.id,
          clientId: m.client_id || null,
          text: m.message,
          createdAt: new Date(m.created_at),
          user: {_id: m.sender_id, name: m.sender_name},
        };

  // initial load (meta + newest 20 msgs)
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(decoded.id);

        // get chat meta (other participant’s name)
        const meta = await axios.get(
          `http://10.0.2.2:3000/api/chats/${chatId}/meta`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        setOtherUserName(meta.data.otherUserName);

        // get newest 20 messages
        const res = await axios.get(
          `http://10.0.2.2:3000/api/messages/${chatId}?limit=20`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        setMessages(res.data.map(toGifted));
        if (res.data.length < 20) setHasMore(false);
      } catch (err) {
        console.error('Initial chat fetch failed:', err);
      }
    })();
  }, [chatId]);

  // set header
  useLayoutEffect(() => {
    if (!otherUserName) return;

    navigation.setOptions({
      headerShown: true,
      title: otherUserName,
      // Very dark blue in dark mode; bright blue in light mode
      headerStyle: {
        backgroundColor: scheme === 'dark' ? '#0D1B2A' : '#74B9FF',
      },
      headerTintColor: scheme === 'dark' ? '#FFFFFF' : '#000000',
      headerTitleStyle: {
        fontWeight: '600',
      },
      // Avatar icon to the left of the title
      headerLeft: () => (
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginLeft: 16}}>
          {/* default back arrow */}
          <Icon
            name="arrow-back"
            type="material"
            size={24}
            color={scheme === 'dark' ? '#fff' : '#000'}
            onPress={() => navigation.goBack()}
          />
          <Icon
            name="user"
            type="font-awesome"
            size={24}
            color={scheme === 'dark' ? '#fff' : '#000'}
            style={{marginLeft: 22, marginRight: 8}}
          />
        </View>
      ),
    });
  }, [navigation, otherUserName, scheme]);

  // load older messages when user scrolls up
  const onLoadEarlier = async () => {
    if (loadingEarlier || !hasMore || messages.length === 0) return;
    setLoadingEarlier(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const before = messages[messages.length - 1].createdAt.toISOString();
      const res = await axios.get(
        `http://10.0.2.2:3000/api/messages/${chatId}?limit=20&before=${before}`,
        {headers: {Authorization: `Bearer ${token}`}},
      );
      setMessages(prev => GiftedChat.prepend(prev, res.data.map(toGifted)));
      if (res.data.length < 20) setHasMore(false);
    } catch (err) {
      console.error('Load earlier failed:', err);
    } finally {
      setLoadingEarlier(false);
    }
  };

  // establish Socket.IO connection
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const sock = io('http://10.0.2.2:3000', {auth: {token}});
      setSocket(sock);

      sock.on('connect', () => chatId && sock.emit('joinRoom', chatId));

      sock.on('receiveMessage', m =>
        setMessages(prev =>
          prev.some(x => x._id === m.id || x.clientId === m.client_id)
            ? prev
            : GiftedChat.append(prev, toGifted(m)),
        ),
      );
    })();
    return () => socket?.disconnect();
  }, [chatId]);

  // send message (optimistic)
  const onSend = useCallback(
    newMsgs => {
      const clientId = uuidv4();
      const [m] = newMsgs;

      // optimistic bubble
      setMessages(prev =>
        GiftedChat.append(prev, [
          {...m, _id: clientId, clientId, createdAt: new Date()},
        ]),
      );

      // emit to backend
      socket?.emit('sendMessage', {
        chat_id: chatId,
        message: m.text,
        receiver_id: null,
        clientId,
      });
    },
    [socket, chatId],
  );

  return (
    <GiftedChat
      // theme-aware container
      containerStyle={{backgroundColor: palette.backgroundLight}}
      messagesContainerStyle={{backgroundColor: palette.backgroundLight}}
      textInputStyle={{
        backgroundColor: palette.background,
        color: palette.text,
      }}
      messages={messages}
      onSend={onSend}
      user={{_id: currentUserId}}
      loadEarlier={hasMore}
      onLoadEarlier={onLoadEarlier}
      isLoadingEarlier={loadingEarlier}
      renderSystemMessage={props => {
        const bg = palette.sectionBackground;
        const txt = palette.text;
        return (
          <SystemMessage
            {...props}
            containerStyle={{
              alignItems: 'center',
              paddingVertical: Spacing.s,
              marginVertical: Spacing.s,
              backgroundColor: bg,
              borderRadius: Spacing.s,
            }}
            textStyle={{
              color: txt,
              fontStyle: 'italic',
              fontSize: 13,
              textAlign: 'center',
              maxWidth: '90%',
            }}
          />
        );
      }}
      showUserAvatar
      renderUsernameOnMessage
    />
  );
};

export default ChatScreen;
