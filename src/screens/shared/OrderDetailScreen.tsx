import React, {useEffect, useMemo, useState} from 'react';
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
import {useAuth} from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<RoleStackParamList>;
type Route = {key: string; name: string; params: {orderId: number}};

interface OrderItem {
  id: number;
  serviceId: number;
  serviceName?: string;
  quantity: number;
  price: number;
  amount: number;
}

interface Order {
  id: number;
  code: string;
  bookingId: number;
  status: string;
  totalAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  createdDate?: string;
  items?: OrderItem[];
}

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
    return date.toLocaleString('vi-VN');
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
    case 'COMPLETED':
      return '#4CAF50';
    case 'IN_PROGRESS':
      return '#2196F3';
    case 'CANCELLED':
    case 'REJECTED':
      return '#F44336';
    default:
      return '#666';
  }
};

const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute() as unknown as Route;
  const {user, userRole} = useAuth();

  const orderId = route.params?.orderId;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    navigation.setOptions({headerShown: true, title: 'Chi tiết đơn hàng'});
  }, [navigation]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, userRole]);

  const loadOrder = async () => {
    try {
      setLoading(true);

      // Use staff detail endpoint when staff to ensure correct authorization and items.
      const res =
        userRole === 'staff' && user?.id
          ? await apiClient.getStaffOrderDetail(Number(user.id), orderId)
          : await apiClient.getServiceOrder(orderId);

      if (res.success && res.data) {
        setOrder(res.data as any);
      } else {
        Alert.alert('Lỗi', res.error || 'Không tải được chi tiết đơn hàng');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const canCancel = useMemo(() => {
    if (!order) {
      return false;
    }
    // Backend CancelOrderService: "PENDING or CONFIRMED".
    // In our app, user sees PENDING_STAFF_CONFIRMATION as the initial pending state.
    return ['PENDING_STAFF_CONFIRMATION', 'CONFIRMED'].includes(order.status);
  }, [order]);

  const canStaffConfirmOrReject = useMemo(() => {
    if (!order) {
      return false;
    }
    return order.status === 'PENDING_STAFF_CONFIRMATION';
  }, [order]);

  const handleCancelOrder = () => {
    if (!order) {
      return;
    }
    Alert.alert('Hủy đơn hàng', 'Bạn có chắc muốn hủy đơn hàng này?', [
      {text: 'Không', style: 'cancel'},
      {
        text: 'Hủy',
        style: 'destructive',
        onPress: async () => {
          const res = await apiClient.cancelOrder(order.id);
          if (res.success) {
            Alert.alert('Thành công', 'Đã hủy đơn hàng');
            loadOrder();
          } else {
            Alert.alert('Lỗi', res.error || 'Hủy thất bại');
          }
        },
      },
    ]);
  };

  const handleStaffConfirm = () => {
    if (!order || !user?.id) {
      return;
    }
    Alert.alert('Xác nhận', 'Xác nhận đơn hàng này?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xác nhận',
        onPress: async () => {
          const res = await apiClient.staffConfirmOrder(
            order.id,
            Number(user.id),
          );
          if (res.success) {
            Alert.alert('Thành công', 'Đã xác nhận đơn hàng');
            loadOrder();
          } else {
            Alert.alert('Lỗi', res.error || 'Xác nhận thất bại');
          }
        },
      },
    ]);
  };

  const handleStaffReject = () => {
    if (!order || !user?.id) {
      return;
    }

    Alert.prompt(
      'Từ chối',
      'Nhập lý do từ chối (không bắt buộc):',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async reason => {
            const res = await apiClient.staffRejectOrder(
              order.id,
              Number(user.id),
              reason || '',
            );
            if (res.success) {
              Alert.alert('Thành công', 'Đã từ chối đơn hàng');
              loadOrder();
            } else {
              Alert.alert('Lỗi', res.error || 'Từ chối thất bại');
            }
          },
        },
      ],
      'plain-text',
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
          <TouchableOpacity style={styles.reloadBtn} onPress={loadOrder}>
            <Text style={styles.reloadText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.codeText}>{order.code}</Text>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(order.status)},
              ]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          <Text style={styles.metaText}>Booking ID: {order.bookingId}</Text>
          <Text style={styles.metaText}>
            Ngày tạo: {formatDate(order.createdDate)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Chi tiết dịch vụ</Text>
          {order.items && order.items.length > 0 ? (
            order.items.map(item => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>
                    {item.serviceName || `Service #${item.serviceId}`}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {formatCurrency(item.price)} x {item.quantity}
                  </Text>
                </View>
                <Text style={styles.itemAmount}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Không có dịch vụ nào</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tạm tính</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(order.subtotalAmount)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Giảm giá</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(order.discountAmount)}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={[styles.totalLabel, styles.finalTotalLabel]}>
              Tổng cộng
            </Text>
            <Text style={[styles.totalValue, styles.finalTotalValue]}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {userRole === 'user' && canCancel ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleCancelOrder}>
              <Text style={styles.actionButtonText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          ) : null}

          {userRole === 'staff' && canStaffConfirmOrReject ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.successButton]}
                onPress={handleStaffConfirm}>
                <Text style={styles.actionButtonText}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={handleStaffReject}>
                <Text style={styles.actionButtonText}>Từ chối</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  content: {padding: 20, paddingBottom: 40},
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
  loaderWrap: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  emptyText: {textAlign: 'center', color: '#999'},
  reloadBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  reloadText: {color: '#fff', fontWeight: '700'},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeText: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  statusBadge: {paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12},
  statusText: {color: '#fff', fontSize: 12, fontWeight: '600'},
  metaText: {color: '#666', marginBottom: 2},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemDetails: {flex: 1},
  itemName: {fontSize: 15, color: '#333', fontWeight: '600'},
  itemMeta: {color: '#666', marginTop: 2},
  itemAmount: {fontSize: 15, fontWeight: '700', color: '#2196F3'},
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: {fontSize: 15, color: '#666'},
  totalValue: {fontSize: 15, color: '#333'},
  finalTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  finalTotalLabel: {fontWeight: 'bold', color: '#333'},
  finalTotalValue: {fontWeight: 'bold', color: '#E91E63'},
  actionsContainer: {marginTop: 10, gap: 10},
  actionButton: {paddingVertical: 12, borderRadius: 10, alignItems: 'center'},
  actionButtonText: {color: '#fff', fontSize: 15, fontWeight: '700'},
  dangerButton: {backgroundColor: '#F44336'},
  successButton: {backgroundColor: '#4CAF50'},
});

export default OrderDetailScreen;
