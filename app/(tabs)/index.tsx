import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, StyleSheet, SafeAreaView, StatusBar, RefreshControl, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CD, BorrowRecord } from '../Types';
import { CDCard } from '../CDCard';

const { width } = Dimensions.get('window');

export default function App() {
  const [inv, setInv] = useState<CD[]>([
    { id: '1', title: 'Abbey Road', artist: 'Beatles', copies: 3 }, 
    { id: '2', title: 'Midnights', artist: 'T. Swift', copies: 1 },
    { id: '3', title: 'Short n\' Sweet', artist: 'Sabrina Carpenter', copies: 5 },
    { id: '4', title: '24K Magic', artist: 'Bruno Mars', copies: 2 },
    { id: '5', title: 'Kyogen', artist: 'Ado', copies: 3 },
    { id: '6', title: 'LEO-NiNE', artist: 'LiSA', copies: 4 },
    { id: '7', title: 'SOS', artist: 'SZA', copies: 2 },
    { id: '8', title: 'DAMN.', artist: 'Kendrick Lamar', copies: 1 }
  ]);
  const [bor, setBor] = useState<BorrowRecord[]>([]);
  const [inc, setInc] = useState(0);
  const [history, setHistory] = useState(0); 
  
  const [menu, setMenu] = useState(false);
  const [refr, setRefr] = useState(false);
  const [view, setView] = useState('Home');

  const slideAnim = useRef(new Animated.Value(-width)).current; 

  const toggleMenu = (show: boolean) => {
    if (show) {
      setMenu(true);
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: -width, duration: 250, useNativeDriver: true }).start(() => setMenu(false));
    }
  };

  const load = async () => {
    const d = await AsyncStorage.getItem('@db');
    if (d) { 
      const { inv, bor, inc, hist } = JSON.parse(d);
      setInv(inv); setBor(bor); setInc(inc); 
      setHistory(hist || 0);
    }
  };

  const onRefresh = useCallback(() => {
    setRefr(true);
    load().then(() => setRefr(false));
  }, []);

  useEffect(() => { load() }, []);
  
  useEffect(() => { 
    AsyncStorage.setItem('@db', JSON.stringify({ inv, bor, inc, hist: history })) 
  }, [inv, bor, inc, history]);

  const getP = (due: string) => {
    const d = Math.floor((Date.now() - new Date(due).getTime()) / 864e5);
    return d > 0 ? d * 2 : 0;
  };

  const onBorrow = (cd: CD) => {
    if (cd.copies <= 0) return Alert.alert("Out of Stock", "No copies available.");
    const due = new Date();
    due.setDate(due.getDate() + 7);

    setInv(inv.map(c => c.id === cd.id ? { ...c, copies: c.copies - 1 } : c));
    setBor([...bor, { 
      id: Date.now().toString(), 
      cdId: cd.id, 
      title: cd.title, 
      dueDate: due.toLocaleDateString() 
    }]);
    
    setHistory(h => h + 1);
    Alert.alert("Success", `You borrowed ${cd.title}`);
  };

  const onReturn = (record: BorrowRecord) => {
    const penalty = getP(record.dueDate);
    setInc(prev => prev + penalty);
    setInv(inv.map(c => c.id === record.cdId ? { ...c, copies: c.copies + 1 } : c));
    setBor(bor.filter(b => b.id !== record.id));
    
    Alert.alert("Returned", `Item returned successfully. Penalty: PHP ${penalty}`);
  };

  const renderContent = () => {
    if (view === 'Borrowed') return (
      <>
        <Text style={s.sec}>Your Active Loans</Text>
        {bor.length ? bor.map(b => (
          <CDCard 
            key={b.id} 
            title={b.title} 
            sub={`Due: ${b.dueDate}`} 
            info={`Penalty: PHP ${getP(b.dueDate)}`} 
            label="Return" 
            late={getP(b.dueDate) > 0} 
            onPress={() => onReturn(b)}
          />
        )) : <Text style={s.st}>No items borrowed.</Text>}
      </>
    );
    if (view === 'Stats') return (
      <View style={s.stat}>
        <Text style={[s.st, { fontSize: 20, marginBottom: 10 }]}> Overall Statistics</Text>
        <Text style={s.st}>Income: PHP {inc}</Text>
        <Text style={s.st}>Total: {history}</Text>
      </View>
    );
    return (
      <>
        <View style={s.stat}><Text style={s.st}>Income: PHP {inc}  •  Borrowed: {bor.length}</Text></View>
        <Text style={s.sec}>Inventory</Text>
        {inv.map(c => <CDCard key={c.id} title={c.title} sub={c.artist} info={`${c.copies} left`} label="Borrow" onPress={() => onBorrow(c)} />)}
      </>
    );
  };

  return (
    <View style={s.bg}>
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.nb}>
          <TouchableOpacity onPress={() => toggleMenu(true)} hitSlop={20}><Text style={s.mi}>☰</Text></TouchableOpacity>
          <Text style={s.nt}>{view === 'Home' ? 'CD Library App' : view}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView 
          style={{ paddingHorizontal: 20 }}
          refreshControl={<RefreshControl refreshing={refr} onRefresh={onRefresh} tintColor="#007AFF" colors={['#007AFF']} progressBackgroundColor="#fff" />}
        >
          {renderContent()}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={menu} transparent={true} animationType="none">
        <View style={s.mo}>
          <TouchableOpacity style={s.moClose} activeOpacity={1} onPress={() => toggleMenu(false)} />
          <Animated.View style={[s.dr, { transform: [{ translateX: slideAnim }] }]}>
            <Text style={s.dh}>Library Menu</Text>
            {[
              { l: "Home", v: "Home" },
              { l: "Borrowed", v: "Borrowed" },
              { l: "Stats", v: "Stats" }
            ].map(i => (
              <TouchableOpacity key={i.v} onPress={() => { setView(i.v); toggleMenu(false); }} style={s.ni}>
                <Text style={[s.nx, view === i.v && { color: '#007AFF' }]}>{i.l}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0a0a0a' },
  nb: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 45 },
  nt: { color: '#fff', fontSize: 18, fontWeight: '800' },
  mi: { color: '#fff', fontSize: 28 },
  stat: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 20, marginVertical: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  st: { color: '#eee', textAlign: 'center', fontWeight: '600', fontSize: 13 },
  sec: { color: '#666', fontWeight: '800', marginVertical: 12, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5 },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  moClose: { position: 'absolute', width: '100%', height: '100%' },
  dr: { width: '75%', height: '100%', backgroundColor: '#121212', padding: 40, paddingTop: 80, borderRightWidth: 1, borderRightColor: '#222' },
  dh: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  ni: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#222' },
  nx: { color: '#ccc', fontSize: 16 }
});