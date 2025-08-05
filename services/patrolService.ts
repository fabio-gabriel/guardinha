// services/patrolService.ts

import { Alert } from 'react-native';
import { CHECKPOINT_RADIUS } from '../constants';
import {
    Checkpoint,
    Guard,
    LocationCoords,
    VisitedCheckpoint
} from '../types';
import { calculateDistance, generateId } from '../utils';

export class PatrolService {
    static checkProximityToCheckpoint(
        currentLocation: LocationCoords,
        checkpoint: Checkpoint
    ): number {
        return calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            checkpoint.latitude,
            checkpoint.longitude
        );
    }

    static isWithinCheckpointRadius(
        currentLocation: LocationCoords,
        checkpoint: Checkpoint
    ): boolean {
        const distance = this.checkProximityToCheckpoint(currentLocation, checkpoint);
        return distance <= CHECKPOINT_RADIUS;
    }

    static createVisitedCheckpoint(
        checkpoint: Checkpoint,
        guard: Guard,
        photoUri: string,
        location: LocationCoords
    ): VisitedCheckpoint {
        return {
            checkpointId: checkpoint.id,
            checkpointName: checkpoint.name,
            guardId: guard.id,
            guardName: guard.name,
            timestamp: new Date().toISOString(),
            photoUri,
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
            },
        };
    }

    static createNewGuard(name: string): Guard {
        return {
            id: generateId(),
            name: name.trim(),
            isActive: false,
        };
    }

    static createNewCheckpoint(
        name: string,
        latitude: number,
        longitude: number,
        description: string,
        order: number
    ): Checkpoint {
        return {
            id: generateId(),
            name: name.trim(),
            latitude,
            longitude,
            description,
            order,
        };
    }

    static updateGuardStatus(
        guards: Guard[],
        guardId: string,
        isActive: boolean
    ): Guard[] {
        return guards.map(guard => ({
            ...guard,
            isActive: guard.id === guardId ? isActive : false,
        }));
    }

    static showProximityAlert(checkpointName: string, onTakePhoto: () => void): void {
        Alert.alert(
            'Parada alcançada',
            `Você está perto de ${checkpointName}. Tire uma foto para completar esta parada.`,
            [{ text: 'Tirar Foto', onPress: onTakePhoto }]
        );
    }

    static showPatrolStartAlert(guardName: string): void {
        Alert.alert('Patrulha iniciada', `${guardName} começou a patrulha`);
    }

    static showPatrolEndAlert(): void {
        Alert.alert('Patrulha finalizada', 'Patrulha foi parada');
    }

    static showCheckpointCompleteAlert(): void {
        Alert.alert('Parada completa', 'Movendo para a próxima parada');
    }

    static showPatrolCompleteAlert(): void {
        Alert.alert('Patrulha completa', 'Todas as paradas foram concluídas');
    }
}