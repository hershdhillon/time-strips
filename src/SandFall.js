import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SandFall = ({ position, count, centerRadius = 1 }) => {
    const meshRef = useRef();
    const { viewport } = useThree();

    // Calculate a scale factor based on viewport size
    const scaleFactor = useMemo(() => {
        const baseHeight = 10; // Assume a base height of 10 units
        const rawFactor = baseHeight / viewport.height;
        // Adjust the scale factor to be less extreme
        return Math.sqrt(rawFactor) * 0.7; // Square root for less dramatic scaling, then reduce by 30%
    }, [viewport.height]);

    // Generate random positions, colors, sizes, and velocities for the particles
    const [positions, colors, sizes, velocities] = useMemo(() => {
        const positionsArray = new Float32Array(count * 3);
        const colorsArray = new Float32Array(count * 3);
        const sizesArray = new Float32Array(count);
        const velocitiesArray = new Float32Array(count * 3);

        const width = viewport.width * 3;
        const height = viewport.height * 3;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            let x, y, z, distanceFromCenter;

            // Generate positions outside the central radius
            do {
                x = (Math.random() - 0.5) * width;
                z = (Math.random() - 0.5) * width;
                distanceFromCenter = Math.sqrt(x * x + z * z);
            } while (distanceFromCenter < centerRadius);

            y = Math.random() * height - height / 2;
            positionsArray[i3] = x;
            positionsArray[i3 + 1] = y;
            positionsArray[i3 + 2] = z;

            // Randomize color slightly to create shades of white
            const color = new THREE.Color();
            const hue = Math.random();
            const saturation = Math.random() * 0.05;
            const lightness = 0.9 + Math.random() * 0.1;
            color.setHSL(hue, saturation, lightness);
            colorsArray[i3] = color.r;
            colorsArray[i3 + 1] = color.g;
            colorsArray[i3 + 2] = color.b;

            // Particle sizes for visibility
            sizesArray[i] = (0.07 + Math.random() * 0.05) * scaleFactor;

            // Precompute velocities, scaled by the scaleFactor
            velocitiesArray[i3] = (Math.random() - 0.5) * 0.03 * scaleFactor;
            velocitiesArray[i3 + 1] = (-0.5 - Math.random() * 0.2) * scaleFactor; // Increased and varied falling speed
            velocitiesArray[i3 + 2] = (Math.random() - 0.5) * 0.03 * scaleFactor;
        }
        return [positionsArray, colorsArray, sizesArray, velocitiesArray];
    }, [count, viewport.width, viewport.height, centerRadius, scaleFactor]);

    // Create the geometry and set attributes
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        return geo;
    }, [positions, colors, sizes, velocities]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            const positions = meshRef.current.geometry.attributes.position.array;
            const velocities = meshRef.current.geometry.attributes.velocity.array;
            const width = viewport.width * 3;
            const height = viewport.height * 3;

            for (let i = 0; i < positions.length; i += 3) {
                // Update positions using precomputed velocities
                positions[i] += velocities[i] * delta * 60; // X-axis
                positions[i + 1] += velocities[i + 1] * delta * 60; // Y-axis (falling)
                positions[i + 2] += velocities[i + 2] * delta * 60; // Z-axis

                // Reset particle to the top if it goes below the bottom
                if (positions[i + 1] < -height / 2) {
                    positions[i + 1] = height / 2;

                    // Reset X and Z positions for randomness
                    positions[i] = (Math.random() - 0.5) * width;
                    positions[i + 2] = (Math.random() - 0.5) * width;

                    // Reset velocities for varied motion
                    velocities[i] = (Math.random() - 0.5) * 0.03 * scaleFactor;
                    velocities[i + 1] = (-0.5 - Math.random() * 0.2) * scaleFactor;
                    velocities[i + 2] = (Math.random() - 0.5) * 0.03 * scaleFactor;
                }
            }
            // Only need to update the position attribute
            meshRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    // Shader material to handle sizes and colors
    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexColors: true,
                uniforms: {
                    maxSize: { value: 2.5 * scaleFactor }, // Slightly increased max size
                },
                vertexShader: `
          uniform float maxSize;
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float pointSize = size * (300.0 / -mvPosition.z);
            gl_PointSize = min(pointSize, maxSize);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
                fragmentShader: `
          varying vec3 vColor;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0);
          }
        `,
                transparent: true,
                depthWrite: false,
            }),
        [scaleFactor]
    );

    return (
        <points ref={meshRef} position={position} geometry={geometry} material={material} />
    );
};

export default SandFall;