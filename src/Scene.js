import React, { useState, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import TimeStrip from './TimeStrip';
import { Environment } from "@react-three/drei";
import SandFall from "./SandFall";
import RisingSand from "./RisingSand";

const Scene = () => {
    const [strips, setStrips] = useState([]);
    const { viewport } = useThree();

    const resetStrips = useCallback(() => {
        setStrips([]);
    }, []);

    const addStrip = useCallback(() => {
        const now = new Date();
        const formattedTime = formatTime(now);
        const spawnY = viewport.height / 2 + 0.5; // Spawn above the viewport
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
        return `${day} ${dateStr} at ${timeStr}`.toUpperCase();
    };

    const removeStrip = useCallback((id) => {
        setStrips((prevStrips) => prevStrips.filter((strip) => strip.id !== id));
    }, []);

    return (
        <>

            <pointLight  intensity={100}  position={[-10,100,100]}/>
            <directionalLight intensity={10}/>
            <spotLight intensity={100} position={[0,0,10]} />
            <Environment preset={"studio"}  environmentIntensity={0.2} />
            {/*<SandFall*/}
            {/*    position={[0, 0, -5]} // Centered position, pushed back on Z-axis*/}
            {/*    width={viewport.width * 3} // Extend beyond viewport for coverage*/}
            {/*    height={viewport.height * 3} // Extend beyond viewport for coverage*/}
            {/*    count={20000} // Number of particles*/}
            {/*/>*/}
            <RisingSand
                position={[0, 0, -5]}
                width={viewport.width * 3}
                height={viewport.height * 3}
                count={20000}
            />

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
    );
};

export default Scene;