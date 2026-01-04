import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import apiClient from '../../services/apiClient';

interface Room {
  id: number;
  code: string;
  name: string;
  roomTypeId: number;
  floor: number;
  status: string;
  description?: string;
}

const UserRoomsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRoomsByStatus('AVAILABLE');
      if (response.success && response.data) {
        setRooms(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Load rooms error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '#4CAF50';
      case 'OCCUPIED':
        return '#F44336';
      case 'MAINTENANCE':
        return '#FF9800';
      case 'CLEANING':
        return '#2196F3';
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
          <Text style={styles.title}>Phòng</Text>
          <Text style={styles.subtitle}>Xem danh sách phòng có sẵn</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#2196F3"
              style={styles.loader}
            />
          ) : rooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có phòng nào</Text>
            </View>
          ) : (
            rooms.map(room => (
              <View key={room.id} style={styles.roomCard}>
                {/* Room Image */}
                <Image
                  source={require('../../assets/img/Room.jpg')}
                  style={styles.roomImage}
                  resizeMode="cover"
                />

                <View style={styles.roomContent}>
                  <View style={styles.roomHeader}>
                    <View style={styles.roomTitleContainer}>
                      <Text style={styles.roomName}>
                        {room.name || room.code}
                      </Text>
                      <Text style={styles.roomCode}>Mã: {room.code}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {backgroundColor: getStatusColor(room.status)},
                      ]}>
                      <Text style={styles.statusText}>{room.status}</Text>
                    </View>
                  </View>
                  <View style={styles.roomInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Tầng:</Text>
                      <Text style={styles.infoText}>{room.floor}</Text>
                    </View>
                    {room.description && (
                      <Text style={styles.descriptionText} numberOfLines={2}>
                        {room.description}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
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
  roomCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roomImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  roomContent: {
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  roomName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roomCode: {
    fontSize: 14,
    color: '#666',
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
  roomInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default UserRoomsScreen;
