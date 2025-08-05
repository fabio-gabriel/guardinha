// components/PatrolHistory.tsx

import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { VisitedCheckpoint } from '../types';

interface PatrolHistoryProps {
    visitedCheckpoints: VisitedCheckpoint[];
}

export const PatrolHistory: React.FC<PatrolHistoryProps> = ({ visitedCheckpoints }) => {
    if (visitedCheckpoints.length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paradas Completas</Text>
            {visitedCheckpoints.map((visit, index) => (
                <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyTitle}>{visit.checkpointName}</Text>
                    <Text style={styles.historyGuard}>Guarda: {visit.guardName}</Text>
                    <Text style={styles.historyTime}>
                        {new Date(visit.timestamp).toLocaleTimeString()}
                    </Text>
                    {visit.photoUri && (
                        <Image source={{ uri: visit.photoUri }} style={styles.historyPhoto} />
                    )}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2c3e50',
    },
    historyItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    historyGuard: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 2,
    },
    historyTime: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 2,
    },
    historyPhoto: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginTop: 10,
    },
});