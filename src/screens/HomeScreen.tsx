import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useAuth} from '../context/AuthContext';

const HomeScreen: React.FC = () => {
  const {user, logout} = useAuth();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Lỗi', 'Đăng xuất thất bại');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Chào mừng!</Text>
        {user && (
          <>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.roles && user.roles.length > 0 && (
              <View style={styles.rolesContainer}>
                <Text style={styles.rolesLabel}>Vai trò:</Text>
                {user.roles.map((role, index) => (
                  <Text key={index} style={styles.role}>
                    {role}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    color: '#2196F3',
    marginBottom: 5,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  rolesContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  rolesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  role: {
    fontSize: 14,
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 4,
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
