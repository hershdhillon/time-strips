import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment } from "@react-three/drei";
import TimeStrip from './TimeStrip';
import SandFall from "./SandFall";

const Scene = () => {
    const { viewport } = useThree();

    const formatTime = (date) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = days[date.getDay()];
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `${day} ${dateStr} at ${timeStr}`.toUpperCase();
    };

    const createStrip = useCallback((date, yOffset = 0) => {
        const formattedTime = formatTime(date);
        const spawnY = viewport.height / 2 + 0.5 - yOffset;
        const spawnX = 0;

        return {
            id: date.getTime(),
            time: formattedTime,
            position: [spawnX, spawnY, 0],
        };
    }, [viewport.height]);

    // Initialize strips with prerolled content
    const [strips, setStrips] = useState(() => {
        const now = new Date();
        return [
            createStrip(new Date(now.getTime() - 2000), 2), // 2 seconds ago
            createStrip(new Date(now.getTime() - 1000), 1), // 1 second ago
            createStrip(now, 0) // Current time
        ];
    });

    const addStrip = useCallback(() => {
        const now = new Date();
        setStrips((prevStrips) => [createStrip(now), ...prevStrips]);
    }, [createStrip]);

    const resetStrips = useCallback(() => {
        const now = new Date();
        setStrips([
            createStrip(new Date(now.getTime() - 2000), 2),
            createStrip(new Date(now.getTime() - 1000), 1),
            createStrip(now, 0)
        ]);
    }, [createStrip]);

    useEffect(() => {
        let interval = setInterval(addStrip, 1000);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearInterval(interval);
            } else {
                resetStrips();
                interval = setInterval(addStrip, 1000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [addStrip, resetStrips]);

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