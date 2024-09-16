import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text3D } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
import * as THREE from 'three'

const TimeStrip = ({ id, time, initialPosition, onRemove }) => {
    const [ref, api] = useBox(() => ({
        mass: 0.1,
        position: initialPosition,
        args: [8, 1, 0.1],
        linearDamping: 0.95,
    }))

    const textRef = useRef()
    const boxRef = useRef()
    const lifetimeRef = useRef(0)
    const { viewport } = useThree()

    useEffect(() => {
        api.applyImpulse([0, -5, 0], [0, 0, 0])
    }, [api])

    useFrame((state, delta) => {
        lifetimeRef.current += delta
        if (lifetimeRef.current > 20) {
            onRemove(id)
        }

        if (textRef.current && boxRef.current) {
            // Get the bounding box of the text
            const textBox = new THREE.Box3().setFromObject(textRef.current)
            const textWidth = textBox.max.x - textBox.min.x
            const textHeight = textBox.max.y - textBox.min.y

            // Calculate scale to fit viewport width
            const scale = Math.min(1, viewport.width / textWidth)
            textRef.current.scale.set(scale, scale, 1)

            // Recalculate text dimensions after scaling
            const scaledTextBox = new THREE.Box3().setFromObject(textRef.current)
            const scaledTextWidth = scaledTextBox.max.x - scaledTextBox.min.x
            const scaledTextHeight = scaledTextBox.max.y - scaledTextBox.min.y

            // Center text
            textRef.current.position.x = -scaledTextWidth / 2
            textRef.current.position.y = -0.5
            textRef.current.position.z = 0.01 // Slightly in front of the box

            // Adjust box size and position
            boxRef.current.scale.set(scaledTextWidth + 0.2, scaledTextHeight + 0.5, 0.1)
            boxRef.current.position.x = 0
            boxRef.current.position.y = 0
            boxRef.current.position.z = 0
        }
    })

    return (
        <group ref={ref}>
            <mesh ref={boxRef}>
                <boxGeometry args={[1, 1, 0.1]} />
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
        </group>
    )
}

export default TimeStrip