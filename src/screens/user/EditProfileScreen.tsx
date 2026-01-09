import React, {useMemo, useState} from 'react';
import {Alert, Text, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import apiClient from '../../services/apiClient';
import {useAuth} from '../../context/AuthContext';
import type {RoleStackParamList} from '../../navigation/types';
import {Button, Card, Header, Screen} from '../../components/ui/UiKit';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RoleStackParamList>>();
  const {user} = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // yyyy-mm-dd
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);

  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);

  const save = async () => {
    try {
      setSaving(true);
      const payload: any = {
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        fullName: fullName || null,
        gender: gender.trim() || null,
        dateOfBirth: dateOfBirth.trim() || null,
        phoneNumber: phoneNumber.trim() || null,
        address: address.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      };

      const res = await apiClient.updateMyProfile(payload);
      if (res.success) {
        Alert.alert('Thành công', 'Đã cập nhật hồ sơ');
        navigation.goBack();
      } else {
        Alert.alert('Lỗi', res.error || 'Cập nhật thất bại');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header
        title="Sửa hồ sơ"
        subtitle={user?.email || ''}
        right={
          <Button
            title="Quay lại"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={{height: 40, paddingHorizontal: 12}}
          />
        }
      />

      <Card style={{gap: 10}}>
        <Text style={{fontWeight: '800', color: '#111827'}}>Thông tin cơ bản</Text>

        <TextInput placeholder="First name" value={firstName} onChangeText={setFirstName} style={styles.input} />
        <TextInput placeholder="Last name" value={lastName} onChangeText={setLastName} style={styles.input} />
        <TextInput placeholder="Gender (MALE/FEMALE/OTHER)" value={gender} onChangeText={setGender} style={styles.input} />
        <TextInput placeholder="Date of birth (YYYY-MM-DD)" value={dateOfBirth} onChangeText={setDateOfBirth} style={styles.input} />

        <Text style={{fontWeight: '800', color: '#111827', marginTop: 6}}>Liên hệ</Text>
        <TextInput placeholder="Phone number" value={phoneNumber} onChangeText={setPhoneNumber} style={styles.input} />
        <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />

        <Text style={{fontWeight: '800', color: '#111827', marginTop: 6}}>Avatar</Text>
        <TextInput placeholder="Avatar URL" value={avatarUrl} onChangeText={setAvatarUrl} style={styles.input} />

        <View style={{height: 6}} />
        <Button title={saving ? 'Đang lưu...' : 'Lưu thay đổi'} onPress={save} disabled={saving} />
      </Card>
    </Screen>
  );
};

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    backgroundColor: '#fff',
  },
} as const;

export default EditProfileScreen;

