import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

const UserDashboardScreen: React.FC = () => {
  const {user, logout} = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bookings: 0,
    orders: 0,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const bookingsRes = await apiClient.getBookingsByUser(user.id);

        const bookings =
          bookingsRes.success && bookingsRes.data ? bookingsRes.data : [];
        const bookingIds = Array.isArray(bookings)
          ? bookings
              .map((b: any) => Number(b?.id))
              .filter(n => Number.isFinite(n))
          : [];

        let totalOrders = 0;
        for (const bookingId of bookingIds) {
          const ordersRes = await apiClient.getOrdersByBooking(bookingId);
          if (
            ordersRes.success &&
            ordersRes.data &&
            Array.isArray(ordersRes.data)
          ) {
            totalOrders += ordersRes.data.length;
          }
        }

        setStats({
          bookings: Array.isArray(bookings) ? bookings.length : 0,
          orders: totalOrders,
        });
      }
    } catch (error) {
      console.error('Load dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Alert.alert('Lỗi', 'Đăng xuất thất bại');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Chào mừng!</Text>
          {user && (
            <>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </>
          )}
        </View>

        <View style={styles.content}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, styles.bookingsCard]}>
              <Text style={styles.statNumber}>{stats.bookings}</Text>
              <Text style={styles.statLabel}>Đặt phòng</Text>
            </View>
            <View style={[styles.statCard, styles.ordersCard]}>
              <Text style={styles.statNumber}>{stats.orders}</Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Hành động</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={loadDashboardData}>
              <Text style={styles.actionButtonText}>🔄 Làm mới dữ liệu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}>
              <Text style={[styles.actionButtonText, styles.logoutText]}>
                🚪 Đăng xuất
              </Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
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
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#F44336',
  },
  logoutText: {
    color: '#fff',
  },
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default UserDashboardScreen;
