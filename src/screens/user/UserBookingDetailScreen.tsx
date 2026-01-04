import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import apiClient from '../../services/apiClient';
import type {RoleStackParamList} from '../../navigation/types';

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
    navigation.setOptions({headerShown: true, title: 'Chi tiết đặt phòng'});
  }, [navigation]);

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2196F3"
            style={styles.loader}
          />
        ) : !booking ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy booking</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={load}>
              <Text style={styles.primaryButtonText}>Tải lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.card}>
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
                  <Text style={styles.value}>
                    {formatDate(booking.checkinDate)}
                  </Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Check-out</Text>
                  <Text style={styles.value}>
                    {formatDate(booking.checkoutDate)}
                  </Text>
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
            </View>

            {/*
              IMPORTANT: No delete/cancel action here.
              Backend DELETE /bookings/{id} is ADMIN_SYSTEM/ADMINISTRATIVE only.
            */}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  scrollView: {flex: 1},
  content: {padding: 20},
  loader: {marginVertical: 40},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  codeText: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  statusBadge: {paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12},
  statusText: {color: '#fff', fontSize: 12, fontWeight: '600'},
  row: {flexDirection: 'row', gap: 12},
  col: {flex: 1},
  section: {marginTop: 12},
  label: {fontSize: 12, color: '#666', marginBottom: 4},
  value: {fontSize: 15, color: '#333', fontWeight: '600'},
  primaryButton: {
    marginTop: 16,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {color: '#fff', fontSize: 15, fontWeight: '700'},
  emptyContainer: {alignItems: 'center', paddingVertical: 40, gap: 12},
  emptyText: {fontSize: 16, color: '#999'},
});

export default UserBookingDetailScreen;
