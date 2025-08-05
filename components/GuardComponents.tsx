// components/GuardComponents.tsx

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    ListRenderItem,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Guard } from '../types';

interface GuardListProps {
    guards: Guard[];
    onTogglePatrol: (guard: Guard) => void;
}

interface GuardItemProps {
    guard: Guard;
    onTogglePatrol: (guard: Guard) => void;
}

const GuardItem: React.FC<GuardItemProps> = ({ guard, onTogglePatrol }) => (
    <TouchableOpacity
        style={[styles.guardItem, guard.isActive && styles.activeGuard]}
        onPress={() => onTogglePatrol(guard)}
    >
        <View style={styles.guardInfo}>
            <Text style={styles.guardName}>{guard.name}</Text>
            <Text style={styles.guardStatus}>
                {guard.isActive ? 'Em Patrulha' : 'Disponível'}
            </Text>
        </View>
        <Ionicons
            name={guard.isActive ? 'stop-circle' : 'play-circle'}
            size={32}
            color={guard.isActive ? '#e74c3c' : '#27ae60'}
        />
    </TouchableOpacity>
);

export const GuardList: React.FC<GuardListProps> = ({ guards, onTogglePatrol }) => {
    const renderGuardItem: ListRenderItem<Guard> = ({ item }) => (
        <GuardItem guard={item} onTogglePatrol={onTogglePatrol} />
    );

    return (
        <FlatList
            data={guards}
            renderItem={renderGuardItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
        />
    );
};

const styles = StyleSheet.create({
    guardItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activeGuard: {
        borderLeftWidth: 4,
        borderLeftColor: '#27ae60',
    },
    guardInfo: {
        flex: 1,
    },
    guardName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    guardStatus: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 2,
    },
});