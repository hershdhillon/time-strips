import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import Scene from './Scene'

const TimeWaterfall = () => {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 0, 50], fov: 20 }}
        >
            <Scene />
        </Canvas>
    )
}

export default TimeWaterfall