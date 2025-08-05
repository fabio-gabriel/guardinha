// components/CheckpointComponents.tsx

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
import { Checkpoint, LocationCoords, PatrolStatus, VisitedCheckpoint } from '../types';
import { calculateDistance } from '../utils';

interface CheckpointListProps {
    checkpoints: Checkpoint[];
    visitedCheckpoints: VisitedCheckpoint[];
    currentCheckpointIndex: number;
    patrolStatus: PatrolStatus;
    currentLocation: LocationCoords | null;
    onTakePhoto: () => void;
}

interface CheckpointItemProps {
    checkpoint: Checkpoint;
    index: number;
    isCurrentCheckpoint: boolean;
    isCompleted: boolean;
    distance: number | null;
    onTakePhoto: () => void;
}

const CheckpointItem: React.FC<CheckpointItemProps> = ({
    checkpoint,
    isCurrentCheckpoint,
    isCompleted,
    distance,
    onTakePhoto,
}) => (
    <View style={[
        styles.checkpointItem,
        isCurrentCheckpoint && styles.currentCheckpoint,
        isCompleted && styles.completedCheckpoint
    ]}>
        <View style={styles.checkpointHeader}>
            <Text style={styles.checkpointName}>
                {checkpoint.order}. {checkpoint.name}
            </Text>
            {isCompleted && (
                <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
            )}
            {isCurrentCheckpoint && (
                <Ionicons name="location" size={24} color="#3498db" />
            )}
        </View>
        <Text style={styles.checkpointDescription}>{checkpoint.description}</Text>
        {distance !== null && (
            <Text style={styles.distanceText}>
                Distância: {Math.round(distance)}m
            </Text>
        )}
        {isCurrentCheckpoint && !isCompleted && (
            <TouchableOpacity
                style={styles.manualPhotoButton}
                onPress={onTakePhoto}
            >
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.manualPhotoButtonText}>Tirar Foto Manualmente</Text>
            </TouchableOpacity>
        )}
    </View>
);

export const CheckpointList: React.FC<CheckpointListProps> = ({
    checkpoints,
    visitedCheckpoints,
    currentCheckpointIndex,
    patrolStatus,
    currentLocation,
    onTakePhoto,
}) => {
    const renderCheckpointItem: ListRenderItem<Checkpoint> = ({ item, index }) => {
        const isCurrentCheckpoint = index === currentCheckpointIndex && patrolStatus === 'active';
        const isCompleted = visitedCheckpoints.some(v => v.checkpointId === item.id);
        const distance = currentLocation ? calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            item.latitude,
            item.longitude
        ) : null;

        return (
            <CheckpointItem
                checkpoint={item}
                index={index}
                isCurrentCheckpoint={isCurrentCheckpoint}
                isCompleted={isCompleted}
                distance={distance}
                onTakePhoto={onTakePhoto}
            />
        );
    };

    return (
        <FlatList
            data={checkpoints}
            renderItem={renderCheckpointItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
        />
    );
};

const styles = StyleSheet.create({
    checkpointItem: {
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
    currentCheckpoint: {
        borderLeftWidth: 4,
        borderLeftColor: '#3498db',
    },
    completedCheckpoint: {
        borderLeftWidth: 4,
        borderLeftColor: '#27ae60',
        opacity: 0.7,
    },
    checkpointHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    checkpointName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        flex: 1,
    },
    checkpointDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 5,
    },
    distanceText: {
        fontSize: 12,
        color: '#3498db',
        fontWeight: '500',
    },
    manualPhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fd5800',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    manualPhotoButtonText: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 14,
    },
});