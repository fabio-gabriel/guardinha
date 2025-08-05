// constants/index.ts

export const CHECKPOINT_RADIUS = 50; // meters

export const DEFAULT_MAP_REGION = {
    latitude: -3.7319,
    longitude: -38.5267,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};

export const LOCATION_SETTINGS = {
    accuracy: 'High' as const,
    timeInterval: 10000,
    distanceInterval: 10,
};

export const SAMPLE_GUARDS = [
    { id: '1', name: 'João, o Guarda', isActive: false },
    { id: '2', name: 'Maria Maroa', isActive: false },
];

export const SAMPLE_CHECKPOINTS = [
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