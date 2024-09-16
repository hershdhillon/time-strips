import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {Environment, Text3D} from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

const TimeStrip = ({ id, time, initialPosition, onRemove }) => {
    const textRef = useRef();
    const boxRef = useRef();
    const lifetimeRef = useRef(0);
    const { viewport } = useThree();

    // Initial size: set it to the maximum expected size
    const size = [viewport.width, 1, 0.1];

    // Initial rotation of -30 degrees in radians
    const initialRotation = THREE.MathUtils.degToRad(-5);

    const [ref, api] = useBox(() => ({
        mass: 0.1,
        position: initialPosition,
        args: size,
        linearDamping: 0.95,
        angularDamping: 0.95,
        angularFactor: [0, 0, 0], // Prevent rotation
        rotation: [initialRotation, 0, 0],
    }));

    useEffect(() => {
        api.applyImpulse([0, -5, 0], [0, 0, 0]);
    }, [api]);

    useFrame((state, delta) => {
        lifetimeRef.current += delta;
        if (lifetimeRef.current > 10) {
            onRemove(id);
        }

        // Animate rotation back to zero over the specified duration
        if (ref.current) {
            const rotationDuration = 0.001; // Adjust this value to change how quickly rotation returns to zero
            const t = Math.min(lifetimeRef.current / rotationDuration, 1);
            const rotationX = initialRotation * (1 - t);
            ref.current.rotation.x = rotationX;
        }

        if (textRef.current && boxRef.current) {
            // Get the bounding box of the text
            const textBox = new THREE.Box3().setFromObject(textRef.current);
            const textWidth = textBox.max.x - textBox.min.x;
            const textHeight = textBox.max.y - textBox.min.y;

            // Calculate scale to fit viewport width, with a maximum scale
            const maxScale = 1; // Set this to whatever maximum scale you want
            const scale = Math.min(maxScale, viewport.width / textWidth);

            // Only update scale if it's significantly different
            if (Math.abs(textRef.current.scale.x - scale) > 0.01) {
                textRef.current.scale.set(scale, scale, 1);
            }

            // Recalculate text dimensions after scaling
            const scaledTextBox = new THREE.Box3().setFromObject(textRef.current);
            const scaledTextWidth = scaledTextBox.max.x - scaledTextBox.min.x;
            const scaledTextHeight = scaledTextBox.max.y - scaledTextBox.min.y;

            // Center text
            textRef.current.position.x = -scaledTextWidth / 2;
            textRef.current.position.y = -0.5;
            textRef.current.position.z = 0.06; // Slightly in front of the box

            // Adjust box visual scale to match text dimensions
            const newWidth = viewport.width + 20;
            const newHeight = scaledTextHeight + 0.3;
            boxRef.current.scale.set(newWidth / size[0], newHeight / size[1], 1);
            boxRef.current.position.x = 0;
            boxRef.current.position.y = 0;
            boxRef.current.position.z = 0;

            // Note: We are scaling the visual mesh but not the physics body
        }
    });

    return (
        <group ref={ref}>
            <mesh ref={boxRef}>
                <boxGeometry args={size} />
                <meshStandardMaterial color="white" />
            </mesh>
            <Text3D
                ref={textRef}
                fontSize={1}
                color="black"
                anchorX="center"
                anchorY="middle"
                font="/Early GameBoy_Regular.json"
            >
                {time}
                <meshStandardMaterial color="black" />
            </Text3D>
            <Environment
                preset="warehouse"
                blur={0.8}
                environmentIntensity={0.75}
            />
        </group>
    );
};

export default TimeStrip;
