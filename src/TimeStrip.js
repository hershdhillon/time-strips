import React, { useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useBox } from '@react-three/cannon'

const TimeStrip = ({ id, time, initialPosition, onRemove }) => {
    const [opacity, setOpacity] = useState(1)
    const [ref, api] = useBox(() => ({
        mass: 0.1,
        position: [
            initialPosition[0] + (Math.random() - 0.5) * 0.1,
            initialPosition[1],
            initialPosition[2] + (Math.random() - 0.5) * 0.1
        ],
        args: [8, 1, 0.1],
        linearDamping: 0.95,
    }))

    const lifetimeRef = useRef(0)

    useEffect(() => {
        api.applyImpulse([0, -5, 0], [0, 0, 0])
    }, [api])

    useFrame((state, delta) => {
        lifetimeRef.current += delta
        const newOpacity = 1 - lifetimeRef.current / 20
        if (newOpacity <= 0) {
            onRemove(id)
        }
        setOpacity(Math.max(newOpacity, 0))
    })

    return (
        <group ref={ref}>
            <mesh>
                <boxGeometry args={[8, 1, 0.2]} />
                <meshStandardMaterial
                    color="black"
                    transparent
                    opacity={opacity}
                />
            </mesh>
            <Text
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
                position={[0, 0, 0.11]}
                opacity={opacity}
            >
                {time}
            </Text>
        </group>
    )
}

export default TimeStrip