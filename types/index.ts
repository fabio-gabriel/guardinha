// types/index.ts

export interface Guard {
    id: string;
    name: string;
    isActive: boolean;
}

export interface Checkpoint {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    description: string;
    order: number;
}

export interface VisitedCheckpoint {
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

export interface LocationCoords {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy?: number | null;
}

export interface MapLocation {
    latitude: number;
    longitude: number;
}

export type PatrolStatus = 'inactive' | 'active' | 'paused';

export interface MapRegion {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}
