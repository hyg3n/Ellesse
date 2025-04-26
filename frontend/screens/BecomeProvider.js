// screens/BecomeProvider.js
import React, {useEffect, useState, useCallback, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../context/AuthContext';
import axios from 'axios';
import DropDownPicker from 'react-native-dropdown-picker';
import {useTheme, Typography, Spacing} from '../styles/theme';

const experienceOptions = [
  '< 1 year',
  '1 year',
  '2 years',
  '3 years',
  '5+ years',
];
const experienceMap = {
  '< 1 year': 0,
  '1 year': 1,
  '2 years': 2,
  '3 years': 3,
  '5+ years': 5,
};
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* helpers */
const emptyServiceState = {
  experience: '',
  rate: '',
  rateError: '',
  days: [],
  availability: {},
};
const isServiceComplete = s =>
  s &&
  s.experience &&
  s.rate &&
  !s.rateError &&
  s.days.length &&
  s.days.every(d => (s.availability[d] || []).length);
const Req = ({color}) => <Text style={{color, marginLeft: 4}}>• required</Text>;

/* ---------- ServiceCard ---------- */
const ServiceCard = ({
  svc,
  sel,
  toggleService,
  updateServiceField,
  toggleDay,
  addRange,
  rangeInputs,
  palette,
  themeStyles,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() => sel?.experience || '');
  const [items] = useState(experienceOptions.map(o => ({label: o, value: o})));

  useEffect(() => {
    if (sel) updateServiceField(svc.id, 'experience', value);
  }, [value]);

  return (
    <View
      style={[
        localStyles.card,
        {backgroundColor: palette.card, borderColor: palette.border},
      ]}>
      <TouchableOpacity onPress={() => toggleService(svc.id)}>
        <Text
          style={[Typography.body, {color: palette.text, fontWeight: 'bold'}]}>
          {svc.name}
        </Text>
      </TouchableOpacity>

      {sel && (
        <View style={{marginTop: Spacing.s}}>
          {/* experience */}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[Typography.caption, {color: palette.text}]}>
              Experience
            </Text>
            {!sel.experience && <Req color={palette.error} />}
          </View>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            placeholder="Select experience"
            containerStyle={{marginTop: Spacing.xs}}
            style={{backgroundColor: palette.card, borderColor: palette.border}}
            dropDownContainerStyle={{
              backgroundColor: palette.card,
              borderColor: palette.border,
            }}
            textStyle={{color: palette.text}}
            placeholderStyle={{color: palette.placeholder}}
            arrowIconStyle={{tintColor: palette.text}}
          />

          {/* rate */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: Spacing.s,
            }}>
            <Text style={[Typography.caption, {color: palette.text}]}>
              Hourly rate (£5–£100)
            </Text>
            {!sel.rate && <Req color={palette.error} />}
          </View>
          <TextInput
            style={[themeStyles.input, {color: palette.text}]}
            keyboardType="numeric"
            placeholder="e.g. 20"
            placeholderTextColor={palette.placeholder}
            value={sel.rate}
            onChangeText={v => {
              const n = parseInt(v, 10);
              if (Number.isNaN(n) || n < 5 || n > 100) {
                updateServiceField(svc.id, 'rateError', 'Enter £5–£100');
                updateServiceField(svc.id, 'rate', v);
              } else {
                updateServiceField(svc.id, 'rateError', '');
                updateServiceField(svc.id, 'rate', String(n));
              }
            }}
          />
          {sel.rateError ? (
            <Text style={{color: palette.error}}>{sel.rateError}</Text>
          ) : null}

          {/* days */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: Spacing.s,
            }}>
            <Text style={[Typography.caption, {color: palette.text}]}>
              Availability – days
            </Text>
            {!sel.days.length && <Req color={palette.error} />}
          </View>
          <View style={localStyles.dayRow}>
            {weekdays.map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => toggleDay(svc.id, d)}
                style={[
                  localStyles.dayBtn,
                  {
                    backgroundColor: (sel.days || []).includes(d)
                      ? palette.primary
                      : palette.backgroundLight,
                    borderColor: palette.border,
                  },
                ]}>
                <Text
                  style={{
                    color: (sel.days || []).includes(d)
                      ? palette.background
                      : palette.text,
                  }}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ranges */}
          {(sel.days || []).map(day => {
            const missing = !(sel.availability[day] || []).length;
            return (
              <View key={day} style={{marginTop: Spacing.s}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={[
                      Typography.caption,
                      {color: palette.text, marginBottom: Spacing.xs},
                    ]}>
                    {day}
                  </Text>
                  {missing && <Req color={palette.error} />}
                </View>
                {rangeInputs(svc.id, day, sel.availability[day] || [])}
                <TouchableOpacity onPress={() => addRange(svc.id, day)}>
                  <Text style={{color: palette.primary}}>＋ Add range</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

/* ---------- main screen ---------- */
const BecomeProvider = ({navigation}) => {
  const {palette, styles: themeStyles} = useTheme();
  const {login} = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [selectedServices, setSelected] = useState({});
  const [reviewVisible, setReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* fetch categories */
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const {data} = await axios.get(
          'http://10.0.2.2:3000/api/servicesByCategory',
          {headers: {Authorization: `Bearer ${token}`}},
        );
        setCategories(data);
      } catch {
        Alert.alert('Error', 'Could not load service list.');
      }
    })();
  }, []);

  /* helpers */
  const toggleService = useCallback(
    id =>
      setSelected(p => ({
        ...p,
        [id]: p[id] ? undefined : {...emptyServiceState},
      })),
    [],
  );
  const updateServiceField = useCallback(
    (id, f, v) =>
      setSelected(p => ({
        ...p,
        [id]: {...p[id], [f]: v},
      })),
    [],
  );
  const toggleDay = useCallback(
    (id, day) => {
      const cur = selectedServices[id]?.days || [];
      const next = cur.includes(day)
        ? cur.filter(d => d !== day)
        : [...cur, day];
      updateServiceField(id, 'days', next);
      if (!selectedServices[id]?.availability[day]) {
        updateServiceField(id, 'availability', {
          ...selectedServices[id].availability,
          [day]: [],
        });
      }
    },
    [selectedServices],
  );
  const addRange = useCallback(
    (id, day) => {
      const r = selectedServices[id]?.availability[day] || [];
      updateServiceField(id, 'availability', {
        ...selectedServices[id].availability,
        [day]: [...r, {start: '', end: ''}],
      });
    },
    [selectedServices],
  );
  const updateRange = useCallback(
    (id, day, idx, f, v) => {
      const r = [...(selectedServices[id]?.availability[day] || [])];
      r[idx] = {...r[idx], [f]: v};
      updateServiceField(id, 'availability', {
        ...selectedServices[id].availability,
        [day]: r,
      });
    },
    [selectedServices],
  );
  const removeRange = useCallback(
    (id, day, idx) => {
      const r = (selectedServices[id]?.availability[day] || []).filter(
        (_, i) => i !== idx,
      );
      updateServiceField(id, 'availability', {
        ...selectedServices[id].availability,
        [day]: r,
      });
    },
    [selectedServices],
  );
  const rangeInputs = useCallback(
    (sid, day, r) =>
      r.map((rng, i) => (
        <View key={`${day}-${i}`} style={localStyles.rangeRow}>
          <TextInput
            placeholder="HH:MM"
            placeholderTextColor={palette.placeholder}
            style={[themeStyles.input, localStyles.timeInput]}
            value={rng.start}
            onChangeText={v => updateRange(sid, day, i, 'start', v)}
          />
          <Text style={{color: palette.text, marginHorizontal: 4}}>–</Text>
          <TextInput
            placeholder="HH:MM"
            placeholderTextColor={palette.placeholder}
            style={[themeStyles.input, localStyles.timeInput]}
            value={rng.end}
            onChangeText={v => updateRange(sid, day, i, 'end', v)}
          />
          <TouchableOpacity onPress={() => removeRange(sid, day, i)}>
            <Text style={{color: palette.error, marginLeft: 8}}>✕</Text>
          </TouchableOpacity>
        </View>
      )),
    [selectedServices],
  );

  /* build selections */
  const rawSelected = Object.entries(selectedServices)
    .filter(([, v]) => v)
    .map(([service_id, data]) => ({service_id: Number(service_id), ...data}));

  /* ---- transform exactly as backend expects ---- */
  const transformed = rawSelected.map(s => ({
    service_id: s.service_id,
    experience: experienceMap[s.experience] ?? 0,
    price: Number(s.rate),
    availability: Object.entries(s.availability).map(([day, ranges]) => ({
      day,
      ranges,
    })),
  }));

  const allComplete =
    rawSelected.length && rawSelected.every(isServiceComplete);

  const handleReview = () => {
    if (!allComplete) {
      Alert.alert(
        'Incomplete information',
        'Please complete all required fields before reviewing.',
      );
      return;
    }
    setReview(true);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(
        'http://10.0.2.2:3000/api/becomeProvider',
        {services: transformed},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (res.data?.token) {
        await AsyncStorage.setItem('token', res.data.token);
        login(res.data.token); // will update AuthContext
      }

      Alert.alert('Success', 'You are now a provider!', [
        {
          text: 'OK',
          onPress: () => {
            setReview(false);
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  /* UI (unchanged) */
  return (
    <>
      {/* main list */}
      <FlatList
        style={themeStyles.screen}
        contentContainerStyle={{padding: Spacing.m}}
        data={categories}
        keyExtractor={c => c.id.toString()}
        ListHeaderComponent={() => (
          <Text
            style={[
              Typography.h2,
              {color: palette.text, marginBottom: Spacing.l},
            ]}>
            Become a Provider
          </Text>
        )}
        renderItem={({item: cat}) => (
          <View
            style={[
              localStyles.section,
              {backgroundColor: palette.sectionBackground},
            ]}>
            <Text style={[Typography.subtitle, {color: palette.text}]}>
              {cat.name}
            </Text>
            {cat.services?.map(svc => (
              <ServiceCard
                key={svc.id}
                svc={svc}
                sel={selectedServices[svc.id]}
                toggleService={toggleService}
                updateServiceField={updateServiceField}
                toggleDay={toggleDay}
                addRange={addRange}
                rangeInputs={rangeInputs}
                palette={palette}
                themeStyles={themeStyles}
              />
            ))}
          </View>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity
            onPress={handleReview}
            style={[
              localStyles.confirmBtn,
              {backgroundColor: palette.primary},
            ]}>
            <Text
              style={[Typography.body, {color: '#fff', textAlign: 'center'}]}>
              Review & Confirm
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* review modal – still displays rawSelected for clarity */}
      <Modal visible={reviewVisible} animationType="slide" transparent>
        <View style={localStyles.modalBackdrop}>
          <View
            style={[
              localStyles.modalCard,
              {backgroundColor: palette.card, borderColor: palette.border},
            ]}>
            <Text
              style={[
                Typography.subtitle,
                {color: palette.text, marginBottom: Spacing.m},
              ]}>
              Review your services
            </Text>

            <FlatList
              data={rawSelected}
              keyExtractor={i => i.service_id.toString()}
              renderItem={({item}) => {
                const svcName =
                  categories
                    .flatMap(c => c.services)
                    .find(s => s.id === item.service_id)?.name || '';
                return (
                  <View style={{marginBottom: Spacing.m}}>
                    <Text
                      style={[
                        Typography.body,
                        {color: palette.text, fontWeight: '600'},
                      ]}>
                      {svcName}
                    </Text>
                    <Text style={[Typography.caption, {color: palette.text}]}>
                      {item.experience} – £{item.rate}/h
                    </Text>
                    {item.days.map(day => {
                      const ranges = item.availability[day] || [];
                      return (
                        <View
                          key={day}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: Spacing.xs,
                            flexWrap: 'wrap',
                          }}>
                          <Text
                            style={[
                              Typography.caption,
                              {color: palette.text, width: 45},
                            ]}>
                            {day}
                          </Text>
                          {ranges.map((r, idx) => (
                            <View
                              key={idx}
                              style={[
                                localStyles.pill,
                                {
                                  backgroundColor: palette.backgroundLight,
                                  borderColor: palette.border,
                                },
                              ]}>
                              <Text
                                style={[
                                  Typography.caption,
                                  {color: palette.text, fontSize: 12},
                                ]}>
                                {r.start || '--:--'}-{r.end || '--:--'}
                              </Text>
                            </View>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                );
              }}
            />

            <View style={{flexDirection: 'row', marginTop: Spacing.l}}>
              <Pressable
                onPress={() => setReview(false)}
                style={[localStyles.modalBtn, {borderColor: palette.border}]}>
                <Text style={[Typography.body, {color: palette.text}]}>
                  Back
                </Text>
              </Pressable>
              <Pressable
                disabled={submitting}
                onPress={submit}
                style={[
                  localStyles.modalBtn,
                  {backgroundColor: palette.primary, marginLeft: Spacing.s},
                ]}>
                <Text style={[Typography.body, {color: '#fff'}]}>
                  {submitting ? 'Submitting…' : 'Confirm'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

/* styles */
const localStyles = StyleSheet.create({
  section: {padding: Spacing.m, borderRadius: 8, marginBottom: Spacing.l},
  card: {
    padding: Spacing.m,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: Spacing.m,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.xs,
  },
  dayBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  timeInput: {flex: 1},

  confirmBtn: {
    alignSelf: 'stretch',
    paddingVertical: Spacing.m,
    borderRadius: 8,
    marginTop: Spacing.l,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.m,
  },
  modalCard: {
    padding: Spacing.m,
    borderRadius: 10,
    borderWidth: 1,
    maxHeight: '80%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: Spacing.s,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },

  pill: {
    paddingHorizontal: Spacing.s,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
});

export default BecomeProvider;
