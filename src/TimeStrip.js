import React, { useRef, useState, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';
import * as THREE from 'three';

const TimeStrip = ({ id, time, onRemove }) => {
    const groupRef = useRef();
    const textRef = useRef();
    const boxRef = useRef();
    const { viewport } = useThree();
    const [hovered, setHovered] = useState(false);
    const spinRef = useRef(0);
    const creationTime = useRef(null);
    const [geometryReady, setGeometryReady] = useState(false);

    const initialRotation = THREE.MathUtils.degToRad(-40); // Initial rotation in radians
    const padding = 2; // Adjust this value to increase or decrease padding

    useLayoutEffect(() => {
        if (geometryReady && textRef.current && textRef.current.geometry && boxRef.current) {
            // Compute bounding box of text geometry
            textRef.current.geometry.computeBoundingBox();
            const textBox = textRef.current.geometry.boundingBox;

            if (textBox) {
                const textWidth = textBox.max.x - textBox.min.x || 1;
                const textHeight = textBox.max.y - textBox.min.y || 1;

                // Calculate scale to make text cover the full viewport width minus padding
                const scale = (viewport.width - padding * 2) / textWidth;
                textRef.current.scale.set(scale, scale, 1);

                // Recompute the bounding box after scaling
                textRef.current.geometry.computeBoundingBox();
                const scaledTextBox = textRef.current.geometry.boundingBox;
                const scaledTextWidth = scaledTextBox.max.x - scaledTextBox.min.x;
                const scaledTextHeight = scaledTextBox.max.y - scaledTextBox.min.y;

                // Center the text within the group
                textRef.current.position.set(-viewport.width / 2 + padding, -scaledTextHeight / 2, 0.06);

                // Adjust the box to match the full viewport width
                const boxWidth = viewport.width;
                const boxHeight = scaledTextHeight + padding * 2;

                // Update the box geometry
                boxRef.current.geometry.dispose();
                boxRef.current.geometry = new THREE.BoxGeometry(1, 1, 0.1);
                boxRef.current.scale.set(boxWidth, boxHeight, 1);
                boxRef.current.position.set(0, 0, 0); // Center the box
            }
        }
    }, [geometryReady, viewport.width, viewport.height, time, padding]);

    useFrame((state, delta) => {
        if (creationTime.current === null) {
            creationTime.current = state.clock.getElapsedTime();
        }

        if (groupRef.current) {
            const elapsedTime = state.clock.getElapsedTime() - creationTime.current;
            const duration = 7; // seconds
            const startY = viewport.height / 2 + 0.5;
            const endY = -viewport.height / 2 - 1;
            const totalDistance = startY - endY;
            const p = elapsedTime / duration;
            const currentY = startY - p * totalDistance;
            groupRef.current.position.y = currentY;

            // Smooth entry animation
            const entryDuration = 0.5; // Duration of entry animation in seconds
            const entryProgress = Math.min(elapsedTime / entryDuration, 1);
            const entryEase = easeOutCubic(entryProgress);

            // Update rotation based on progress 'p' and entry animation
            const rotation = initialRotation * Math.cos(p * Math.PI) * entryEase;
            groupRef.current.rotation.x = rotation;

            // Hover spin effect (if needed)
            if (hovered) {
                spinRef.current += delta * 5;
                groupRef.current.rotation.x = Math.sin(spinRef.current) * (Math.PI / 4);
            }

            // Remove strip when it reaches the end
            if (p >= 1) {
                onRemove(id);
            }
        }
    });

    // Easing function for smooth entry
    const easeOutCubic = (t) => {
        return 1 - Math.pow(1 - t, 3);
    };

    return (
        <group
            ref={groupRef}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <mesh ref={boxRef}>
                <boxGeometry args={[1, 1, 0.1]} />
                <meshStandardMaterial color="white" transparent opacity={0} />
            </mesh>
            <Text3D
                ref={textRef}
                fontSize={0.15}
                height={0.1}
                bevelEnabled
                font="/Early GameBoy_Regular.json"
                onUpdate={() => {
                    setGeometryReady(true);
                }}
            >
                {time}
                <meshStandardMaterial color="white" />
            </Text3D>
        </group>
    );
};

export default TimeStrip;
