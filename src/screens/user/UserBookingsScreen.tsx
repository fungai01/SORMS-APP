import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RoleStackParamList} from '../../navigation/types';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Đặt phòng</Text>
              <Text style={styles.subtitle}>Quản lý các đặt phòng của bạn</Text>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('UserCreateBooking')}>
              <Text style={styles.createButtonText}>Tạo</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#2196F3"
              style={styles.loader}
            />
          ) : bookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có đặt phòng nào</Text>
            </View>
          ) : (
            bookings.map(booking => (
              <TouchableOpacity
                key={booking.id}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('UserBookingDetail', {
                    bookingId: booking.id,
                  })
                }
                style={styles.bookingCard}>
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
                  <Text style={styles.infoText}>
                    Số khách: {booking.numGuests}
                  </Text>
                  {booking.note && (
                    <Text style={styles.noteText}>Ghi chú: {booking.note}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  loader: {
    marginVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingInfo: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  noteText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default UserBookingsScreen;
