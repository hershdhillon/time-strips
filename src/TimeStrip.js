import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useBox } from '@react-three/cannon'

const TimeStrip = ({ id, time, initialPosition, onRemove }) => {
    const [opacity, setOpacity] = useState(1)
    const [ref, api] = useBox(() => ({
        mass: 1,
        position: initialPosition,
        args: [4, 0.5, 0.2]
    }))

    useFrame((state, delta) => {
        // Reduce opacity over time
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
                <boxGeometry args={[4, 0.5, 0.2]} />
                <meshStandardMaterial
                    color="white"
                    transparent
                    opacity={opacity}
                />
            </mesh>
            <Text
                fontSize={0.2}
                color="black"
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