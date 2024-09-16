import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import Scene from './Scene'
import { OrbitControls } from "@react-three/drei";

const TimeWaterfall = () => {
    return (
        <Canvas
            camera={{ position: [0, 0, 25], fov: 75 }} // Increased FOV for wider view
        >
            <OrbitControls
                enablePan={false}
                enableRotate={true}
                enableZoom={false}
            />
            <Scene />
        </Canvas>
    )
}

export default TimeWaterfall