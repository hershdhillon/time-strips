import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DigitalRain = ({ position, width, height, count }) => {
    const meshRef = useRef();

    // Generate random positions for the particles
    const positions = useMemo(() => {
        const positionsArray = [];
        for (let i = 0; i < count; i++) {
            positionsArray.push(
                (Math.random() - 0.5) * width, // X position within the given width
                Math.random() * height - height / 2, // Y position from -height/2 to height/2
                0 // Z position
            );
        }
        return new Float32Array(positionsArray);
    }, [count, width, height]);

    // Create the geometry and set the position attribute
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, [positions]);

    useFrame(() => {
        if (meshRef.current) {
            const positions = meshRef.current.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] -= 0.05; // Adjust the speed of falling

                // Reset particle to the top if it goes below the bottom
                if (positions[i] < -height / 2) {
                    positions[i] = height / 2;
                }
            }
            meshRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={meshRef} position={position} geometry={geometry}>
            <pointsMaterial
                size={0.3}
                color="white"
                sizeAttenuation={true}
                depthWrite={false}
            />
        </points>
    );
};

export default DigitalRain;
