import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text3D } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
import * as THREE from 'three'
const TimeStrip = ({ id, time, initialPosition, onRemove }) => {
    const [size, setSize] = useState([1, 1, 0.1])
    const [ref, api] = useBox(() => ({
        mass: 0.1,
        position: initialPosition,
        args: size,
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

            // Calculate scale to fit viewport width, with a maximum scale
            const maxScale = 1  // Set this to whatever maximum scale you want
            const scale = Math.min(maxScale, viewport.width / textWidth)

            // Only update scale if it's significantly different
            if (Math.abs(textRef.current.scale.x - scale) > 0.01) {
                textRef.current.scale.set(scale, scale, 1)
            }

            // Recalculate text dimensions after scaling
            const scaledTextBox = new THREE.Box3().setFromObject(textRef.current)
            const scaledTextWidth = scaledTextBox.max.x - scaledTextBox.min.x
            const scaledTextHeight = scaledTextBox.max.y - scaledTextBox.min.y

            // Center text
            textRef.current.position.x = -scaledTextWidth / 2
            textRef.current.position.y = -0.5
            textRef.current.position.z = 0.01 // Slightly in front of the box

            // Adjust box size to cover full width and match text height
            const newWidth = viewport.width
            const newHeight = scaledTextHeight + 0.09
            boxRef.current.scale.set(newWidth, newHeight, 0.1)
            boxRef.current.position.x = 0
            boxRef.current.position.y = 0
            boxRef.current.position.z = 0

            // Update physics body size
            if (Math.abs(size[0] - newWidth) > 0.01 || Math.abs(size[1] - newHeight) > 0.01) {
                setSize([newWidth, newHeight, 0.1])
            }
        }
    })

    useEffect(() => {
        // This effect will run whenever 'size' changes
        api.mass.set(0.1) // Reset the mass to recalculate physics
    }, [api, size])

    return (
        <group ref={ref}>
            <mesh ref={boxRef}>
                <boxGeometry args={size} />
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