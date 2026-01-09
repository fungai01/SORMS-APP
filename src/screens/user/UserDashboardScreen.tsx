import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {RoleStackParamList} from '../../navigation/types';
import {useAuth} from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import {Card, Header, LoadingBlock, Screen} from '../../components/ui/UiKit';
const UserDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RoleStackParamList>>();
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bookings: 0,
    orders: 0,
  });
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [unpaidOrders, setUnpaidOrders] = useState<Array<{
    id: number;
    code: string;
    totalAmount: number;
    status: string;
  }>>([]);
  const [processing, setProcessing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        setStats({bookings: 0, orders: 0});
        setCurrentBooking(null);
        setUnpaidOrders([]);
        return;
      }

      const bookingsRes = await apiClient.getBookingsByUser(user.id);
      const bookings = bookingsRes.success && bookingsRes.data ? bookingsRes.data : [];
      const bookingList = Array.isArray(bookings) ? (bookings as any[]) : [];

      // Find current booking (checked-in)
      const checkedIn = bookingList.find(
        b => String(b?.status || '').toUpperCase() === 'CHECKED_IN',
      );
      setCurrentBooking(checkedIn || null);

      // Count stats
      const bookingIds = bookingList
        .map(b => Number(b?.id))
        .filter(n => Number.isFinite(n));

      let totalOrders = 0;
      const unpaid: Array<{id: number; code: string; totalAmount: number; status: string}> = [];

      for (const bookingId of bookingIds) {
        const ordersRes = await apiClient.getOrdersByBooking(bookingId);
        if (ordersRes.success && ordersRes.data && Array.isArray(ordersRes.data)) {
          const list = ordersRes.data as any[];
          totalOrders += list.length;

          for (const o of list) {
            const st = String(o?.status || '').toUpperCase();
            if (st === 'PENDING_PAYMENT') {
              unpaid.push({
                id: Number(o.id),
                code: String(o.code || `#${o.id}`),
                totalAmount: Number(o.totalAmount || 0),
                status: st,
              });
            }
          }
        }
      }

      setUnpaidOrders(unpaid);
      setStats({
        bookings: bookingList.length,
        orders: totalOrders,
      });
    } catch (error) {
      console.error('Load dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'N/A';
    }
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return String(dateString);
    }
  };

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    } catch {
      return String(amount);
    }
  };
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);



  return (
    <Screen>
      <Header
        title={`Chào ${user?.firstName || ''}${user?.lastName ? ` ${user.lastName}` : ''}`.trim() || 'Chào mừng'}
        subtitle={user?.email}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.bookings}</Text>
            <Text style={styles.statLabel}>Đặt phòng</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.orders}</Text>
            <Text style={styles.statLabel}>Đơn hàng</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('UserRooms')}>
            <Text style={styles.quickActionTitle}>Phòng</Text>
            <Text style={styles.quickActionSubtitle}>Xem danh sách</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('UserOrders')}>
            <Text style={styles.quickActionTitle}>Đơn hàng</Text>
            <Text style={styles.quickActionSubtitle}>Theo dõi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('UserServices')}>
            <Text style={styles.quickActionTitle}>Dịch vụ</Text>
            <Text style={styles.quickActionSubtitle}>Đặt thêm</Text>
          </TouchableOpacity>
        </View>

        {/* Current room / booking */}
        <Text style={styles.sectionTitle}>Phòng hiện tại</Text>
        {currentBooking ? (
          <Card>
            <Text style={styles.primaryLine}>{String(currentBooking.code || 'Booking')}</Text>
            <Text style={styles.mutedLine}>
              Check-in: {formatDate(String(currentBooking.checkinDate || ''))}
            </Text>
            <Text style={styles.mutedLine}>
              Check-out: {formatDate(String(currentBooking.checkoutDate || ''))}
            </Text>
            <View style={{height: 10}} />
            <View style={styles.rowActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  navigation.navigate('UserBookingDetail', {
                    bookingId: Number(currentBooking.id),
                  })
                }>
                <Text style={styles.actionBtnText}>Xem chi tiết</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary, processing && {opacity: 0.7}]}
                disabled={processing}
                onPress={async () => {
                  if (!user?.id) return;
                  Alert.alert('Check-out', 'Bạn muốn check-out phòng này?', [
                    {text: 'Hủy', style: 'cancel'},
                    {
                      text: 'Check-out',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          setProcessing(true);
                          const res = await apiClient.checkoutBooking(
                            Number(currentBooking.id),
                            user.id,
                          );
                          if (res.success) {
                            Alert.alert('Thành công', 'Đã check-out');
                            loadDashboardData();
                          } else {
                            Alert.alert('Lỗi', res.error || 'Check-out thất bại');
                          }
                        } finally {
                          setProcessing(false);
                        }
                      },
                    },
                  ]);
                }}>
                <Text style={[styles.actionBtnText, {color: '#fff'}]}>Check-out</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Bạn chưa check-in phòng nào</Text>
          </Card>
        )}

        {/* Unpaid orders */}
        <Text style={styles.sectionTitle}>Hóa đơn chưa thanh toán</Text>
        {unpaidOrders.length ? (
          <View style={{gap: 10}}>
            {unpaidOrders.slice(0, 3).map(o => (
              <Card key={o.id}>
                <Text style={styles.primaryLine}>{o.code}</Text>
                <Text style={styles.mutedLine}>Tổng tiền: {formatCurrency(o.totalAmount)}</Text>
                <View style={{height: 10}} />
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      navigation.navigate('UserOrderDetail', {orderId: o.id})
                    }>
                    <Text style={styles.actionBtnText}>Xem</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnPrimary, processing && {opacity: 0.7}]}
                    disabled={processing}
                    onPress={async () => {
                      try {
                        setProcessing(true);
                        const res = await apiClient.createPayment(o.id);
                        if (res.success && (res.data as any)?.paymentUrl) {
                          const url = (res.data as any).paymentUrl as string;
                          await Linking.openURL(url);
                        } else {
                          Alert.alert('Lỗi', res.error || 'Không tạo được link thanh toán');
                        }
                      } finally {
                        setProcessing(false);
                      }
                    }}>
                    <Text style={[styles.actionBtnText, {color: '#fff'}]}>Thanh toán</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Không có hóa đơn chờ thanh toán</Text>
          </Card>
        )}

        {loading ? <LoadingBlock /> : null}
        <View style={{height: 10}} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  quickActionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
emptyCard: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  primaryLine: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  mutedLine: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  rowActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionBtnPrimary: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
});

export default UserDashboardScreen;
