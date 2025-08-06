// App.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Components
import { CameraModal } from './components/CameraModal';
import { CheckpointList } from './components/CheckpointComponents';
import { GuardList } from './components/GuardComponents';
import { MapModal } from './components/MapModal';
import { AddCheckpointModal, AddGuardModal } from './components/ModalComponents';
import { PatrolHistory } from './components/PatrolHistory';

// Hooks
import { usePatrol } from './hooks/usePatrol';

// Types
import { MapLocation, MapRegion } from './types';

// Constants
import { DEFAULT_MAP_REGION } from './constants';

const { width, height } = Dimensions.get('window');

const SecurityPatrolApp: React.FC = () => {
    const {
        guards,
        selectedGuard,
        currentLocation,
        checkpoints,
        patrolStatus,
        visitedCheckpoints,
        currentCheckpointIndex,
        distanceToCheckpoint,
        addGuard,
        addCheckpoint,
        togglePatrol,
        completeCheckpoint,
        setTakePhotoCallback,
    } = usePatrol();

    // Modal states
    const [cameraVisible, setCameraVisible] = useState(false);
    const [guardModalVisible, setGuardModalVisible] = useState(false);
    const [checkpointModalVisible, setCheckpointModalVisible] = useState(false);
    const [mapModalVisible, setMapModalVisible] = useState(false);

    // Form states
    const [newGuardName, setNewGuardName] = useState('');
    const [newCheckpointName, setNewCheckpointName] = useState('');

    // Map states
    const [selectedMapLocation, setSelectedMapLocation] = useState<MapLocation | null>(null);
    const [mapRegion, setMapRegion] = useState<MapRegion>(
        currentLocation
            ? {
                ...DEFAULT_MAP_REGION,
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
            }
            : DEFAULT_MAP_REGION
    );

    // Handlers
    const handleAddGuard = () => {
        addGuard(newGuardName);
        setNewGuardName('');
        setGuardModalVisible(false);
    };

    const handleAddCheckpointFromCurrentLocation = () => {
        if (currentLocation) {
            addCheckpoint(
                newCheckpointName,
                currentLocation.latitude,
                currentLocation.longitude,
                'Parada na localização atual'
            );
            setNewCheckpointName('');
            setCheckpointModalVisible(false);
        }
    };

    const handleAddCheckpointFromMap = () => {
        if (selectedMapLocation) {
            addCheckpoint(
                newCheckpointName,
                selectedMapLocation.latitude,
                selectedMapLocation.longitude,
                'Parada selecionada no mapa'
            );
            setNewCheckpointName('');
            setSelectedMapLocation(null);
            setMapModalVisible(false);
        }
    };

    const handleOpenMapForCheckpoint = () => {
        setCheckpointModalVisible(false);
        setMapModalVisible(true);
        setSelectedMapLocation(null);
    };

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedMapLocation({ latitude, longitude });
    };

    const handlePhotoTaken = (photoUri: string) => {
        completeCheckpoint(photoUri);
    };

    // Set up the camera callback for proximity alerts
    useEffect(() => {
        setTakePhotoCallback(() => setCameraVisible(true));
    }, [setTakePhotoCallback]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Guardinha</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => setGuardModalVisible(true)}
                    >
                        <Ionicons name="person-add" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => setCheckpointModalVisible(true)}
                    >
                        <Ionicons name="location-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Status Bar */}
            {selectedGuard && (
                <View style={styles.statusBar}>
                    <Text style={styles.statusText}>
                        {selectedGuard.name} - Parada {currentCheckpointIndex + 1} de {checkpoints.length}
                    </Text>
                </View>
            )}

            <ScrollView style={styles.content}>
                {/* Guards Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Guardas</Text>
                    <GuardList guards={guards} onTogglePatrol={togglePatrol} />
                </View>

                {/* Checkpoints Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rota de Patrulha</Text>
                    <CheckpointList
                        checkpoints={checkpoints}
                        visitedCheckpoints={visitedCheckpoints}
                        currentCheckpointIndex={currentCheckpointIndex}
                        patrolStatus={patrolStatus}
                        currentLocation={currentLocation}
                        onTakePhoto={() => setCameraVisible(true)}
                    />
                </View>

                {/* Patrol History */}
                <PatrolHistory visitedCheckpoints={visitedCheckpoints} />
            </ScrollView>

            {/* Modals */}
            <CameraModal
                visible={cameraVisible}
                onClose={() => setCameraVisible(false)}
                onPhotoTaken={handlePhotoTaken}
            />

            <AddGuardModal
                visible={guardModalVisible}
                guardName={newGuardName}
                onGuardNameChange={setNewGuardName}
                onAddGuard={handleAddGuard}
                onClose={() => setGuardModalVisible(false)}
            />

            <AddCheckpointModal
                visible={checkpointModalVisible}
                checkpointName={newCheckpointName}
                currentLocation={currentLocation}
                onCheckpointNameChange={setNewCheckpointName}
                onAddFromCurrentLocation={handleAddCheckpointFromCurrentLocation}
                onOpenMap={handleOpenMapForCheckpoint}
                onClose={() => setCheckpointModalVisible(false)}
            />

            <MapModal
                visible={mapModalVisible}
                mapRegion={mapRegion}
                checkpoints={checkpoints}
                selectedLocation={selectedMapLocation}
                checkpointName={newCheckpointName}
                onMapPress={handleMapPress}
                onCheckpointNameChange={setNewCheckpointName}
                onConfirm={handleAddCheckpointFromMap}
                onClose={() => setMapModalVisible(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2c3e50',
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerButtons: {
        flexDirection: 'row',
    },
    headerButton: {
        marginLeft: 15,
    },
    statusBar: {
        backgroundColor: '#3498db',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    statusText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2c3e50',
    },
});

export default SecurityPatrolApp;