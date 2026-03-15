import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const CDCard = ({ title, sub, info, label, onPress, late }: any) => (
  <View style={s.glass}>
    <View style={{ flex: 1 }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{title}</Text>
      <Text style={{ color: '#aaa', fontSize: 12 }}>{sub}</Text>
      {info && <Text style={{ color: late ? '#ff6b6b' : '#4ade80', fontSize: 11, marginTop: 4 }}>{info}</Text>}
    </View>
    <TouchableOpacity style={s.capsule} onPress={onPress}>
      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  </View>
);

const s = StyleSheet.create({
  glass: { backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: 16, borderRadius: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  capsule: { backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }
});