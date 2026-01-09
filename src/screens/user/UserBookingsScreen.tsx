import React, {useCallback, useEffect, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {RoleStackParamList} from '../../navigation/types';
import {useAuth} from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import {Button, Card, Header, LoadingBlock, Screen} from '../../components/ui/UiKit';

interface Booking {
  id: number;
  code: string;
  roomId: number;
  checkinDate: string;
  checkoutDate: string;
  numGuests: number;
  status: string;
  note?: string;
}

type Nav = NativeStackNavigationProp<RoleStackParamList>;

const UserBookingsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const response = await apiClient.getBookingsByUser(user.id);
        if (response.success && response.data) {
          setBookings(Array.isArray(response.data) ? response.data : []);
        } else {
          setBookings([]);
        }
      }
    } catch (error) {
      console.error('Load bookings error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
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
        title="Đặt phòng"
        subtitle="Quản lý các đặt phòng của bạn"
        right={
          <Button
            title="Tạo mới"
            onPress={() => navigation.navigate('UserCreateBooking')}
            style={{height: 40, paddingHorizontal: 12}}
          />
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {loading ? (
          <LoadingBlock />
        ) : bookings.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Chưa có đặt phòng nào</Text>
            <View style={{height: 10}} />
            <Button
              title="Tạo đặt phòng"
              onPress={() => navigation.navigate('UserCreateBooking')}
            />
          </Card>
        ) : (
          <View style={{gap: 10}}>
            {bookings.map(booking => (
              <TouchableOpacity
                key={booking.id}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('UserBookingDetail', {
                    bookingId: booking.id,
                  })
                }>
                <Card>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.bookingCode}>{booking.code}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {backgroundColor: getStatusColor(booking.status)},
                      ]}>
                      <Text style={styles.statusText}>{booking.status}</Text>
                    </View>
                  </View>

                  <View style={styles.bookingInfo}>
                    <Text style={styles.infoText}>
                      Check-in: {formatDate(booking.checkinDate)}
                    </Text>
                    <Text style={styles.infoText}>
                      Check-out: {formatDate(booking.checkoutDate)}
                    </Text>
                    <Text style={styles.infoText}>Số khách: {booking.numGuests}</Text>
                    {booking.note ? (
                      <Text style={styles.noteText}>Ghi chú: {booking.note}</Text>
                    ) : null}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  bookingInfo: {
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
});

export default UserBookingsScreen;
