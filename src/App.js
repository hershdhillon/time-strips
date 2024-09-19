import React, { Suspense, lazy } from 'react';
import ProgressBar from './ProgressBar';

const TimeFall = lazy(() => import('./TimeFall'));

function App() {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Suspense fallback={<ProgressBar duration={5000} />}>
                <TimeFall />
            </Suspense>
        </div>
    );
}

export default App;