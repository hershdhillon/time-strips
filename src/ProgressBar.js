import React, { useState, useEffect } from 'react';

const ProgressBar = ({ duration = 3000 }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((oldProgress) => {
                const newProgress = oldProgress + 100 / (duration / 100);
                return Math.min(newProgress, 100);
            });
        }, 100);

        return () => clearInterval(interval);
    }, [duration]);

    return (
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
                className="h-full bg-blue-500 transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export default ProgressBar;