// components/CameraModal.tsx

import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import {
    Button,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CameraModalProps {
    visible: boolean;
    onClose: () => void;
    onPhotoTaken: (photoUri: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
    visible,
    onClose,
    onPhotoTaken,
}) => {
    const [facing, setFacing] = useState<CameraType>('front');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const takePicture = async () => {
        try {
            const photo = await cameraRef.current?.takePictureAsync();
            if (photo?.uri) {
                onPhotoTaken(photo.uri);
            }
            onClose();
        } catch (error) {
            console.error('Error taking picture:', error);
        }
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>
                        Precisamos de permissão para acessar a câmera
                    </Text>
                    <Button onPress={requestPermission} title="Conceder permissão" />
                    <Button onPress={onClose} title="Cancelar" />
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide">
            <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
                <View style={styles.overlay}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={32} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: 20,
    },
    closeButton: {
        alignSelf: 'flex-start',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
});