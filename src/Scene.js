import React, { useState, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import TimeStrip from './TimeStrip';
import { Environment } from "@react-three/drei";

const Scene = () => {
    const [strips, setStrips] = useState([]);
    const { viewport } = useThree();

    const resetStrips = useCallback(() => {
        setStrips([]);
    }, []);

    const addStrip = useCallback(() => {
        const now = new Date();
        const formattedTime = formatTime(now);
        const spawnY = viewport.height / 2 + 2; // Spawn above the viewport
        const spawnX = 0; // Center of the screen

        setStrips((prevStrips) => [
            {
                id: now.getTime(),
                time: formattedTime,
                position: [spawnX, spawnY, 0],
            },
            ...prevStrips,
        ]);
    }, [viewport.height]);

    useEffect(() => {
        let interval;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearInterval(interval);
            } else {
                resetStrips();
                interval = setInterval(addStrip, 1000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Initial setup
        interval = setInterval(addStrip, 1000);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [addStrip, resetStrips]);

    const formatTime = (date) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = days[date.getDay()];
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `${day} ${dateStr} ${timeStr}`.toUpperCase();
    };

    const removeStrip = (id) => {
        setStrips((prevStrips) => prevStrips.filter((strip) => strip.id !== id));
    };

    return (
        <Physics
            iterations={20}
            tolerance={0.0001}
            gravity={[0, -9.81, 0]}
            defaultContactMaterial={{ friction: 0.5, restitution: 0.2 }}
        >
            <Environment preset={"warehouse"} environmentIntensity={2}/>
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
    );
};

export default Scene;