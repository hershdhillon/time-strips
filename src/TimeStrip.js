import React, { useRef, useState, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';
import * as THREE from 'three';

const TimeStrip = ({ id, time, initialPosition, onRemove }) => {
    const groupRef = useRef();
    const textRef = useRef();
    const boxRef = useRef();
    const { viewport } = useThree();
    const [hovered, setHovered] = useState(false);
    const spinRef = useRef(0);

    const size = [viewport.width, 0.5, 0.1];
    const initialRotation = THREE.MathUtils.degToRad(-40); // Initial rotation in radians

    useLayoutEffect(() => {
        if (textRef.current && textRef.current.geometry && boxRef.current) {
            // Compute the bounding box of the text geometry
            textRef.current.geometry.computeBoundingBox();
            const textBox = textRef.current.geometry.boundingBox;

            if (textBox) {
                const textWidth = textBox.max.x - textBox.min.x || 1;
                const textHeight = textBox.max.y - textBox.min.y || 1;

                // Calculate scale to fit text within the viewport width
                const maxTextWidth = viewport.width - 1; // Leave some padding
                const scale = Math.min(1, maxTextWidth / textWidth);
                textRef.current.scale.set(scale, scale, 1);

                // Recompute the bounding box after scaling
                textRef.current.geometry.computeBoundingBox();
                const scaledTextBox = textRef.current.geometry.boundingBox;
                const scaledTextWidth = scaledTextBox.max.x - scaledTextBox.min.x;
                const scaledTextHeight = scaledTextBox.max.y - scaledTextBox.min.y;

                // Center the text within the group
                const textCenterX = (scaledTextBox.max.x + scaledTextBox.min.x) / 2;
                const textCenterY = (scaledTextBox.max.y + scaledTextBox.min.y) / 2;
                textRef.current.position.set(-textCenterX, -textCenterY, 0.06);

                // Adjust the box to accommodate the text with some padding
                const boxWidth = scaledTextWidth + 0.5; // Add horizontal padding
                const boxHeight = scaledTextHeight + 0.5; // Add vertical padding
                boxRef.current.scale.set(boxWidth / size[0] + 0.01, boxHeight / size[1], 5);
                boxRef.current.position.set(0, 0, 0); // Center the box
            } else {
                // If bounding box is not ready, rerun the effect
                setTimeout(() => {
                    textRef.current.geometry.computeBoundingBox();
                }, 0);
            }
        }
    }, [viewport.width, time]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Downward movement
            groupRef.current.position.y -= delta * 2;

            // Define fadeEndY (you might need to adjust this based on your scene)
            const fadeEndY = -viewport.height / 2 - 1;

            // Calculate progress 'p' from 0 to 1 over the total distance
            const totalDistance = initialPosition[1] - fadeEndY;
            const currentDistance = initialPosition[1] - groupRef.current.position.y;
            const p = THREE.MathUtils.clamp(currentDistance / totalDistance, 0, 1);

            // Compute rotation using cosine function
            const rotation = initialRotation * Math.cos(p * Math.PI);
            groupRef.current.rotation.x = rotation;

            // Hover spin effect (optional)
            if (hovered) {
                spinRef.current += delta * 5;
                groupRef.current.rotation.x = Math.sin(spinRef.current) * (Math.PI / 4);
            }

            // Fading logic (if you want to fade out at the bottom)
            if (groupRef.current.position.y <= fadeEndY) {
                onRemove(id);
            }
        }
    });

    return (
        <group
            ref={groupRef}
            position={initialPosition}
            rotation={[initialRotation, 0, 0]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <mesh ref={boxRef}>
                <boxGeometry args={size} />
                <meshStandardMaterial color="white" transparent opacity={0}/>
            </mesh>
            <Text3D
                ref={textRef}
                fontSize={0.15}
                height={0.2}
                bevelEnabled
                font="/Early GameBoy_Regular.json"
            >
                {time}
                <meshStandardMaterial color="grey" />
            </Text3D>
        </group>
    );
};

export default TimeStrip;
