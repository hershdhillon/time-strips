import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment } from "@react-three/drei";
import TimeStrip from './TimeStrip';
import SandFall from "./SandFall";

const Scene = () => {
    const [strips, setStrips] = useState([]);
    const { viewport } = useThree();
    const sandFallRef = useRef();
    const intervalRef = useRef();

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

    const addStrip = useCallback(() => {
        setStrips((prevStrips) => [createStrip(), ...prevStrips]);
    }, [createStrip]);

    const resetScene = useCallback(() => {
        setStrips([createStrip()]);
        if (sandFallRef.current) {
            sandFallRef.current.reset();
        }
    }, [createStrip]);

    const startInterval = useCallback(() => {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(addStrip, 1000);
    }, [addStrip]);

    const stopInterval = useCallback(() => {
        clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopInterval();
            } else {
                resetScene();
                startInterval();
            }
        };

        const handleBlur = () => {
            resetScene();
            startInterval();
        };

        // Initial setup
        resetScene();
        startInterval();

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            stopInterval();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('blur', handleBlur);
        };
    }, [resetScene, startInterval, stopInterval]);

    const removeStrip = useCallback((id) => {
        setStrips((prevStrips) => prevStrips.filter((strip) => strip.id !== id));
    }, []);

    const memoizedSandFall = useMemo(() => (
        <SandFall
            ref={sandFallRef}
            position={[0, 0, -5]}
            width={viewport.width * 3}
            height={viewport.height * 3}
            count={50000}
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