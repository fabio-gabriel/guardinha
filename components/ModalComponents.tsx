// components/ModalComponents.tsx

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { LocationCoords } from '../types';
import { formatCoordinates } from '../utils';

interface AddGuardModalProps {
    visible: boolean;
    guardName: string;
    onGuardNameChange: (name: string) => void;
    onAddGuard: () => void;
    onClose: () => void;
}

interface AddCheckpointModalProps {
    visible: boolean;
    checkpointName: string;
    currentLocation: LocationCoords | null;
    onCheckpointNameChange: (name: string) => void;
    onAddFromCurrentLocation: () => void;
    onOpenMap: () => void;
    onClose: () => void;
}

export const AddGuardModal: React.FC<AddGuardModalProps> = ({
    visible,
    guardName,
    onGuardNameChange,
    onAddGuard,
    onClose,
}) => (
    <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Adicionar Novo Guarda</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Nome do Guarda"
                    value={guardName}
                    onChangeText={onGuardNameChange}
                />
                <View style={styles.modalButtons}>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.confirmButton]}
                        onPress={onAddGuard}
                    >
                        <Text style={styles.confirmButtonText}>Adicionar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

export const AddCheckpointModal: React.FC<AddCheckpointModalProps> = ({
    visible,
    checkpointName,
    currentLocation,
    onCheckpointNameChange,
    onAddFromCurrentLocation,
    onOpenMap,
    onClose,
}) => (
    <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Adicionar Nova Parada</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Nome da Parada"
                    value={checkpointName}
                    onChangeText={onCheckpointNameChange}
                />
                {currentLocation && (
                    <Text style={styles.locationText}>
                        Localização Atual: {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
                    </Text>
                )}
                <View style={styles.modalButtonsVertical}>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.mapButton]}
                        onPress={onOpenMap}
                    >
                        <Ionicons name="map" size={20} color="#fff" />
                        <Text style={styles.mapButtonText}>Escolher no Mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.currentLocationButton]}
                        onPress={onAddFromCurrentLocation}
                    >
                        <Ionicons name="location" size={20} color="#fff" />
                        <Text style={styles.currentLocationButtonText}>Usar Localização Atual</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButtonMapModal]}
                    onPress={onClose}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 15,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#2c3e50',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
    },
    locationText: {
        fontSize: 12,
        color: '#7f8c8d',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButtonsVertical: {
        height: 100,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ecf0f1',
    },
    cancelButtonMapModal: {
        backgroundColor: '#ecf0f1',
        marginTop: 20,
    },
    confirmButton: {
        backgroundColor: '#3498db',
    },
    mapButton: {
        backgroundColor: '#9b59b6',
        marginBottom: 10,
    },
    currentLocationButton: {
        backgroundColor: '#27ae60',
    },
    cancelButtonText: {
        textAlign: 'center',
        color: '#7f8c8d',
        fontWeight: '600',
    },
    confirmButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
    },
    mapButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
        marginLeft: 5,
    },
    currentLocationButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
        marginLeft: 5,
    },
});