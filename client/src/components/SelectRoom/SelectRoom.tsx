import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import socket from '../../socket';
import './SelectRoom.css'

function SelectRoom() {
    const [rooms, setRooms] = useState<{ roomId: string, round: number, players: number }[]>([]);
    const [alertOpen, setAlertOpen] = useState(false);

    const navigate = useNavigate();

    const handleJoin = (item: string) => {
        const roomFound = rooms.find(room => room.roomId === item);
        if (roomFound) {
            if (roomFound.players < 2) {
                socket.emit('join_room', item);
                navigate('/room');
            } else {
                setAlertOpen(true);
            }
        }
    };

    const handleAlertClose = () => {
        setAlertOpen(false);
      };

    useEffect(() => {
        socket.on('rooms', (data) => {
            setRooms(data);
        });

    }, [socket]);

    return (<>
        <h2>Join room</h2>
        <div className="room-container">
            {rooms.map((item) => (
                <div
                    key={item.roomId}
                    onClick={() => {handleJoin(item.roomId);}}
                >
                    <div>{item.roomId}</div>
                    <div>{item.players} players</div>
                </div>
            ))}
        </div>
        {alertOpen && (
        <div className="alert-container">
          <div className="alert">
            <p>This room is already full. Please choose another room.</p>
            <button onClick={handleAlertClose}>OK</button>
          </div>
        </div>
      )}
    </>)
}

export default SelectRoom