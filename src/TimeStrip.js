import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

const TimeStrip = ({ id, time, initialPosition, onRemove }) => {
    const textRef = useRef();
    const boxRef = useRef();
    const lifetimeRef = useRef(0);
    const { viewport } = useThree();

    const size = [viewport.width, 0.5, 0.1]; // Reduced height for better stacking
    const initialRotation = THREE.MathUtils.degToRad(-10);

    const [ref, api] = useBox(() => ({
        mass: 1, // Increased mass for better stacking
        position: initialPosition,
        args: size,
        linearDamping: 0.95,
        angularDamping: 0.95,
        friction: 0.5, // Added friction for better stacking
        restitution: 0.5, // Reduced restitution for less bouncing
        rotation: [initialRotation, 0, 0],
    }));

    useEffect(() => {
        api.applyImpulse([0, -5, 0], [0, 0, 0]);
    }, [api]);

    useFrame((state, delta) => {
        lifetimeRef.current += delta;

        if (lifetimeRef.current > 20) {
            onRemove(id);
        }

        if (ref.current) {
            const rotationDuration = 0.001;
            const t = Math.min(lifetimeRef.current / rotationDuration, 1);
            const rotationX = initialRotation * (1 - t);
            ref.current.rotation.x = rotationX;

            // Remove velocity when close to the floor to prevent jittering
            if (ref.current.position.y <= -viewport.height / 2 + 0.3) {
                api.velocity.set(0, 0, 0);
                api.angularVelocity.set(0, 0, 0);
                api.position.set(ref.current.position.x, -viewport.height / 2 + 0.5, ref.current.position.z);
            }
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
            const newWidth = viewport.width + 1;
            const newHeight = scaledTextHeight + 1;
            boxRef.current.scale.set(newWidth / size[0], newHeight / size[1], 5);
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
                <meshStandardMaterial color="white"   />
            </mesh>
            <Text3D
                ref={textRef}
                fontSize={0.2}
                scale={[1, 1, 1.5]}
                height={0.1}
                bevelEnabled
                color="black"
                anchorX="center"
                anchorY="middle"
                font="/Early GameBoy_Regular.json"
            >
                {time}
                <meshStandardMaterial color="black" />
            </Text3D>
        </group>
    );
};

export default TimeStrip;