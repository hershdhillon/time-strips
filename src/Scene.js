import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment } from "@react-three/drei";
import TimeStrip from './TimeStrip';
import SandFall from "./SandFall";

const Scene = () => {
    const { viewport } = useThree();
    const sandFallRef = useRef();

    // Calculate the fall duration based on a fixed reference height
    const fallDuration = useMemo(() => {
        const referenceHeight = 10; // A fixed reference height
        const baseDuration = 7; // seconds
        const scaleFactor = Math.sqrt(referenceHeight / viewport.height);
        return baseDuration * scaleFactor;
    }, [viewport.height]);

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
        const spawnY = viewport.height / 2 + 0.5;
        const spawnX = 0;

        return {
            id: now.getTime(),
            time: formattedTime,
            position: [spawnX, spawnY, 0],
        };
    }, [viewport.height]);

    // Initialize with a single strip
    const [strips, setStrips] = useState(() => [createStrip()]);

    const addStrip = useCallback(() => {
        setStrips((prevStrips) => [createStrip(), ...prevStrips]);
    }, [createStrip]);

    const resetStrips = useCallback(() => {
        setStrips([createStrip()]);
    }, [createStrip]);

    const removeStrip = useCallback((id) => {
        setStrips((prevStrips) => prevStrips.filter((strip) => strip.id !== id));
    }, []);

    const memoizedSandFall = useMemo(() => (
        <SandFall
            ref={sandFallRef}
            position={[0, 0, -5]}
            count={20000}
        />
    ), []);

    useEffect(() => {
        let interval = setInterval(addStrip, 1000);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearInterval(interval);
            } else {
                resetStrips();
                if (sandFallRef.current && sandFallRef.current.reset) {
                    sandFallRef.current.reset();
                }
                interval = setInterval(addStrip, 1000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [addStrip, resetStrips]);

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
                        fallDuration={fallDuration}
                    />
                ))}
            </group>
        </>
    );
};

export default Scene;