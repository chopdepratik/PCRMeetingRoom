import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
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
  const [remoteUser, setRemoteUser] = useState('');
  const localStream = useRef(null);
  const remoteStream = useRef(new MediaStream()); // Initialize remote stream
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const pc = useRef(null);
  const [isFriendMaximized, setIsFriendMaximized] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isRemoteVideoOn, setIsRemoteVideoOn] = useState(false);
  const [host, setHost] = useState({});
  const [currentUser] = useState(user);
  const [otherUserData, setOtherUserData] = useState({});
  const [meetStarted, setMeetStarted] = useState(false);

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
    }
  };

  useEffect(() => {
    getHost();
  }, []);

  useEffect(() => {
    const handleUserJoined = ({ userId, otherUser }) => {
      setRemoteUser(userId);
      setOtherUserData(otherUser);
      toast.info(`${otherUser.firstName} joined the room`);
    };

    socket.emit('user-join', { roomId, currentUser });
    socket.on('user-joined', handleUserJoined);

    // Initialize media
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        localStream.current = stream;
        localVideo.current.srcObject = stream;

        pc.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // Add local tracks
        stream.getTracks().forEach(track => {
          pc.current.addTrack(track, stream);
        });

        // Set remote video source
        remoteVideo.current.srcObject = remoteStream.current;

        pc.current.ontrack = (event) => {
          // Add incoming tracks to remote stream
          event.streams[0].getTracks().forEach(track => {
            remoteStream.current.addTrack(track);
          });

          // Check video status
          const videoTrack = remoteStream.current.getVideoTracks()[0];
          setIsRemoteVideoOn(!!videoTrack?.enabled);

          if (videoTrack) {
            videoTrack.onmute = () => setIsRemoteVideoOn(false);
            videoTrack.onunmute = () => setIsRemoteVideoOn(true);
          }

          if (!meetStarted) {
            setMeetStarted(true);
            toast.success("Meet started successfully");
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

      } catch (err) {
        console.error("Media device error:", err);
        toast.error("Could not access camera/microphone");
      }
    };

    initializeMedia();

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
      setRemoteUser(from);
      try {
        await pc.current.setRemoteDescription(offer);
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);
        socket.emit('send-answer', { answer, to: from });
        setMeetStarted(true);
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socket.on('receive-answer', async ({ answer }) => {
      try {
        await pc.current.setRemoteDescription(answer);
        setMeetStarted(true);
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    });

    socket.on('leavedRoom', ({ userName }) => {
      toast.info(`${userName} left the meet`);
      setRemoteUser('');
      setOtherUserData({});
      setMeetStarted(false);
    });

    socket.on('meetingEnded', () => {
      alert("The meeting has been ended by the host.");
      window.location.href = '/';
    });

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      if (remoteStream.current) {
        remoteStream.current.getTracks().forEach(track => track.stop());
      }
      if (pc.current) {
        pc.current.close();
      }
      socket.off('user-joined');
      socket.off('receive-ice-candidate');
      socket.off('receive-offer');
      socket.off('receive-answer');
      socket.off('leavedRoom');
      socket.off('meetingEnded');
    };
  }, [roomId, remoteUser]);

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

  const toggleVideo = () => {
    const track = localStream.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoOn(track.enabled);
    }
  };

  const toggleAudio = () => {
    const track = localStream.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioOn(track.enabled);
    }
  };

  const leaveMeet = () => {
    socket.emit('leaveRoom', { roomId, userName: currentUser.firstName });
    toast.success("Left Meet Successfully", { autoClose: 3000 });
    setTimeout(() => window.location.href = '/', 3000);
  };

  const endMeet = () => {
    socket.emit('endMeeting', { roomId });
  };

  return (
    <div className="call-container">
      {host._id === currentUser._id && (
        <>
          <p style={{ margin: '0px' }}>RoomId: {roomId}</p>
          <i>copy and send to other user</i>
        </>
      )}

      <div className="video-section">
        <div className={`video-box local-video ${isFriendMaximized ? 'minimized' : ''}`}>
          <video
            ref={localVideo}
            autoPlay
            playsInline
            muted
            style={{ display: isVideoOn ? 'block' : 'none' }}
          />
          {!isVideoOn && (
            <div className="userImg-container">
              <img src={userImg} alt="User avatar" className="userImg" />
            </div>
          )}
          <div className="name-container">
            <p>You</p>
            <div className="audio-video-toggle">
              <div className="sub-audio-video-toggle">
                <button onClick={toggleVideo}>
                  {isVideoOn ? <img src={videoImg} alt="Video on" /> : <img src={noVideoImg} alt="Video off" />}
                </button>
                <button onClick={toggleAudio}>
                  {isAudioOn ? <img src={micImg} alt="Mic on" /> : <img src={noMicImg} alt="Mic off" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={`video-box remote-video ${isFriendMaximized ? 'maximized' : ''}`}>
          {isRemoteVideoOn ? (
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              className="remote-video"
            />
          ) : (
            <div className="userImg-container">
              <img src={userImg} alt="User avatar" className="userImg" />
            </div>
          )}
          <div className="name-container">
            <p>{otherUserData?.firstName || 'User'}</p>
            <button onClick={() => setIsFriendMaximized(!isFriendMaximized)}>
              {isFriendMaximized ? '[ ]' : '[  ]'}
            </button>
          </div>
        </div>
      </div>

      <div className="controls">
        {host._id === currentUser._id ? (
          remoteUser ? (
            !meetStarted && (
              <button className="control-button start-button" onClick={startCall}>
                Start Meet
              </button>
            )
          ) : (
            !meetStarted && <p className="status-message">Waiting for other user to join...</p>
          )
        ) : (
          !meetStarted && <p className="status-message">Waiting for host to start the meet...</p>
        )}

        {meetStarted && (
          <div className="meet-controls">
            <button className="control-button" onClick={toggleVideo}>
              {isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
            </button>
            <button className="control-button" onClick={toggleAudio}>
              {isAudioOn ? 'Mute' : 'Unmute'}
            </button>
            {host._id === currentUser._id ? (
              <button className="control-button end-button" onClick={endMeet}>
                End Meeting
              </button>
            ) : (
              <button className="control-button leave-button" onClick={leaveMeet}>
                Leave Meeting
              </button>
            )}
          </div>
        )}

        {!meetStarted && (
          <button className="control-button leave-button" onClick={leaveMeet}>
            Leave Room
          </button>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default VideoCall;