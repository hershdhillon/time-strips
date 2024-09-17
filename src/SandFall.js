// SandFall.js
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SandFall = ({ position, width, height, count, centerRadius = 1 }) => {
    const meshRef = useRef();

    // Generate random positions, colors, sizes, and velocities for the particles
    const [positions, colors, sizes, velocities] = useMemo(() => {
        const positionsArray = [];
        const colorsArray = [];
        const sizesArray = [];
        const velocitiesArray = [];
        for (let i = 0; i < count; i++) {
            let x, y, z, distanceFromCenter;

            // Generate positions outside the central radius
            do {
                x = (Math.random() - 0.5) * width;
                z = (Math.random() - 0.5) * width;
                distanceFromCenter = Math.sqrt(x * x + z * z);
            } while (distanceFromCenter < centerRadius);

            y = Math.random() * height - height / 2;
            positionsArray.push(x, y, z);

            // Randomize color slightly to create shades of white
            const color = new THREE.Color();
            const hue = Math.random(); // Hue can be any value
            const saturation = Math.random() * 0.05; // Low saturation (0 to 0.05)
            const lightness = 0.9 + Math.random() * 0.1; // High lightness (0.9 to 1.0)
            color.setHSL(hue, saturation, lightness);
            colorsArray.push(color.r, color.g, color.b);

            // Particle sizes for visibility
            sizesArray.push(0.07 + Math.random() * 0.05); // Sizes between 0.07 and 0.12

            // Precompute velocities
            const velocityX = (Math.random() - 0.5) * 0.015;
            const velocityY = -0.1; // Increased falling speed
            const velocityZ = (Math.random() - 0.5) * 0.015;
            velocitiesArray.push(velocityX, velocityY, velocityZ);
        }
        return [
            new Float32Array(positionsArray),
            new Float32Array(colorsArray),
            new Float32Array(sizesArray),
            new Float32Array(velocitiesArray),
        ];
    }, [count, width, height, centerRadius]);

    // Create the geometry and set attributes
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        return geo;
    }, [positions, colors, sizes, velocities]);

    useFrame(() => {
        if (meshRef.current) {
            const positions = meshRef.current.geometry.attributes.position.array;
            const velocities = meshRef.current.geometry.attributes.velocity.array;
            for (let i = 0; i < positions.length; i += 3) {
                // Update positions using precomputed velocities
                positions[i] += velocities[i];       // X-axis
                positions[i + 1] += velocities[i + 1]; // Y-axis (falling faster)
                positions[i + 2] += velocities[i + 2]; // Z-axis

                // Reset particle to the top if it goes below the bottom
                if (positions[i + 1] < -height / 2) {
                    positions[i + 1] = height / 2;

                    // Optionally reset X and Z positions for randomness
                    positions[i] = (Math.random() - 0.5) * width;
                    positions[i + 2] = (Math.random() - 0.5) * width;
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
                    maxSize: { value: 2.0 }, // Set the maximum point size
                },
                vertexShader: `
          uniform float maxSize;
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float pointSize = size * (300.0 / -mvPosition.z);
            gl_PointSize = min(pointSize, maxSize); // Clamp the point size to maxSize
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
        []
    );

    return (
        <points ref={meshRef} position={position} geometry={geometry} material={material} />
    );
};

export default SandFall;
