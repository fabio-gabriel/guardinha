// services/locationService.ts

import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { LOCATION_SETTINGS } from '../constants';
import { LocationCoords } from '../types';

export class LocationService {
    private static instance: LocationService;
    private locationSubscription: Location.LocationSubscription | null = null;

    static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permissão negada',
                    'A permissão de localização é necessária para este aplicativo'
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            return false;
        }
    }

    async getCurrentLocation(): Promise<LocationCoords | null> {
        try {
            const location = await Location.getCurrentPositionAsync({});
            return location.coords;
        } catch (error) {
            console.error('Error getting current location:', error);
            Alert.alert('Erro', 'Falha ao obter localização atual');
            return null;
        }
    }

    startLocationTracking(
        onLocationUpdate: (location: LocationCoords) => void
    ): void {
        Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy[LOCATION_SETTINGS.accuracy],
                timeInterval: LOCATION_SETTINGS.timeInterval,
                distanceInterval: LOCATION_SETTINGS.distanceInterval,
            },
            (location) => {
                onLocationUpdate(location.coords);
            }
        ).then((subscription) => {
            this.locationSubscription = subscription;
        });
    }

    stopLocationTracking(): void {
        if (this.locationSubscription) {
            this.locationSubscription.remove();
            this.locationSubscription = null;
        }
    }
}