// hooks/usePatrol.ts

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CHECKPOINT_RADIUS, SAMPLE_CHECKPOINTS, SAMPLE_GUARDS } from '../constants';
import { LocationService } from '../services/locationService';
import { PatrolService } from '../services/patrolService';
import {
  Checkpoint,
  Guard,
  LocationCoords,
  PatrolStatus,
  VisitedCheckpoint,
} from '../types';

interface PatrolState {
  guards: Guard[];
  selectedGuard: Guard | null;
  currentLocation: LocationCoords | null;
  checkpoints: Checkpoint[];
  patrolStatus: PatrolStatus;
  visitedCheckpoints: VisitedCheckpoint[];
  currentCheckpointIndex: number;
  distanceToCheckpoint: number | null;
}

export const usePatrol = () => {
  const [state, setState] = useState<PatrolState>({
    guards: [],
    selectedGuard: null,
    currentLocation: null,
    checkpoints: [],
    patrolStatus: 'inactive',
    visitedCheckpoints: [],
    currentCheckpointIndex: 0,
    distanceToCheckpoint: null,
  });

  const locationService = LocationService.getInstance();
  const proximityAlertShownRef = useRef(false);
  const onTakePhotoRef = useRef<(() => void) | null>(null);

  // Initialize app with sample data
  useEffect(() => {
    setState(prev => ({
      ...prev,
      guards: SAMPLE_GUARDS,
      checkpoints: SAMPLE_CHECKPOINTS.sort((a, b) => a.order - b.order),
    }));
  }, []);

  // Setup location services
  useEffect(() => {
    const setupLocation = async () => {
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) return;

      const currentLocation = await locationService.getCurrentLocation();
      if (currentLocation) {
        setState(prev => ({ ...prev, currentLocation }));
      }

      locationService.startLocationTracking((location) => {
        setState(prev => {
          const newState = { ...prev, currentLocation: location };

          // Check proximity immediately with updated state
          if (newState.patrolStatus === 'active' && location) {
            checkProximityToCheckpoint(location, newState);
          }

          return newState;
        });
      });
    };

    setupLocation();

    return () => {
      locationService.stopLocationTracking();
    };
  }, []);

  const checkProximityToCheckpoint = useCallback((coords: LocationCoords, currentState: PatrolState) => {
    if (currentState.patrolStatus !== 'active' || !coords) return;

    const currentCheckpoint = currentState.checkpoints[currentState.currentCheckpointIndex];
    if (!currentCheckpoint) return;

    const isCompleted = currentState.visitedCheckpoints.some(v => v.checkpointId === currentCheckpoint.id);
    if (isCompleted) return;

    const distance = PatrolService.checkProximityToCheckpoint(coords, currentCheckpoint);

    setState(prev => ({ ...prev, distanceToCheckpoint: distance }));

    if (distance <= CHECKPOINT_RADIUS && !proximityAlertShownRef.current) {
      proximityAlertShownRef.current = true;
      PatrolService.showProximityAlert(currentCheckpoint.name, () => {
        if (onTakePhotoRef.current) {
          onTakePhotoRef.current();
        }
      });
    } else if (distance > CHECKPOINT_RADIUS) {
      proximityAlertShownRef.current = false;
    }
  }, []);

  // Reset proximity alert when checkpoint changes
  useEffect(() => {
    proximityAlertShownRef.current = false;
  }, [state.currentCheckpointIndex]);

  const addGuard = useCallback((name: string) => {
    if (!name.trim()) return;

    const newGuard = PatrolService.createNewGuard(name);
    setState(prev => ({
      ...prev,
      guards: [...prev.guards, newGuard],
    }));
    Alert.alert('Sucesso', 'Guarda adicionado');
  }, []);

  const addCheckpoint = useCallback((
    name: string,
    latitude: number,
    longitude: number,
    description: string
  ) => {
    if (!name.trim()) return;

    const newCheckpoint = PatrolService.createNewCheckpoint(
      name,
      latitude,
      longitude,
      description,
      state.checkpoints.length + 1
    );
    setState(prev => ({
      ...prev,
      checkpoints: [...prev.checkpoints, newCheckpoint],
    }));
    Alert.alert('Sucesso', 'Parada adicionada');
  }, [state.checkpoints.length]);

  const togglePatrol = useCallback((guard: Guard) => {
    if (state.patrolStatus === 'inactive') {
      setState(prev => ({
        ...prev,
        selectedGuard: guard,
        patrolStatus: 'active',
        currentCheckpointIndex: 0,
        visitedCheckpoints: [],
        guards: PatrolService.updateGuardStatus(prev.guards, guard.id, true),
      }));
      proximityAlertShownRef.current = false;
      PatrolService.showPatrolStartAlert(guard.name);
    } else {
      setState(prev => ({
        ...prev,
        patrolStatus: 'inactive',
        selectedGuard: null,
        currentCheckpointIndex: 0,
        visitedCheckpoints: [],
        guards: PatrolService.updateGuardStatus(prev.guards, '', false),
      }));
      proximityAlertShownRef.current = false;
      PatrolService.showPatrolEndAlert();
    }
  }, [state.patrolStatus]);

  const completeCheckpoint = useCallback((photoUri: string) => {
    if (!state.selectedGuard || !state.currentLocation) return;

    const currentCheckpoint = state.checkpoints[state.currentCheckpointIndex];
    const visitData = PatrolService.createVisitedCheckpoint(
      currentCheckpoint,
      state.selectedGuard,
      photoUri,
      state.currentLocation
    );

    setState(prev => {
      const newVisitedCheckpoints = [...prev.visitedCheckpoints, visitData];

      if (prev.currentCheckpointIndex < prev.checkpoints.length - 1) {
        PatrolService.showCheckpointCompleteAlert();
        return {
          ...prev,
          visitedCheckpoints: newVisitedCheckpoints,
          currentCheckpointIndex: prev.currentCheckpointIndex + 1,
        };
      } else {
        PatrolService.showPatrolCompleteAlert();
        return {
          ...prev,
          visitedCheckpoints: newVisitedCheckpoints,
          patrolStatus: 'inactive',
          selectedGuard: null,
          currentCheckpointIndex: 0,
          guards: PatrolService.updateGuardStatus(prev.guards, '', false),
        };
      }
    });

    // Reset proximity alert for next checkpoint
    proximityAlertShownRef.current = false;
  }, [state.selectedGuard, state.currentLocation, state.checkpoints, state.currentCheckpointIndex]);

  const setTakePhotoCallback = useCallback((callback: () => void) => {
    onTakePhotoRef.current = callback;
  }, []);

  return {
    ...state,
    addGuard,
    addCheckpoint,
    togglePatrol,
    completeCheckpoint,
    setTakePhotoCallback,
  };
};