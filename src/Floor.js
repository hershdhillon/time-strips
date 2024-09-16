import React from 'react';
import { usePlane } from '@react-three/cannon';
import { useThree } from '@react-three/fiber';

const Floor = () => {
    const { viewport } = useThree();
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, -viewport.height / 2, 0],
    }));

    return (
        <mesh ref={ref} receiveShadow>
            <planeGeometry args={[viewport.width, viewport.depth]} />
            <meshStandardMaterial color="#404040" />
        </mesh>
    );
};

export default Floor;