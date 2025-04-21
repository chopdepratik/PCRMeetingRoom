import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import io from "socket.io-client";

 
const backendUrl = import.meta.env.BACKEND
const socket = io(backendUrl);
 

const VideoCall = () => {
  const { roomId } = useParams();
  const [remoteUser, setRemoteUser] = useState('');
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const pc = useRef(null);

  useEffect(() => {
    socket.emit('user-join', { roomId });

    socket.on('user-joined', ({ userId }) => {
      setRemoteUser(userId);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideo.current.srcObject = stream;

        pc.current = new RTCPeerConnection();

        stream.getTracks().forEach((track) => {
          pc.current.addTrack(track, stream);
        });

        pc.current.ontrack = (event) => {
          remoteVideo.current.srcObject = event.streams[0];
        };

        pc.current.onicecandidate = (event) => {
          if (event.candidate && remoteUser) {
            socket.emit('send-ice-candidate', {
              candidate: event.candidate,
              to: remoteUser
            });
          }
        };
      });

    socket.on('receive-ice-candidate', async ({ candidate }) => {
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    });

    socket.on('receive-offer', async ({ offer, from }) => {
      setRemoteUser(from);
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      socket.emit('send-answer', { answer, to: from });
    });

    socket.on('receive-answer', async ({ answer }) => {
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

  }, [remoteUser, roomId]);

  const startCall = async () => {
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socket.emit('send-offer', { offer, to: remoteUser });
  };

  return (
    <div className="call-container">
      <div className="local-call">
        <video ref={localVideo} autoPlay playsInline muted />
      </div>
      <div className="remote-call">
        <video ref={remoteVideo} autoPlay playsInline />
      </div>
      <button onClick={startCall}>Start Call</button>
    </div>
  );
};

export default VideoCall;
