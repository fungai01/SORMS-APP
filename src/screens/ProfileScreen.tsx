import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {Button, Screen, Header} from '../components/ui/UiKit';

const ProfileScreen: React.FC = () => {
  const {user, logout} = useAuth();

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  return (
    <Screen>
      <Header title="Tài khoản" subtitle={user?.email || ''} />

      <View style={styles.center}>
        {user?.avatarUrl ? (
          <Image source={{uri: user.avatarUrl}} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}

        <View style={{height: 10}} />
        <View style={styles.namePill}>
          <Button
            title={fullName || 'Người dùng'}
            onPress={() => {}}
            variant="secondary"
            disabled
            style={styles.namePillBtn}
            textStyle={styles.namePillText}
          />
        </View>
      </View>

      <View style={{height: 14}} />

      <Button title="Đăng xuất" variant="danger" onPress={logout} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    marginTop: 6,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E5E7EB',
  },
  namePill: {
    width: '100%',
  },
  namePillBtn: {
    height: 44,
  },
  namePillText: {
    fontWeight: '800',
  },
});

export default ProfileScreen;
