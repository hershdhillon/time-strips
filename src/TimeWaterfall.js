import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import Scene from './Scene'

const TimeWaterfall = () => {
    return (
        <Canvas shadows>
            <Scene />
        </Canvas>
    )
}

export default TimeWaterfall