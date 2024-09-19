import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SandFall = React.forwardRef(({ position, count = 20000, centerRadius = 1 }, ref) => {
    const meshRef = useRef();
    const { viewport } = useThree();

    // Calculate scale factors based on viewport size
    const [scaleFactor, velocityFactor] = useMemo(() => {
        const baseHeight = 10;
        const aspectRatio = viewport.width / viewport.height;
        const rawFactor = baseHeight / viewport.height;

        let scale = Math.sqrt(rawFactor) * 0.9;
        let velocity = 1;

        // Adjust for portrait mode (long screens)
        if (aspectRatio < 1) {
            const portraitFactor = Math.pow(aspectRatio, 0.3);
            scale *= portraitFactor;
            velocity *= portraitFactor;
        }

        return [scale, velocity];
    }, [viewport.width, viewport.height]);

    const generateParticles = useCallback(() => {
        const positionsArray = new Float32Array(count * 3);
        const colorsArray = new Float32Array(count * 3);
        const sizesArray = new Float32Array(count);
        const velocitiesArray = new Float32Array(count * 3);

        const width = viewport.width * 3;
        const height = viewport.height * 3;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            let x, y, z, distanceFromCenter;

            do {
                x = (Math.random() - 0.5) * width;
                z = (Math.random() - 0.5) * width;
                distanceFromCenter = Math.sqrt(x * x + z * z);
            } while (distanceFromCenter < centerRadius);

            y = Math.random() * height - height / 2;
            positionsArray[i3] = x;
            positionsArray[i3 + 1] = y;
            positionsArray[i3 + 2] = z;

            const color = new THREE.Color();
            const hue = Math.random();
            const saturation = Math.random() * 0.05;
            const lightness = 0.9 + Math.random() * 0.1;
            color.setHSL(hue, saturation, lightness);
            colorsArray[i3] = color.r;
            colorsArray[i3 + 1] = color.g;
            colorsArray[i3 + 2] = color.b;

            sizesArray[i] = (0.1 + Math.random() * 0.1) * scaleFactor;

            velocitiesArray[i3] = (Math.random() - 0.5) * 0.02 * velocityFactor;
            velocitiesArray[i3 + 1] = (-0.3 - Math.random() * 0.1) * velocityFactor;
            velocitiesArray[i3 + 2] = (Math.random() - 0.5) * 0.02 * velocityFactor;
        }
        return [positionsArray, colorsArray, sizesArray, velocitiesArray];
    }, [count, viewport.width, viewport.height, centerRadius, scaleFactor, velocityFactor]);

    const [positions, colors, sizes, velocities] = useMemo(generateParticles, [generateParticles]);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        return geo;
    }, [positions, colors, sizes, velocities]);

    const reset = useCallback(() => {
        const [newPositions, newColors, newSizes, newVelocities] = generateParticles();
        meshRef.current.geometry.attributes.position.array.set(newPositions);
        meshRef.current.geometry.attributes.color.array.set(newColors);
        meshRef.current.geometry.attributes.size.array.set(newSizes);
        meshRef.current.geometry.attributes.velocity.array.set(newVelocities);
        meshRef.current.geometry.attributes.position.needsUpdate = true;
        meshRef.current.geometry.attributes.color.needsUpdate = true;
        meshRef.current.geometry.attributes.size.needsUpdate = true;
        meshRef.current.geometry.attributes.velocity.needsUpdate = true;
    }, [generateParticles]);

    React.useImperativeHandle(ref, () => ({
        reset
    }));

    useFrame((state, delta) => {
        if (meshRef.current) {
            const positions = meshRef.current.geometry.attributes.position.array;
            const velocities = meshRef.current.geometry.attributes.velocity.array;
            const width = viewport.width * 3;
            const height = viewport.height * 3;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i] * delta * 60;
                positions[i + 1] += velocities[i + 1] * delta * 60;
                positions[i + 2] += velocities[i + 2] * delta * 60;

                if (positions[i + 1] < -height / 2) {
                    positions[i + 1] = height / 2;
                    positions[i] = (Math.random() - 0.5) * width;
                    positions[i + 2] = (Math.random() - 0.5) * width;
                    velocities[i] = (Math.random() - 0.5) * 0.02 * velocityFactor;
                    velocities[i + 1] = (-0.3 - Math.random() * 0.1) * velocityFactor;
                    velocities[i + 2] = (Math.random() - 0.5) * 0.02 * velocityFactor;
                }
            }
            meshRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexColors: true,
                uniforms: {
                    maxSize: { value: 3.5 * scaleFactor },
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
});

export default SandFall;