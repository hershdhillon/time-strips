import React, { useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import TimeStrip from './TimeStrip'

const Scene = () => {
    const [strips, setStrips] = useState([])
    const { viewport } = useThree()

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            const formattedTime = formatTime(now)
            setStrips((prevStrips) => [
                {
                    id: now.getTime(),
                    time: formattedTime,
                    position: [0, viewport.height / 2 - 1, 0], // Centered horizontally, top of screen vertically
                },
                ...prevStrips.slice(0, 49),
            ])
        }, 450)

        return () => clearInterval(interval)
    }, [viewport])

    const formatTime = (date) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const day = days[date.getDay()]
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        return `${day} ${dateStr} ${timeStr}`
    }

    const removeStrip = (id) => {
        setStrips((prevStrips) => prevStrips.filter((strip) => strip.id !== id))
    }

    return (
        <Physics iterations={10} tolerance={0.0001} defaultContactMaterial={{ restitution: 0.5 }}>
            <ambientLight intensity={10} />
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