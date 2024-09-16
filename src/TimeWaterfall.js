import React from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import {OrbitControls} from '@react-three/drei'

const TimeWaterfall = () => {
    return (
        <Canvas camera={{ position: [0, 0, 25], fov: 75 }}>
            <OrbitControls enablePan={false} enableRotate={false} enableZoom={false} />
            <Scene />
        </Canvas>
    )
}

export default TimeWaterfall
