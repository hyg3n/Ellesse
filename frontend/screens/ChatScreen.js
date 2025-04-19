// screens/ChatScreen.js
import React, {useState, useEffect, useCallback, useLayoutEffect} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ChatScreen = ({route, navigation}) => {
  const {booking} = route.params; // Booking object from previous screen
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  // Set up navigation header to show provider's name and a back button.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: booking.provider_name,
    });
  }, [navigation, booking.provider_name]);

  // Fetch previous messages from the backend (fetch latest messages at the bottom)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(
          `http://10.0.2.2:3000/api/messages?booking_id=${booking.id}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );

        if (response.data) {
          const fetchedMessages = response.data.map(msg =>
            convertToGifted(msg),
          );
          setMessages(fetchedMessages); // Reverse so latest messages appear at the bottom
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [booking.id]);

  // Set up Socket.IO connection for new messages
  useEffect(() => {
    const initializeSocket = async () => {
      const token = await AsyncStorage.getItem('token');
      const newSocket = io('http://10.0.2.2:3000', {
        auth: {token},
      });
      setSocket(newSocket);

      // Join the room associated with the booking ID
      newSocket.emit('joinRoom', booking.id);

      newSocket.on('receiveMessage', message => {
        setMessages(prevMessages => {
          // Ensure no duplicates exist by checking _id or clientId
          const existingMessage = prevMessages.find(
            m => m._id === message.id || m.clientId === message.clientId,
          );
          if (!existingMessage) {
            return GiftedChat.append(prevMessages, convertToGifted(message));
          }
          return prevMessages;
        });
      });
    };

    initializeSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [booking.id]);

  // Optimistic update with deduplication
  const onSend = useCallback(
    (newMessages = []) => {
      const tempId = 'temp-' + Date.now();
      const optimisticMessage = {
        ...newMessages[0],
        _id: tempId,
        clientId: tempId,
        createdAt: new Date(),
      };

      // Add optimistic message
      setMessages(prevMessages =>
        GiftedChat.append(prevMessages, [optimisticMessage]),
      );

      // Emit message via socket
      if (socket) {
        socket.emit('sendMessage', {
          booking_id: booking.id,
          receiver_id: booking.provider_id,
          message: optimisticMessage.text,
          clientId: tempId, // Send clientId to track duplicates
        });
      }
    },
    [socket],
  );

  // Convert database messages to GiftedChat format
  const convertToGifted = msg => ({
    _id: msg.id,
    clientId: msg.clientId || null,
    text: msg.message,
    createdAt: new Date(msg.created_at),
    user: {
      _id: msg.sender_id,
      name: msg.sender_id === booking.user_id ? 'You' : booking.provider_name,
    },
  });

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{_id: booking.user_id}}
    />
  );
};

export default ChatScreen;
