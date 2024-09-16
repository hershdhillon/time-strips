import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';
import * as THREE from 'three';

const TimeStrip = ({ id, time, initialPosition, onRemove }) => {
    const groupRef = useRef();
    const textRef = useRef();
    const boxRef = useRef();
    const { viewport } = useThree();
    const opacityRef = useRef(1);
    const [hovered, setHovered] = useState(false);
    const spinRef = useRef(0);

    const size = [viewport.width, 0.5, 0.1];
    const initialRotation = THREE.MathUtils.degToRad(-40);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Simple downward movement
            groupRef.current.position.y -= delta * 2;

            // Curve-like rotation logic
            const t = Math.max(0, Math.min(1, 1 - groupRef.current.position.y / initialPosition[1]));
            const curveRotation = initialRotation * (1 - t) + THREE.MathUtils.degToRad(0) * t;
            groupRef.current.rotation.x = curveRotation;

            // Hover spin effect
            if (hovered) {
                spinRef.current += delta * 5; // Adjust the 5 to change spin speed
                groupRef.current.rotation.x = Math.sin(spinRef.current) * Math.PI / 4; // 45 degree rotation
            } else {
                spinRef.current = 0;
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, curveRotation, delta * 4);
            }

            // Fading logic
            const fadeStartY = viewport.height / 4; // Start fading in the lower quarter of the screen
            const fadeEndY = -viewport.height / 2 + size[1] - 20; // End fading just before going off-screen

            if (groupRef.current.position.y <= fadeStartY) {
                const fadeProgress = Math.max(0, Math.min(1, (fadeStartY - groupRef.current.position.y) / (fadeStartY - fadeEndY)));
                opacityRef.current = 1 - fadeProgress;

                // Remove the strip when it's fully faded out or about to go off-screen
                if (opacityRef.current <= 0.05 || groupRef.current.position.y <= fadeEndY) {
                    onRemove(id);
                    return;
                }
            }

            // Update text scaling and positioning
            if (textRef.current && boxRef.current) {
                const textBox = new THREE.Box3().setFromObject(textRef.current);
                const textWidth = textBox.max.x - textBox.min.x;
                const scale = Math.min(1, viewport.width / textWidth);

                if (Math.abs(textRef.current.scale.x - scale) > 0.01) {
                    textRef.current.scale.set(scale, scale, 1);
                }

                const scaledTextBox = new THREE.Box3().setFromObject(textRef.current);
                const scaledTextWidth = scaledTextBox.max.x - scaledTextBox.min.x;
                const scaledTextHeight = scaledTextBox.max.y - scaledTextBox.min.y;

                textRef.current.position.set(-scaledTextWidth / 2, -0.5, 0.06);

                const newWidth = viewport.width + 1;
                const newHeight = scaledTextHeight + 0.2;
                boxRef.current.scale.set(newWidth / size[0], newHeight / size[1], 5);
                boxRef.current.position.set(0, 0, 0);
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
                <meshStandardMaterial color="white" transparent={true} opacity={1} />
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
                <meshStandardMaterial color="black" transparent={true} opacity={1} />
            </Text3D>
        </group>
    );
};

export default TimeStrip;