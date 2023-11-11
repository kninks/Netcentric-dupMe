import React, { useEffect, useState } from 'react'

interface Props {
    message: string;
    running: boolean;
    onTimeout: () => void; 
}

function ReadySetGo({ message, running, onTimeout }: Props) {
    const [count, setCount] = useState(5);
    const [text, setText] = useState('Ready');

    useEffect(() => {
        if (running) {
            const interval = setInterval(() => {
                setCount((prevCount) => prevCount - 1);
            }, 1000);

            return () => {
                clearInterval(interval);
            };
        }
        
    }, [running]);

    useEffect(() => {
        if (count === 0) {
            setText('Your turn');
            onTimeout();
        } else if (count === 1) {
            setText("Go");
        } else if (count === 2) {
            setText("Set");
        } else if (count === 3) {
            setText("Ready")
        }
      }, [count]);

    return (
        <div>{text}</div>
    )
}

export default ReadySetGo