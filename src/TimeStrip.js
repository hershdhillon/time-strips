import React, { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useBox } from '@react-three/cannon'

const TimeStrip = ({ id, time, initialPosition, onRemove }) => {
    const [opacity, setOpacity] = useState(1)
    const [ref, api] = useBox(() => ({
        mass: 0.1,
        position: initialPosition,
        args: [8, 1, 0.1], // Increased size of the box
        linearDamping: 0.95,
    }))

    useFrame((state, delta) => {
        setOpacity((prevOpacity) => {
            const newOpacity = prevOpacity - delta * 0.05
            if (newOpacity <= 0) {
                onRemove(id)
            }
            return Math.max(newOpacity, 0)
        })
    })

    return (
        <group ref={ref}>
            <mesh>
                <boxGeometry args={[8, 1, 0.2]} /> {/* Increased size of the box */}
                <meshStandardMaterial
                    color="black" // Changed color to black
                    transparent={false} // Made the box opaque
                />
            </mesh>
            <Text
                fontSize={0.4} // Increased font size
                color="white" // Changed text color to white for contrast
                anchorX="center"
                anchorY="middle"
                position={[0, 0, 0.11]}
            >
                {time}
            </Text>
        </group>
    )
}

export default TimeStrip