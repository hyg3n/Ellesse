// screens/PersonalInfo.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, Typography, Spacing } from '../styles/theme';

const PersonalInfo = () => {
  const { palette, styles: themeStyles } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // which field is currently being edited?
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [saving, setSaving] = useState(false);

  // load profile
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const { data } = await axios.get(
          'http://10.0.2.2:3000/api/account/profile',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fields = [
    { key: 'name',         label: 'Legal Name',          editable: true },
    { key: 'phone_number', label: 'Phone Number',        editable: true },
    { key: 'email',        label: 'Email',               editable: true },
    { key: 'address',      label: 'Address',             editable: true },
    { key: 'identity',     label: 'Identity Verification', editable: false, value: 'Verified' },
  ];

  const startEdit = key => {
    setEditingKey(key);
    setEditingValue(profile[key] || '');
  };
  const cancelEdit = () => {
    setEditingKey(null);
    setEditingValue('');
  };
  const saveEdit = async () => {
    if (!editingKey) return;
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const payload = { [editingKey]: editingValue };
      const { data } = await axios.put(
        'http://10.0.2.2:3000/api/account/profile',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(data);
      cancelEdit();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[themeStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <View style={themeStyles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.l }}>
        {fields.map(({ key, label, editable, value: fixedValue }) => {
          const currentValue =
            fixedValue != null ? fixedValue : profile[key];
          const isEditing = editingKey === key;

          return (
            <View key={key} style={[styles.section, { borderBottomColor: palette.border }]}>
              <Text style={[Typography.body, { color: palette.text }]}>
                {label}
              </Text>

              {isEditing ? (
                <>
                  <TextInput
                    style={[
                      themeStyles.input,
                      {
                        backgroundColor: palette.card,
                        color: palette.text,
                      },
                    ]}
                    value={editingValue}
                    onChangeText={setEditingValue}
                    autoFocus
                  />
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: palette.border }]}
                      onPress={cancelEdit}
                    >
                      <Text style={[Typography.body, { color: palette.text }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: palette.primary }]}
                      onPress={saveEdit}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator color={palette.backgroundLight} />
                      ) : (
                        <Text style={[Typography.body, { color: palette.backgroundLight }]}>
                          Save
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.row}>
                  <Text
                    style={[
                      Typography.body,
                      {
                        color: currentValue
                          ? palette.text
                          : palette.placeholder,
                        flex: 1,
                        marginTop: Spacing.xs,
                      },
                    ]}
                  >
                    {currentValue || 'Not provided'}
                  </Text>
                  {editable && (
                    <TouchableOpacity onPress={() => startEdit(key)}>
                      <Text
                        style={[
                          Typography.body,
                          {
                            color: palette.primary,
                            fontWeight: '600',
                            marginLeft: Spacing.s,
                          },
                        ]}
                      >
                        {currentValue ? 'Edit' : 'Add'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: {
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.s,
  },
  button: {
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: Spacing.s,
    marginLeft: Spacing.s,
  },
});

export default PersonalInfo;
