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

import {useAuth} from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import type {RoleStackParamList} from '../../navigation/types';
import {Card, Header, LoadingBlock, Screen} from '../../components/ui/UiKit';

type Nav = NativeStackNavigationProp<RoleStackParamList>;

interface Order {
  id: number;
  code: string;
  bookingId: number;
  status: string;
  totalAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  createdDate?: string;
}

const UserOrdersScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        setOrders([]);
        return;
      }

      // Backend requires bookingId for /orders/my-orders.
      // So we load bookings by user, then fetch orders per booking and merge.
      const bookingsRes = await apiClient.getBookingsByUser(user.id);
      if (!bookingsRes.success || !bookingsRes.data) {
        setOrders([]);
        return;
      }

      const bookings = Array.isArray(bookingsRes.data)
        ? (bookingsRes.data as any[])
        : [];
      const bookingIds: number[] = bookings
        .map(b => Number(b?.id))
        .filter(n => Number.isFinite(n));

      const allOrders: Order[] = [];

      for (const bookingId of bookingIds) {
        const res = await apiClient.getOrdersByBooking(bookingId);
        if (res.success && res.data) {
          const list = Array.isArray(res.data) ? (res.data as any[]) : [];
          for (const o of list) {
            allOrders.push(o as Order);
      }
        }
      }

      // Sort by createdDate desc if present
      allOrders.sort((a, b) => {
        const da = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const db = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return db - da;
      });

      setOrders(allOrders);
    } catch (error) {
      console.error('Load orders error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'N/A';
    }
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
      case 'PENDING_STAFF_CONFIRMATION':
        return '#FF9800';
      case 'PENDING_PAYMENT':
        return '#FFC107';
      case 'CONFIRMED':
        return '#4CAF50';
      case 'IN_PROGRESS':
        return '#2196F3';
      case 'COMPLETED':
        return '#4CAF50';
      case 'CANCELLED':
        return '#F44336';
      case 'REJECTED':
        return '#F44336';
      default:
        return '#666';
    }
  };

  return (
    <Screen>
      <Header title="Đơn hàng" subtitle="Xem lịch sử đơn hàng của bạn" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {loading ? (
          <LoadingBlock />
        ) : orders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          </Card>
        ) : (
          <View style={{gap: 10}}>
            {orders.map(order => (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('UserOrderDetail', {orderId: order.id})
                }>
                <Card>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderCode}>{order.code}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {backgroundColor: getStatusColor(order.status)},
                      ]}>
                      <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                  </View>

                  <View style={styles.orderInfo}>
                    <Text style={styles.amountText}>
                      Tổng tiền: {formatCurrency(order.totalAmount)}
                    </Text>
                    <Text style={styles.dateText}>
                      Ngày tạo: {formatDate(order.createdDate)}
                    </Text>
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderCode: {
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
  orderInfo: {
    gap: 6,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default UserOrdersScreen;
