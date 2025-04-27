// screens/ProviderServices.js
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from 'react-native';
import {Icon} from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme, Typography, Spacing} from '../styles/theme';

export default function ProviderServices({navigation}) {
  const {palette} = useTheme();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch services on mount
  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const {data} = await axios.get(
          'http://10.0.2.2:3000/api/provider/services',
          {headers: {Authorization: `Bearer ${token}`}},
        );
        setServices(data.services);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not load your services.');
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  // Add 'Add Services' button to header
  useLayoutEffect(() => {
    navigation.setOptions({
        headerTitle: 'My Services',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('BecomeProvider')}
          style={{marginRight: Spacing.m}}>
          <Text style={[Typography.body, {color: palette.primary}]}>
            + Add Services
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, services, palette.primary]);

  // Open edit modal, pre-loading availability
  const openEditor = svc => {
    setEditing({
      id: svc.id,
      price: String(svc.price),
      experience: String(svc.experience),
      availability: svc.availability.map(av => ({
        day: av.day,
        ranges: av.ranges.map(r => ({start: r.start, end: r.end})),
      })),
    });
  };

  // Helpers to edit availability in state
  const handleRangeChange = (dayIdx, rangeIdx, field, value) => {
    setEditing(e => {
      const avail = [...e.availability];
      avail[dayIdx].ranges[rangeIdx][field] = value;
      return {...e, availability: avail};
    });
  };
  const addRange = dayIdx => {
    setEditing(e => {
      const avail = [...e.availability];
      avail[dayIdx].ranges.push({start: '', end: ''});
      return {...e, availability: avail};
    });
  };
  const removeRange = (dayIdx, rangeIdx) => {
    setEditing(e => {
      const avail = [...e.availability];
      avail[dayIdx].ranges.splice(rangeIdx, 1);
      return {...e, availability: avail};
    });
  };

  // Save edits including availability
  const saveEdit = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `http://10.0.2.2:3000/api/provider/services/${editing.id}`,
        {
          price: Number(editing.price),
          experience: Number(editing.experience),
          availability: editing.availability,
        },
        {headers: {Authorization: `Bearer ${token}`}},
      );
      // Update local list
      setServices(prev =>
        prev.map(s =>
          s.id === editing.id
            ? {
                ...s,
                price: Number(editing.price),
                experience: Number(editing.experience),
                availability: editing.availability,
              }
            : s,
        ),
      );
      setEditing(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  // Render each service
  const renderService = ({item}) => (
    <View
      style={[
        styles.card,
        {backgroundColor: palette.card, borderColor: palette.border},
      ]}>
      <View style={styles.headerRow}>
        <Text style={[Typography.body, styles.title, {color: palette.text}]}>
          {item.service_name}
        </Text>
        <TouchableOpacity onPress={() => openEditor(item)}>
          <Icon name="edit" type="material" color={palette.primary} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailCol}>
          <Text
            style={[Typography.caption, styles.label, {color: palette.text}]}>
            Price
          </Text>
          <Text style={[Typography.body, {color: palette.text}]}>
            £{item.price}
          </Text>
        </View>
        <View style={styles.detailCol}>
          <Text
            style={[Typography.caption, styles.label, {color: palette.text}]}>
            Experience
          </Text>
          <Text style={[Typography.body, {color: palette.text}]}>
            {item.experience} yrs
          </Text>
        </View>
      </View>

      {item.availability?.length > 0 && (
        <>
          <Text
            style={[
              Typography.caption,
              styles.availLabel,
              {color: palette.text},
            ]}>
            Availability
          </Text>
          <View style={styles.availContainer}>
            {item.availability.map(av => (
              <View key={av.day} style={styles.dayBlock}>
                <Text
                  style={[
                    Typography.body,
                    {color: palette.text, fontWeight: '500'},
                  ]}>
                  {av.day}
                </Text>
                <View style={styles.pillsRow}>
                  {av.ranges.map((r, i) => (
                    <View
                      key={i}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: palette.sectionBackground,
                          borderColor: palette.border,
                        },
                      ]}>
                      <Text
                        style={[
                          Typography.caption,
                          {color: palette.text, fontSize: 12},
                        ]}>
                        {r.start}–{r.end}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  return (
    <View
      style={[styles.container, {backgroundColor: palette.backgroundLight}]}>
      <FlatList
        data={services}
        keyExtractor={s => s.id.toString()}
        renderItem={renderService}
        contentContainerStyle={
          services.length === 0 && {flex: 1, justifyContent: 'center'}
        }
        ListEmptyComponent={
          <Text
            style={[
              Typography.body,
              {color: palette.placeholder, textAlign: 'center'},
            ]}>
            You have no services yet.
          </Text>
        }
      />

      {/* Edit Modal */}
      <Modal visible={!!editing} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          {editing && (
            <View
              style={[
                styles.modalCard,
                {backgroundColor: palette.card, borderColor: palette.border},
              ]}>
              <ScrollView>
                <Text
                  style={[
                    Typography.subtitle,
                    {color: palette.text, marginBottom: Spacing.m},
                  ]}>
                  Edit Service
                </Text>

                {/* Price */}
                <Text
                  style={[
                    Typography.caption,
                    styles.label,
                    {color: palette.text},
                  ]}>
                  Price
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {borderColor: palette.border, color: palette.text},
                  ]}
                  keyboardType="numeric"
                  placeholder="Hourly rate"
                  placeholderTextColor={palette.placeholder}
                  value={editing?.price}
                  onChangeText={v => setEditing(e => ({...e, price: v}))}
                />

                {/* Experience */}
                <Text
                  style={[
                    Typography.caption,
                    styles.label,
                    {color: palette.text},
                  ]}>
                  Experience
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {borderColor: palette.border, color: palette.text},
                  ]}
                  keyboardType="numeric"
                  placeholder="Years of experience"
                  placeholderTextColor={palette.placeholder}
                  value={editing?.experience}
                  onChangeText={v => setEditing(e => ({...e, experience: v}))}
                />

                {/* Availability */}
                <Text
                  style={[
                    Typography.caption,
                    styles.availLabel,
                    {color: palette.text},
                  ]}>
                  Availability
                </Text>
                {editing.availability.map((av, dayIdx) => (
                  <View key={av.day} style={styles.editDayBlock}>
                    <Text
                      style={[
                        Typography.body,
                        {fontWeight: '500', color: palette.text},
                      ]}>
                      {av.day}
                    </Text>
                    {av.ranges.map((r, rangeIdx) => (
                      <View key={rangeIdx} style={styles.editRangeRow}>
                        <TextInput
                          style={[
                            styles.inputSmall,
                            {
                              borderColor: palette.border,
                              color: palette.text,
                            },
                          ]}
                          placeholder="HH:MM"
                          placeholderTextColor={palette.placeholder}
                          value={r.start}
                          onChangeText={v =>
                            handleRangeChange(dayIdx, rangeIdx, 'start', v)
                          }
                        />
                        <Text
                          style={{marginHorizontal: 4, color: palette.text}}>
                          –
                        </Text>
                        <TextInput
                          style={[
                            styles.inputSmall,
                            {
                              borderColor: palette.border,
                              color: palette.text,
                            },
                          ]}
                          placeholder="HH:MM"
                          placeholderTextColor={palette.placeholder}
                          value={r.end}
                          onChangeText={v =>
                            handleRangeChange(dayIdx, rangeIdx, 'end', v)
                          }
                        />
                        <TouchableOpacity
                          onPress={() => removeRange(dayIdx, rangeIdx)}>
                          <Text
                            style={{
                              color: palette.error,
                              marginLeft: Spacing.s,
                            }}>
                            ✕
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => addRange(dayIdx)}>
                      <Text
                        style={{color: palette.primary, marginTop: Spacing.xs}}>
                        ＋ Add range
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Actions */}
                <View style={styles.modalActions}>
                  <Button title="Cancel" onPress={() => setEditing(null)} />
                  <View style={{width: Spacing.s}} />
                  <Button
                    title={saving ? 'Saving…' : 'Save'}
                    onPress={saveEdit}
                    disabled={saving}
                    color={palette.primary}
                  />
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: Spacing.m},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  // Service card
  card: {
    borderWidth: 1,
    borderRadius: Spacing.s,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.m,
    marginLeft: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  title: {fontSize: 18, fontWeight: '600'},

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.l,
  },
  detailCol: {flex: 1},
  label: {fontWeight: '500'},

  availLabel: {marginBottom: Spacing.s, fontWeight: '500'},
  availContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.m,
  },
  dayBlock: {
    width: '48%',
    marginBottom: Spacing.s,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: Spacing.s,
    paddingVertical: 2,
    marginRight: Spacing.s,
    marginBottom: Spacing.xs,
  },

  // Edit modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.m,
  },
  modalCard: {
    maxHeight: '80%',
    borderWidth: 1,
    borderRadius: Spacing.s,
    padding: Spacing.m,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.xs,
    padding: Spacing.s,
    marginBottom: Spacing.m,
  },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.xs,
    padding: Spacing.s,
    marginBottom: 0,
  },
  editDayBlock: {
    marginBottom: Spacing.s,
  },
  editRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.m,
  },
});
