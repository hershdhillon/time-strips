import React, { useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { Physics, usePlane } from '@react-three/cannon'
import TimeStrip from './TimeStrip'


const Scene = () => {
    const [strips, setStrips] = useState([])

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            setStrips((prevStrips) => [
                {
                    id: now.getTime(),
                    time: now.toLocaleTimeString(),
                    position: [Math.random() * 8 - 4, 10, Math.random() * 2 - 1],
                },
                ...prevStrips.slice(0, 49), // Limit to 50 strips
            ])
        }, 1000)  // New strip every second

        return () => clearInterval(interval)
    }, [])

    const removeStrip = (id) => {
        setStrips((prevStrips) => prevStrips.filter((strip) => strip.id !== id))
    }

    return (
        <Physics>
            <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
            <OrbitControls />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} castShadow />
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