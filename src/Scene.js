import React, { useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { Physics, usePlane } from '@react-three/cannon'
import TimeStrip from './TimeStrip'

const Floor = () => {
    const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -2, 0] }))
    return (
        <mesh ref={ref} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial color="#171717" opacity={0.4} />
        </mesh>
    )
}

const Scene = () => {
    const [strips, setStrips] = useState([])

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            setStrips((prevStrips) => [
                {
                    id: now.getTime(),
                    time: now.toLocaleTimeString(),
                    position: [Math.random() * 8 - 4, 10, Math.random() * 2 - 1], // Reduced height to 5
                },
                ...prevStrips.slice(0, 49), // Limit to 50 strips
            ])
        }, 1000)  // New strip every 2 seconds

        return () => clearInterval(interval)
    }, [])

    const removeStrip = (id) => {
        setStrips((prevStrips) => prevStrips.filter((strip) => strip.id !== id))
    }

    return (
        <Physics>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
            <OrbitControls />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} castShadow />
            <Floor />
            {strips.map((strip) => (
                <TimeStrip
                    key={strip.id}
                    id={strip.id}
                    time={strip.time}
                    initialPosition={strip.position}
                    onRemove={removeStrip}
                />
            ))}
        </Physics>
    )
}

export default Scene