import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import io from "socket.io-client";
import '../components/VideoCall.css'
 
const backendUrl = import.meta.env.VITE_BACKEND
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
  <div className="video-section">
    <div className="video-box local-video">
      <video ref={localVideo} autoPlay playsInline muted />
      <p>You</p>
    </div>
    <div className="video-box remote-video">
      <video ref={remoteVideo} autoPlay playsInline />
      <p>Friend</p>
    </div>
  </div>

  <div className="chat-section">
    <div className="messages">
      {/* Replace with actual messages */}
      <p className="message sender">Hi!</p>
      <p className="message receiver">Hey there!</p>
    </div>
    <div className="chat-input">
      <input type="text" placeholder="Type your message..." />
      <button>Send</button>
    </div>
  </div>

  <div className="controls">
    <button onClick={startCall}>Start Meet</button>
    <button>End Meet</button>
  </div>
</div>

  );
};

export default VideoCall;
