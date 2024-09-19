import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment } from "@react-three/drei";
import TimeStrip from './TimeStrip';
import SandFall from "./SandFall";

const Scene = () => {
    const [strips, setStrips] = useState([]);
    const { viewport } = useThree();

    const formatTime = (date) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = days[date.getDay()];
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `${day} ${dateStr} at ${timeStr}`.toUpperCase();
    };

    const createStrip = useCallback(() => {
        const now = new Date();
        const formattedTime = formatTime(now);
        const spawnY = viewport.height / 2 + 0.5; // Spawn above the viewport
        const spawnX = 0; // Center of the screen

        return {
            id: now.getTime(),
            time: formattedTime,
            position: [spawnX, spawnY, 0],
        };
    }, [viewport.height]);

    const addStrip = useCallback(() => {
        setStrips((prevStrips) => [createStrip(), ...prevStrips]);
    }, [createStrip]);

    useEffect(() => {
        // Create initial strip immediately
        setStrips([createStrip()]);

        // Set up interval for adding new strips
        const interval = setInterval(addStrip, 1000);

        return () => clearInterval(interval);
    }, [createStrip, addStrip]);

    const removeStrip = useCallback((id) => {
        setStrips((prevStrips) => prevStrips.filter((strip) => strip.id !== id));
    }, []);

    const memoizedSandFall = useMemo(() => (
        <SandFall
            position={[0, 0, -5]}
            width={viewport.width * 3}
            height={viewport.height * 3}
            count={20000}
        />
    ), [viewport.width, viewport.height]);

    return (
        <>
            <pointLight intensity={100} position={[-10, 100, 100]} />
            <directionalLight intensity={10} />
            <spotLight intensity={100} position={[0, 0, 10]} />
            <Environment preset="studio" environmentIntensity={0.2} />

            {memoizedSandFall}

            <group>
                {strips.map((strip) => (
                    <TimeStrip
                        key={strip.id}
                        id={strip.id}
                        time={strip.time}
                        initialPosition={strip.position}
                        onRemove={removeStrip}
                    />
                ))}
            </group>
        </>
    );
};

export default Scene;