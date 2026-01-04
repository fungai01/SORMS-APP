import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import type {RoleStackParamList} from '../../navigation/types';

type Nav = NativeStackNavigationProp<RoleStackParamList>;

interface Order {
  id: number;
  code: string;
  bookingId: number;
  status: string;
  totalAmount: number;
  requestedBy: number;
  assignedStaffId?: number;
}

const StaffOrdersScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const response = await apiClient.getStaffTasksForOrder(Number(user.id));
        if (response.success && response.data) {
          setOrders(Array.isArray(response.data) ? response.data : []);
        } else {
          setOrders([]);
        }
      }
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

  const handleConfirm = async (orderId: number) => {
    if (!user?.id) {
      return;
    }

    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xác nhận đơn hàng này?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xác nhận',
        onPress: async () => {
          try {
            const response = await apiClient.staffConfirmOrder(
              orderId,
              Number(user.id),
            );
            if (response.success) {
              Alert.alert('Thành công', 'Đã xác nhận đơn hàng');
              loadOrders();
            } else {
              Alert.alert('Lỗi', response.error || 'Xác nhận thất bại');
            }
          } catch {
            Alert.alert('Lỗi', 'Xác nhận thất bại');
          }
        },
      },
    ]);
  };

  const handleReject = async (orderId: number) => {
    if (!user?.id) {
      return;
    }

    Alert.prompt(
      'Từ chối',
      'Nhập lý do từ chối:',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Từ chối',
          onPress: async reason => {
            try {
              const response = await apiClient.staffRejectOrder(
                orderId,
                Number(user.id),
                reason || '',
              );
              if (response.success) {
                Alert.alert('Thành công', 'Đã từ chối đơn hàng');
                loadOrders();
              } else {
                Alert.alert('Lỗi', response.error || 'Từ chối thất bại');
              }
            } catch {
              Alert.alert('Lỗi', 'Từ chối thất bại');
            }
          },
        },
      ],
      'plain-text',
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.content}>
          <Text style={styles.title}>Đơn hàng</Text>
          <Text style={styles.subtitle}>Quản lý đơn hàng dịch vụ</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#4CAF50"
              style={styles.loader}
            />
          ) : orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
            </View>
          ) : (
            orders.map(order => (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('StaffOrderDetail', {orderId: order.id})
                }
                style={styles.orderCard}>
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
                </View>
                {order.status === 'PENDING_STAFF_CONFIRMATION' && (
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.confirmButton]}
                      onPress={() => handleConfirm(order.id)}>
                      <Text style={styles.actionButtonText}>Xác nhận</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(order.id)}>
                      <Text style={styles.actionButtonText}>Từ chối</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCode: {
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
  orderInfo: {
    marginBottom: 12,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default StaffOrdersScreen;
