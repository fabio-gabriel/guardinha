import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ListRenderItem,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Type definitions
interface Guard {
  id: string;
  name: string;
  isActive: boolean;
}

interface Checkpoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  order: number;
}

interface VisitedCheckpoint {
  checkpointId: string;
  checkpointName: string;
  guardId: string;
  guardName: string;
  timestamp: string;
  photoUri: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface LocationCoords {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
}

type PatrolStatus = 'inactive' | 'active' | 'paused';

const CHECKPOINT_RADIUS: number = 50; // meters

const SecurityPatrolApp: React.FC = () => {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [patrolStatus, setPatrolStatus] = useState<PatrolStatus>('inactive');
  const [visitedCheckpoints, setVisitedCheckpoints] = useState<VisitedCheckpoint[]>([]);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState<number>(0);

  // Camera states
  const [facing, setFacing] = useState<CameraType>('front');
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [uri, setUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Modal states
  const [guardModalVisible, setGuardModalVisible] = useState<boolean>(false);
  const [checkpointModalVisible, setCheckpointModalVisible] = useState<boolean>(false);
  const [newGuardName, setNewGuardName] = useState<string>('');
  const [newCheckpointName, setNewCheckpointName] = useState<string>('');

  // Location tracking
  useEffect(() => {
    const setupPermissionsAndLocation = async (): Promise<void> => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'A permissão de localização é necessária para este aplicativo');
          return;
        }

        // Start location tracking
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);

        // Set up location watching
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          (location) => {
            setCurrentLocation(location.coords);
            checkProximityToCheckpoint(location.coords);
          }
        );
      } catch (error) {
        console.error('Error setting up permissions and location:', error);
        Alert.alert('Erro', 'Falha ao inicializar os serviços de localização');
      }
    };

    setupPermissionsAndLocation();
  }, []);

  // Sample data initialization
  useEffect(() => {
    // Initialize with sample guards and checkpoints
    const sampleGuards: Guard[] = [
      { id: '1', name: 'João, o Guarda', isActive: false },
      { id: '2', name: 'Maria Maroa ', isActive: false },
    ];

    const sampleCheckpoints: Checkpoint[] = [
      {
        id: '1',
        name: 'Entrada Principal',
        latitude: -3.7319,
        longitude: -38.5267,
        description: 'Verifique a entrada principal',
        order: 1,
      },
      {
        id: '2',
        name: 'Estacionamento',
        latitude: -3.7320,
        longitude: -38.5268,
        description: 'Patrulhe a área do estacionamento',
        order: 2,
      },
      {
        id: '3',
        name: 'Saída dos Fundos',
        latitude: -3.7321,
        longitude: -38.5269,
        description: 'Verifique a saída dos fundos',
        order: 3,
      },
    ];

    setGuards(sampleGuards);
    setCheckpoints(sampleCheckpoints.sort((a, b) => a.order - b.order));
  }, []);

  const handleManualPhoto = () => {
    setCameraVisible(true);
  };

  // Calculate distance between two coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Check if guard is near a checkpoint
  const checkProximityToCheckpoint = (coords: LocationCoords): void => {
    if (patrolStatus !== 'active' || !coords) return;

    const currentCheckpoint = checkpoints[currentCheckpointIndex];
    if (!currentCheckpoint) return;

    const distance = calculateDistance(
      coords.latitude,
      coords.longitude,
      currentCheckpoint.latitude,
      currentCheckpoint.longitude
    );

    if (distance <= CHECKPOINT_RADIUS) {
      Alert.alert(
        'Parada alcançada',
        `Você está perto de ${currentCheckpoint.name}. Tire uma foto para completar esta parada.`,
        [{ text: 'Tirar Foto', onPress: () => setCameraVisible(true) }]
      );
    }
  };

  // Add new guard
  const addGuard = (): void => {
    if (newGuardName.trim()) {
      const newGuard: Guard = {
        id: Date.now().toString(),
        name: newGuardName.trim(),
        isActive: false,
      };
      setGuards([...guards, newGuard]);
      setNewGuardName('');
      setGuardModalVisible(false);
    }
  };

  // Add new checkpoint
  const addCheckpoint = async (): Promise<void> => {
    if (newCheckpointName.trim() && currentLocation) {
      const newCheckpoint: Checkpoint = {
        id: Date.now().toString(),
        name: newCheckpointName.trim(),
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        description: 'Parada na localização atual',
        order: checkpoints.length + 1,
      };
      setCheckpoints([...checkpoints, newCheckpoint]);
      setNewCheckpointName('');
      setCheckpointModalVisible(false);
      Alert.alert('Sucesso', 'Parada adicionada na localização atual');
    } else {
      Alert.alert('Erro', 'Por favor, insira um nome e garanta que a localização esteja disponível');
    }
  };

  // Select guard and start/stop patrol
  const togglePatrol = (guard: Guard): void => {
    if (patrolStatus === 'inactive') {
      setSelectedGuard(guard);
      setPatrolStatus('active');
      setCurrentCheckpointIndex(0);
      setVisitedCheckpoints([]);

      // Update guard status
      setGuards(guards.map(g => ({
        ...g,
        isActive: g.id === guard.id
      })));

      Alert.alert('Patrulha iniciada', `${guard.name} começou a patrulha`);
    } else {
      setPatrolStatus('inactive');
      setSelectedGuard(null);
      setCurrentCheckpointIndex(0);
      setVisitedCheckpoints([]);

      // Update guard status
      setGuards(guards.map(g => ({ ...g, isActive: false })));

      Alert.alert('Patrulha finalizada', 'Patrulha foi parada');
    }
  };

  // Take photo at checkpoint
  const takePicture = async () => {
    console.log(cameraRef.current);
    const photo = await cameraRef.current?.takePictureAsync();
    setUri(photo?.uri ?? null);
    completeCheckpoint(photo?.uri ?? '');
    setCameraVisible(false);
  };

  // Complete checkpoint visit
  const completeCheckpoint = (photoUri: string): void => {
    if (!selectedGuard || !currentLocation) return;

    const currentCheckpoint = checkpoints[currentCheckpointIndex];
    const visitData: VisitedCheckpoint = {
      checkpointId: currentCheckpoint.id,
      checkpointName: currentCheckpoint.name,
      guardId: selectedGuard.id,
      guardName: selectedGuard.name,
      timestamp: new Date().toISOString(),
      photoUri,
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
    };

    setVisitedCheckpoints([...visitedCheckpoints, visitData]);

    if (currentCheckpointIndex < checkpoints.length - 1) {
      setCurrentCheckpointIndex(currentCheckpointIndex + 1);
      Alert.alert('Parada completa', 'Movendo para a próxima parada');
    } else {
      Alert.alert('Patrulha completa', 'Todas as paradas foram concluídas');
      setPatrolStatus('inactive');
      setSelectedGuard(null);
      setCurrentCheckpointIndex(0);
      setGuards(guards.map(g => ({ ...g, isActive: false })));
    }
  };

  // Render guard item
  const renderGuardItem: ListRenderItem<Guard> = ({ item }) => (
    <TouchableOpacity
      style={[styles.guardItem, item.isActive && styles.activeGuard]}
      onPress={() => togglePatrol(item)}
    >
      <View style={styles.guardInfo}>
        <Text style={styles.guardName}>{item.name}</Text>
        <Text style={styles.guardStatus}>
          {item.isActive ? 'On Patrol' : 'Available'}
        </Text>
      </View>
      <Ionicons
        name={item.isActive ? 'stop-circle' : 'play-circle'}
        size={32}
        color={item.isActive ? '#e74c3c' : '#27ae60'}
      />
    </TouchableOpacity>
  );

  // Render checkpoint item
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
      <TouchableOpacity
        onPress={() => setCameraVisible(true)}>
        <View style={[
          styles.checkpointItem,
          isCurrentCheckpoint && styles.currentCheckpoint,
          isCompleted && styles.completedCheckpoint
        ]}>
          <View style={styles.checkpointHeader}>
            <Text style={styles.checkpointName}>
              {item.order}. {item.name}
            </Text>
            {isCompleted && (
              <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
            )}
            {isCurrentCheckpoint && (
              <Ionicons name="location" size={24} color="#3498db" />
            )}
          </View>
          <Text style={styles.checkpointDescription}>{item.description}</Text>
          {distance !== null && (
            <Text style={styles.distanceText}>
              Distância: {Math.round(distance)}m
            </Text>
          )}
          {/* Manual photo button for current checkpoint if not completed */}
          {isCurrentCheckpoint && !isCompleted && (
            <TouchableOpacity
              style={styles.manualPhotoButton}
              onPress={handleManualPhoto}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.manualPhotoButtonText}>Tirar Foto Manualmente</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text>Precisamos de permissão para acessar a câmera</Text>
        <Button onPress={requestPermission} title="conceder permissão" />
      </View>
    );
  }

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
            {selectedGuard.name} - Checkpoint {currentCheckpointIndex + 1} de {checkpoints.length}
          </Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* Guards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guardas</Text>
          <FlatList
            data={guards}
            renderItem={renderGuardItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Checkpoints Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rota de Patrulha</Text>
          <FlatList
            data={checkpoints}
            renderItem={renderCheckpointItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Patrol History */}
        {visitedCheckpoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paradas completas</Text>
            {visitedCheckpoints.map((visit, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyTitle}>{visit.checkpointName}</Text>
                <Text style={styles.historyTime}>
                  {new Date(visit.timestamp).toLocaleTimeString()}
                </Text>
                {visit.photoUri && (
                  <Image source={{ uri: visit.photoUri }} style={styles.historyPhoto} />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={cameraVisible} animationType="slide">
        <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setCameraVisible(false)}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </Modal>

      {/* Add Guard Modal */}
      <Modal visible={guardModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Novo Guarda</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nome do Guarda"
              value={newGuardName}
              onChangeText={setNewGuardName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setGuardModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addGuard}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Checkpoint Modal */}
      <Modal visible={checkpointModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar parada para {currentLocation ? 'a localização atual' : 'uma nova localização'}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nome da Parada"
              value={newCheckpointName}
              onChangeText={setNewCheckpointName}
            />
            {currentLocation && (
              <Text style={styles.locationText}>
                Current Location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCheckpointModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addCheckpoint}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
  },
  cameraButton: {
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
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  confirmButton: {
    backgroundColor: '#3498db',
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
});

export default SecurityPatrolApp;