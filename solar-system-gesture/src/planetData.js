
// Scaling factors for "Bigger Solar System"
// Adjusted slightly for this scene scale if needed, but keeping original for fidelity
const SCALE_ORBIT = 1.5;
const SCALE_SIZE = 2.0;

export const PLANET_DEFS = [
    {
        name: 'mercury',
        displayName: 'Mercury',
        description: 'Swift messenger planet',
        orbit: 3.2 * SCALE_ORBIT,
        size: 0.30 * SCALE_SIZE,
        speed: 3.5,
        hue: 0.08, sat: 0.15, lum: 0.40, // Darker rock
        roughness: 0.9, metalness: 0.2, // Rocky/Dusty
        moons: []
    },
    {
        name: 'venus',
        displayName: 'Venus',
        description: 'Morning star',
        orbit: 4.5 * SCALE_ORBIT,
        size: 0.38 * SCALE_SIZE,
        speed: 1.2,
        hue: 0.10, sat: 0.6, lum: 0.7, // Bright clouds
        roughness: 0.8, metalness: 0,
        moons: []
    },
    {
        name: 'earth',
        displayName: 'Earth',
        description: 'Blue marble',
        orbit: 6.0 * SCALE_ORBIT,
        size: 0.40 * SCALE_SIZE,
        speed: 0.8,
        hue: 0.6, sat: 0.6, lum: 0.4,
        roughness: 0.5, metalness: 0.1, // Water reflection
        atmosphere: true,
        moons: [
            { name: 'moon', displayName: 'The Moon', description: 'Earth\'s satellite', size: 0.11 * SCALE_SIZE, orbit: 0.8 * SCALE_SIZE, speed: 1.5, hue: 0.0, sat: 0.0, lum: 0.6, roughness: 0.9 }
        ]
    },
    {
        name: 'mars',
        displayName: 'Mars',
        description: 'Red planet',
        orbit: 7.5 * SCALE_ORBIT,
        size: 0.34 * SCALE_SIZE,
        speed: 0.6,
        hue: 0.02, sat: 0.6, lum: 0.4,
        roughness: 0.8, metalness: 0.1,
        moons: [
            { name: 'phobos', displayName: 'Phobos', description: 'Mars Moon I', size: 0.07 * SCALE_SIZE, orbit: 0.5 * SCALE_SIZE, speed: 2.0, hue: 0.05, sat: 0.2, lum: 0.5 },
            { name: 'deimos', displayName: 'Deimos', description: 'Mars Moon II', size: 0.06 * SCALE_SIZE, orbit: 0.7 * SCALE_SIZE, speed: 1.2, hue: 0.05, sat: 0.2, lum: 0.5 }
        ]
    },
    {
        name: 'jupiter',
        displayName: 'Jupiter',
        description: 'Gas giant',
        orbit: 11.0 * SCALE_ORBIT, // Increased spacing for giant
        size: 0.90 * SCALE_SIZE,
        speed: 0.15,
        hue: 0.08, sat: 0.4, lum: 0.6,
        roughness: 0.4, metalness: 0, // Gas
        moons: [
            { name: 'io', displayName: 'Io', description: 'Volcanic moon', size: 0.12 * SCALE_SIZE, orbit: 1.1 * SCALE_SIZE, speed: 2.5, hue: 0.15, sat: 0.8, lum: 0.7 },
            { name: 'europa', displayName: 'Europa', description: 'Icy moon', size: 0.11 * SCALE_SIZE, orbit: 1.4 * SCALE_SIZE, speed: 1.8, hue: 0.55, sat: 0.2, lum: 0.9 }
        ]
    },
    {
        name: 'saturn',
        displayName: 'Saturn',
        description: 'Ringed world',
        orbit: 14.5 * SCALE_ORBIT,
        size: 0.80 * SCALE_SIZE,
        speed: 0.1,
        hue: 0.12, sat: 0.4, lum: 0.6,
        roughness: 0.5, metalness: 0,
        moons: [
            { name: 'titan', displayName: 'Titan', description: 'Largest moon', size: 0.15 * SCALE_SIZE, orbit: 1.4 * SCALE_SIZE, orbitY: 0.1, speed: 1.0, hue: 0.10, sat: 0.4, lum: 0.5 }
        ]
    },
    {
        name: 'uranus',
        displayName: 'Uranus',
        description: 'Ice giant',
        orbit: 17.5 * SCALE_ORBIT,
        size: 0.60 * SCALE_SIZE,
        speed: 0.05,
        hue: 0.50, sat: 0.4, lum: 0.7,
        roughness: 0.4, metalness: 0, // Ice
        moons: [
            { name: 'titania', displayName: 'Titania', description: 'Uranus Moon I', size: 0.09 * SCALE_SIZE, orbit: 0.8 * SCALE_SIZE, speed: 1.5, hue: 0.6, sat: 0.1, lum: 0.7 }
        ]
    },
    {
        name: 'neptune',
        displayName: 'Neptune',
        description: 'Deep blue',
        orbit: 20.0 * SCALE_ORBIT,
        size: 0.55 * SCALE_SIZE,
        speed: 0.03,
        hue: 0.60, sat: 0.5, lum: 0.35,
        roughness: 0.4, metalness: 0,
        moons: [
            { name: 'triton', displayName: 'Triton', description: 'Retrograde moon', size: 0.11 * SCALE_SIZE, orbit: 0.8 * SCALE_SIZE, speed: -1.0, hue: 0.5, sat: 0.2, lum: 0.8 }
        ]
    },
];
