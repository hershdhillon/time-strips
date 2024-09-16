import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

const TimeStrip = ({ id, time, initialPosition, onRemove }) => {
    const meshRef = useRef()
    const textRef = useRef()
    const [opacity, setOpacity] = useState(1)

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Move the strip downwards
            meshRef.current.position.y -= delta * 2
            meshRef.current.rotation.x += delta * 0.1
            meshRef.current.rotation.z += delta * 0.05

            // Reduce opacity over time
            setOpacity((prevOpacity) => prevOpacity - delta * 0.1)

            // Remove the strip if it goes below y = -10 or is fully transparent
            if (meshRef.current.position.y < -5 || opacity <= 0) {
                onRemove(id)
            }
        }

        // Update text position and rotation to match the mesh
        if (textRef.current && meshRef.current) {
            textRef.current.position.copy(meshRef.current.position)
            textRef.current.rotation.copy(meshRef.current.rotation)
        }
    })

    return (
        <>
            <mesh ref={meshRef} position={initialPosition}>
                <planeGeometry args={[4, 0.5]} />
                <meshStandardMaterial
                    color="white"
                    transparent
                    opacity={Math.max(opacity, 0)}
                />
            </mesh>
            <Text
                ref={textRef}
                fontSize={0.2}
                color="black"
                anchorX="center"
                anchorY="middle"
                position={initialPosition}
            >
                {time}
            </Text>
        </>
    )
}

export default TimeStrip