// hooks/usePatrol.ts

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { CHECKPOINT_RADIUS, SAMPLE_CHECKPOINTS, SAMPLE_GUARDS } from '../constants';
import { LocationService } from '../services/locationService';
import { PatrolService } from '../services/patrolService';
import {
    Guard,
    LocationCoords
} from '../types';

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
        setState(prev => ({ ...prev, currentLocation: location }));
        checkProximityToCheckpoint(location);
      });
    };

    setupLocation();

    return () => {
      locationService.stopLocationTracking();
    };
  }, []);

  const checkProximityToCheckpoint = useCallback((coords: LocationCoords) => {
    if (state.patrolStatus !== 'active' || !coords) return;

    const currentCheckpoint = state.checkpoints[state.currentCheckpointIndex];
    if (!currentCheckpoint) return;

    const distance = PatrolService.checkProximityToCheckpoint(coords, currentCheckpoint);
    setState(prev => ({ ...prev, distanceToCheckpoint: distance }));

    if (distance <= CHECKPOINT_RADIUS) {
      PatrolService.showProximityAlert(currentCheckpoint.name, () => {
        // This will be handled by the camera modal
      });
    }
  }, [state.patrolStatus, state.currentCheckpointIndex, state.checkpoints]);

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
  }, [state.selectedGuard, state.currentLocation, state.checkpoints, state.currentCheckpointIndex]);

  return {
    ...state,
    addGuard,
    addCheckpoint,
    togglePatrol,
    completeCheckpoint,
  };
};