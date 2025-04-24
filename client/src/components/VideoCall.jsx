import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from "socket.io-client";
import '../components/VideoCall.css';
import videoImg from '../images/video-camera.png';
import noVideoImg from '../images/no-video.png';
import micImg from '../images/recorder-microphone.png';
import noMicImg from '../images/mute.png';
import userImg from '../images/user.png';
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND;
const socket = io(backendUrl);

const VideoCall = ({ user }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [remoteUser, setRemoteUser] = useState(null);
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const pc = useRef(null);
  const [isFriendMaximized, setIsFriendMaximized] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isRemoteVideoOn, setIsRemoteVideoOn] = useState(false);
  const [host, setHost] = useState(null);
  const [currentUser] = useState(user);
  const [otherUserData, setOtherUserData] = useState(null);
  const [meetStarted, setMeetStarted] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  // Fetch host information
  const getHost = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/v2/room/gethost`, {
        roomId: roomId
      });
      if (response.data?.success) {
        setHost(response.data.host.hostName);
      }
    } catch (error) {
      console.error("Error fetching host:", error);
      toast.error("Failed to fetch room information");
    }
  };

  // Initialize media streams and WebRTC connection
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStream.current = stream;
      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

      // Initialize peer connection
      pc.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.current.addTrack(track, stream);
      });

      // Set up event handlers
      pc.current.ontrack = (event) => {
        remoteStream.current = event.streams[0];
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = event.streams[0];
        }
        setIsRemoteVideoOn(true);
        setMeetStarted(true);
        toast.success("Meet started successfully");

        const videoTrack = event.streams[0]?.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onmute = () => setIsRemoteVideoOn(false);
          videoTrack.onunmute = () => setIsRemoteVideoOn(true);
        }
      };

      pc.current.onicecandidate = (event) => {
        if (event.candidate && remoteUser) {
          socket.emit('send-ice-candidate', {
            candidate: event.candidate,
            to: remoteUser
          });
        }
      };

      pc.current.oniceconnectionstatechange = () => {
        if (pc.current.iceConnectionState === 'disconnected') {
          toast.info("Connection lost");
        }
      };

    } catch (err) {
      console.error("Media device error:", err);
      setMediaError("Could not access camera/microphone");
      toast.error("Camera/microphone access denied");
    }
  };

  // Clean up resources
  const cleanup = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
  };

  // Start the call
  const startCall = async () => {
    try {
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      socket.emit('send-offer', { offer, to: remoteUser });
      setMeetStarted(true);
    } catch (err) {
      console.error("Error starting call:", err);
      toast.error("Failed to start call");
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream.current) {
      const track = localStream.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoOn(track.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream.current) {
      const track = localStream.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsAudioOn(track.enabled);
      }
    }
  };

  // Leave the meeting
  const leaveMeet = () => {
    cleanup();
    socket.emit('leaveRoom', {
      roomId,
      userName: currentUser.firstName
    });
    toast.success("Left Meet Successfully", { autoClose: 2000 });
    setTimeout(() => navigate('/'), 2000);
  };

  // End the meeting (host only)
  const endMeet = () => {
    cleanup();
    socket.emit('endMeeting', { roomId });
    toast.success("Meeting ended", { autoClose: 2000 });
    setTimeout(() => navigate('/'), 2000);
  };

  useEffect(() => {
    getHost();
    initializeMedia();

    const handleUserJoined = ({ userId, otherUser }) => {
      setRemoteUser(userId);
      setOtherUserData(otherUser);
      setMeetStarted(false);
      toast.info(`${otherUser.firstName} joined the room`);
    };

    socket.emit('user-join', { roomId, currentUser });

    // Socket event handlers
    socket.on('user-joined', handleUserJoined);
    socket.on('receive-ice-candidate', async ({ candidate }) => {
      try {
        if (pc.current && candidate) {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    });

    socket.on('receive-offer', async ({ offer, from }) => {
      if (!pc.current) return;
      
      setRemoteUser(from);
      try {
        await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);
        socket.emit('send-answer', { answer, to: from });
        setMeetStarted(true);
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socket.on('receive-answer', async ({ answer }) => {
      if (pc.current) {
        try {
          await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
          setMeetStarted(true);
        } catch (err) {
          console.error("Error handling answer:", err);
        }
      }
    });

    socket.on('leavedRoom', ({ userName }) => {
      toast.info(`${userName} left the meet`);
      setRemoteUser(null);
      setOtherUserData(null);
      setMeetStarted(false);
      cleanup();
    });

    socket.on('meetingEnded', () => {
      toast.info("The meeting has been ended by the host");
      cleanup();
      navigate('/');
    });

    const handleBeforeUnload = () => leaveMeet();

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      cleanup();
      socket.off('user-joined', handleUserJoined);
      socket.off('receive-ice-candidate');
      socket.off('receive-offer');
      socket.off('receive-answer');
      socket.off('leavedRoom');
      socket.off('meetingEnded');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId, currentUser, navigate]);

  return (
    <div className="call-container">
      {host?._id === currentUser._id && (
        <div className="room-info">
          <p>Room ID: {roomId}</p>
          <small>Copy and send to other user</small>
        </div>
      )}
      
      <div className="video-section">
        {/* Local Video */}
        <div className={`video-box local-video ${isFriendMaximized ? 'minimized' : ''}`}>
          {isVideoOn ? (
            <video ref={localVideo} autoPlay playsInline muted />
          ) : (
            <div className="userImg-container">
              <img src={userImg} alt="User avatar" className="userImg" />
            </div>
          )}
          
          <div className="name-container">
            <p>You</p>
            <div className="audio-video-toggle">
              <div className="sub-audio-video-toggle">
                <button onClick={toggleVideo} aria-label="Toggle video">
                  {isVideoOn ? (
                    <img src={videoImg} alt="Video on" />
                  ) : (
                    <img src={noVideoImg} alt="Video off" />
                  )}
                </button>
                <button onClick={toggleAudio} aria-label="Toggle audio">
                  {isAudioOn ? (
                    <img src={micImg} alt="Microphone on" />
                  ) : (
                    <img src={noMicImg} alt="Microphone off" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Remote Video */}
        <div className={`video-box remote-video ${isFriendMaximized ? 'maximized' : ''}`}>
          {isRemoteVideoOn && remoteStream.current ? (
            <video ref={remoteVideo} autoPlay playsInline className="remote-video" />
          ) : (
            <div className="userImg-container">
              <img src={userImg} alt="User avatar" className="userImg" />
              {otherUserData?.firstName && (
                <div className="user-name-overlay">{otherUserData.firstName}</div>
              )}
            </div>
          )}
          
          <div className="name-container">
            <p>{otherUserData?.firstName || 'Connecting...'}</p>
            <button 
              onClick={() => setIsFriendMaximized(!isFriendMaximized)}
              className="toggle-size-btn"
            >
              {isFriendMaximized ? '[ ]' : '[  ]'}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        {mediaError && <p className="error-message">{mediaError}</p>}
        
        {host?._id === currentUser._id ? (
          remoteUser ? (
            !meetStarted && (
              <button onClick={startCall} className="start-call-btn">
                Start Meet
              </button>
            )
          ) : (
            !meetStarted && <p>Waiting for other user to join...</p>
          )
        ) : (
          !meetStarted && <p>Waiting for host to start the meet...</p>
        )}

        {meetStarted ? (
          host?._id === currentUser._id ? (
            <button onClick={endMeet} className="end-call-btn">
              End Room
            </button>
          ) : (
            <button onClick={leaveMeet} className="leave-call-btn">
              Leave Meet
            </button>
          )
        ) : (
          <button onClick={leaveMeet} className="leave-room-btn">
            Leave Room
          </button>
        )}
      </div>
      
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default VideoCall;