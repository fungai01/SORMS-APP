import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {format} from 'date-fns';
import {vi} from 'date-fns/locale';

import apiClient from '../../services/apiClient';
import {useAuth} from '../../context/AuthContext';

interface Room {
  id: number;
  name?: string;
  code?: string;
  type?: string;
  roomTypeName?: string;
  price?: number;
  capacity?: number;
  status?: string;
}

const UserCreateBookingScreen: React.FC = () => {
  const {user} = useAuth();

  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const [showPicker, setShowPicker] = useState<'checkin' | 'checkout' | null>(
    null,
  );
  const [checkinDate, setCheckinDate] = useState<Date>(new Date());
  const [checkoutDate, setCheckoutDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  const [numGuestsText, setNumGuestsText] = useState('1');
  const [note, setNote] = useState('');

  const loadRooms = useCallback(async () => {
    try {
      setRoomsLoading(true);
      // Backend rooms-by-status supports AVAILABLE
      const res = await apiClient.getRoomsByStatus('AVAILABLE');
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? (res.data as any[]) : [];
        setRooms(list);
        if (list.length > 0) {
          setSelectedRoomId(list[0].id);
        }
      } else {
        Alert.alert('Lỗi', res.error || 'Không tải được danh sách phòng');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Không tải được danh sách phòng');
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const selectedRoom = useMemo(() => {
    return rooms.find(r => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  const parsedGuests = useMemo(() => {
    const n = parseInt(numGuestsText, 10);
    return Number.isFinite(n) ? n : NaN;
  }, [numGuestsText]);

  const checkinLabel = useMemo(
    () => format(checkinDate, 'dd/MM/yyyy', {locale: vi}),
    [checkinDate],
  );
  const checkoutLabel = useMemo(
    () => format(checkoutDate, 'dd/MM/yyyy', {locale: vi}),
    [checkoutDate],
  );

  const submit = async () => {
    if (!user?.id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin user');
      return;
    }

    if (!selectedRoomId) {
      Alert.alert('Lỗi', 'Vui lòng chọn phòng');
      return;
    }

    if (!Number.isFinite(parsedGuests) || parsedGuests <= 0) {
      Alert.alert('Lỗi', 'Số khách không hợp lệ');
      return;
    }

    // Backend expects checkoutDate > checkinDate
    if (checkoutDate <= checkinDate) {
      Alert.alert('Lỗi', 'Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        userId: String(user.id),
        roomId: selectedRoomId,
        checkinDate: checkinDate.toISOString(),
        checkoutDate: checkoutDate.toISOString(),
        numGuests: parsedGuests,
        note: note.trim() ? note.trim() : undefined,
      };

      const res = await apiClient.createBooking(payload as any);
      if (res.success) {
        Alert.alert('Thành công', 'Đã tạo booking', [{text: 'OK'}]);
      } else {
        Alert.alert('Lỗi', res.error || 'Tạo booking thất bại');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Tạo booking thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tạo booking</Text>
        <Text style={styles.subtitle}>Chọn phòng và thời gian lưu trú</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Phòng (AVAILABLE)</Text>
          {roomsLoading ? (
            <ActivityIndicator color="#2196F3" />
          ) : rooms.length === 0 ? (
            <Text style={styles.emptyText}>Không có phòng AVAILABLE</Text>
          ) : (
            <View style={styles.roomList}>
              {rooms.map(room => {
                const isSelected = room.id === selectedRoomId;
                const label = room.name || room.code || `Room #${room.id}`;
                const typeLabel = room.roomTypeName || room.type;
                return (
                  <TouchableOpacity
                    key={room.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedRoomId(room.id)}
                    style={[
                      styles.roomItem,
                      isSelected && styles.roomItemSelected,
                    ]}>
                    <Text style={styles.roomName}>{label}</Text>
                    {typeLabel ? (
                      <Text style={styles.roomMeta}>Loại: {typeLabel}</Text>
                    ) : null}
                    {typeof room.capacity === 'number' ? (
                      <Text style={styles.roomMeta}>
                        Sức chứa: {room.capacity}
                      </Text>
                    ) : null}
                    {typeof room.price === 'number' ? (
                      <Text style={styles.roomPrice}>
                        Giá: {new Intl.NumberFormat('vi-VN').format(room.price)}{' '}
                        VND
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thời gian</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Check-in</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPicker('checkin')}
                activeOpacity={0.8}>
                <Text style={styles.dateText}>{checkinLabel}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Check-out</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPicker('checkout')}
                activeOpacity={0.8}>
                <Text style={styles.dateText}>{checkoutLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showPicker ? (
            <DateTimePicker
              value={showPicker === 'checkin' ? checkinDate : checkoutDate}
              mode="date"
              display="default"
              minimumDate={showPicker === 'checkout' ? checkinDate : new Date()}
              onChange={(event, selectedDate) => {
                setShowPicker(null);
                if (!selectedDate) {
                  return;
                }

                if (showPicker === 'checkin') {
                  setCheckinDate(selectedDate);
                  // Ensure checkout > checkin
                  if (checkoutDate <= selectedDate) {
                    const next = new Date(selectedDate);
                    next.setDate(next.getDate() + 1);
                    setCheckoutDate(next);
                  }
                } else {
                  setCheckoutDate(selectedDate);
                }
              }}
            />
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Số khách</Text>
          <TextInput
            value={numGuestsText}
            onChangeText={setNumGuestsText}
            keyboardType="number-pad"
            placeholder="Ví dụ: 2"
            style={styles.input}
          />
          {selectedRoom?.capacity != null &&
          Number.isFinite(parsedGuests) &&
          parsedGuests > selectedRoom.capacity ? (
            <Text style={styles.warnText}>
              Số khách vượt quá sức chứa phòng ({selectedRoom.capacity}).
            </Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ghi chú (tuỳ chọn)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Nhập ghi chú..."
            style={[styles.input, styles.textarea]}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          disabled={loading}
          onPress={submit}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Tạo booking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  content: {padding: 20, paddingBottom: 40},
  title: {fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 6},
  subtitle: {fontSize: 15, color: '#666', marginBottom: 16},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {color: '#999'},
  roomList: {gap: 10},
  roomItem: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    padding: 12,
  },
  roomItemSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  roomName: {fontSize: 15, fontWeight: '700', color: '#333'},
  roomMeta: {marginTop: 4, color: '#666'},
  roomPrice: {marginTop: 6, color: '#2196F3', fontWeight: '700'},
  row: {flexDirection: 'row', gap: 12},
  col: {flex: 1},
  label: {fontSize: 12, color: '#666', marginBottom: 6},
  dateButton: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dateText: {color: '#333', fontWeight: '600'},
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#333',
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  warnText: {marginTop: 8, color: '#d97706'},
  submitButton: {
    marginTop: 6,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {opacity: 0.7},
  submitText: {color: '#fff', fontSize: 16, fontWeight: '800'},
});

export default UserCreateBookingScreen;
