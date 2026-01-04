import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../context/AuthContext';

const ProfileScreen: React.FC = () => {
  const {user} = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Thông tin cá nhân</Text>
          {user && (
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user.email}</Text>

              <Text style={styles.label}>Họ tên:</Text>
              <Text style={styles.value}>
                {user.firstName} {user.lastName}
              </Text>

              {user.roles && user.roles.length > 0 && (
                <>
                  <Text style={styles.label}>Vai trò:</Text>
                  {user.roles.map((role, index) => (
                    <Text key={index} style={styles.value}>
                      {role}
                    </Text>
                  ))}
                </>
              )}
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default ProfileScreen;
