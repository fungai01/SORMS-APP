import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import apiClient from '../../services/apiClient';
import type {RoleStackParamList} from '../../navigation/types';
import {Button, Card, Header, LoadingBlock, Screen} from '../../components/ui/UiKit';

type Nav = NativeStackNavigationProp<RoleStackParamList>;

type Route = {
  key: string;
  name: string;
  params: {bookingId: number};
};

interface Booking {
  id: number;
  code: string;
  roomId: number;
  checkinDate: string;
  checkoutDate: string;
  numGuests: number;
  status: string;
  note?: string;
  createdDate?: string;
  updatedDate?: string;
}

const UserBookingDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute() as unknown as Route;

  const bookingId = route.params?.bookingId;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getBooking(bookingId);
      if (res.success && res.data) {
        setBooking(res.data as any);
      } else {
        Alert.alert('Lỗi', res.error || 'Không tải được booking');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Không tải được booking');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FF9800';
      case 'APPROVED':
        return '#4CAF50';
      case 'REJECTED':
        return '#F44336';
      case 'CHECKED_IN':
        return '#2196F3';
      case 'CHECKED_OUT':
        return '#9E9E9E';
      case 'CANCELLED':
        return '#757575';
      default:
        return '#666';
    }
  };

  return (
    <Screen>
      <Header
        title="Chi tiết đặt phòng"
        subtitle={booking ? booking.code : `Booking #${bookingId}`}
        right={
          <Button
            title="Quay lại"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={{height: 40, paddingHorizontal: 12}}
          />
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <LoadingBlock />
        ) : !booking ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Không tìm thấy booking</Text>
            <View style={{height: 10}} />
            <Button title="Tải lại" onPress={load} />
          </Card>
        ) : (
          <Card>
            <View style={styles.headerRow}>
              <Text style={styles.codeText}>{booking.code}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: getStatusColor(booking.status)},
                ]}>
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Phòng</Text>
              <Text style={styles.value}>Room ID: {booking.roomId}</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Check-in</Text>
                <Text style={styles.value}>{formatDate(booking.checkinDate)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Check-out</Text>
                <Text style={styles.value}>{formatDate(booking.checkoutDate)}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Số khách</Text>
              <Text style={styles.value}>{booking.numGuests}</Text>
            </View>

            {booking.note ? (
              <View style={styles.section}>
                <Text style={styles.label}>Ghi chú</Text>
                <Text style={styles.value}>{booking.note}</Text>
              </View>
            ) : null}
          </Card>
        )}

        <View style={{height: 10}} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  codeText: {fontSize: 16, fontWeight: '800', color: '#111827'},
  statusBadge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999},
  statusText: {color: '#fff', fontSize: 12, fontWeight: '800'},
  row: {flexDirection: 'row', gap: 12, marginTop: 12},
  col: {flex: 1},
  section: {marginTop: 12},
  label: {fontSize: 12, color: '#6B7280', fontWeight: '700', marginBottom: 4},
  value: {fontSize: 13, color: '#111827', fontWeight: '700'},
});

export default UserBookingDetailScreen;
