import React, { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import TimeStrip from './TimeStrip'

const Scene = () => {
    const [strips, setStrips] = useState(() => {
        // Generate initial strips
        const initialStrips = []
        for (let i = 0; i < 5; i++) {
            const now = new Date()
            initialStrips.push({
                id: now.getTime() + i,
                time: now.toLocaleTimeString(),
                position: [Math.random() * 8 - 4, 10 - i * 2, Math.random() * 2 - 1],
            })
        }
        return initialStrips
    })

    useFrame(() => {
        if (Math.random() > 0.95) {
            const now = new Date()
            setStrips((prevStrips) => [
                {
                    id: now.getTime(),
                    time: now.toLocaleTimeString(),
                    position: [Math.random() * 8 - 4, 10, Math.random() * 2 - 1],
                },
                ...prevStrips.slice(0, 19),
            ])
        }
    })

    const removeStrip = (id) => {
        setStrips((prevStrips) => prevStrips.filter((strip) => strip.id !== id))
    }

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 15]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            {strips.map((strip) => (
                <TimeStrip
                    key={strip.id}
                    id={strip.id}
                    time={strip.time}
                    initialPosition={strip.position}
                    onRemove={removeStrip}
                />
            ))}
        </>
    )
}

export default Scene