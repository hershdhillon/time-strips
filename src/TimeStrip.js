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

    const size = [viewport.width, 0.5, 0.1];
    const initialRotation = THREE.MathUtils.degToRad(-10);

    const [ref, api] = useBox(() => ({
        mass: 1,
        position: initialPosition,
        args: size,
        linearDamping: 0.95,
        angularDamping: 0.95,
        friction: 0.5,
        restitution: 0.5,
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
            const t = Math.min(lifetimeRef.current / 0.001, 1);
            ref.current.rotation.x = initialRotation * (1 - t);

            if (ref.current.position.y <= -viewport.height / 2 + 0.3) {
                api.velocity.set(0, 0, 0);
                api.angularVelocity.set(0, 0, 0);
                api.position.set(ref.current.position.x, -viewport.height / 2 + 0.5, ref.current.position.z);
            }
        }

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
            const newHeight = scaledTextHeight + 1;
            boxRef.current.scale.set(newWidth / size[0], newHeight / size[1], 5);
            boxRef.current.position.set(0, 0, 0);
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