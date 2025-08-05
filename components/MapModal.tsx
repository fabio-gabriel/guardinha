// components/MapModal.tsx

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Checkpoint, MapLocation, MapRegion } from '../types';
import { formatCoordinates } from '../utils';

interface MapModalProps {
    visible: boolean;
    mapRegion: MapRegion;
    checkpoints: Checkpoint[];
    selectedLocation: MapLocation | null;
    checkpointName: string;
    onMapPress: (event: any) => void;
    onCheckpointNameChange: (name: string) => void;
    onConfirm: () => void;
    onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({
    visible,
    mapRegion,
    checkpoints,
    selectedLocation,
    checkpointName,
    onMapPress,
    onCheckpointNameChange,
    onConfirm,
    onClose,
}) => {
    const canConfirm = selectedLocation && checkpointName.trim();

    return (
        <Modal visible={visible} animationType="slide">
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#2c3e50" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Selecione uma Localização</Text>
                    <TouchableOpacity
                        onPress={onConfirm}
                        disabled={!canConfirm}
                        style={[
                            styles.confirmButton,
                            !canConfirm && styles.confirmButtonDisabled
                        ]}
                    >
                        <Text style={[
                            styles.confirmButtonText,
                            !canConfirm && styles.confirmButtonTextDisabled
                        ]}>
                            Confirmar
                        </Text>
                    </TouchableOpacity>
                </View>

                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    region={mapRegion}
                    onPress={onMapPress}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    {/* Existing checkpoints */}
                    {checkpoints.map((checkpoint) => (
                        <Marker
                            key={checkpoint.id}
                            coordinate={{
                                latitude: checkpoint.latitude,
                                longitude: checkpoint.longitude,
                            }}
                            title={checkpoint.name}
                            description={checkpoint.description}
                            pinColor="#3498db"
                        />
                    ))}

                    {/* Selected location */}
                    {selectedLocation && (
                        <Marker
                            coordinate={selectedLocation}
                            title="Nova Parada"
                            description={checkpointName || "Parada selecionada"}
                            pinColor="#e74c3c"
                        />
                    )}
                </MapView>

                {selectedLocation && (
                    <View style={styles.selectedLocationInfo}>
                        <Text style={styles.selectedLocationText}>
                            Localização Selecionada: {formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Nome da Parada"
                            value={checkpointName}
                            onChangeText={onCheckpointNameChange}
                        />
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    confirmButton: {
        backgroundColor: '#27ae60',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    confirmButtonDisabled: {
        backgroundColor: '#bdc3c7',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    confirmButtonTextDisabled: {
        color: '#7f8c8d',
    },
    map: {
        flex: 1,
    },
    selectedLocationInfo: {
        backgroundColor: '#fff',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    selectedLocationText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 10,
        textAlign: 'center',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
});