import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import io from "socket.io-client";
import '../components/VideoCall.css'
import videoImg from '../images/video-camera.png'
import noVideoImg from '../images/no-video.png'
import micImg from '../images/recorder-microphone.png'
import noMicImg from '../images/mute.png'
import userImg from '../images/user.png'
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND
const socket = io(backendUrl);
 

const VideoCall = ({user}) => {
  const { roomId } = useParams();
  const [remoteUser, setRemoteUser] = useState('');
  const localStream = useRef(null)
  const remoteStream = useRef(null)
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const pc = useRef(null);
  const [isFriendMaximized, setIsFriendMaximized] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isRemoteVideoOn, setIsRemoteVideoOn] = useState(false);
  const [host, setHost] = useState({})
  const [currectUser, setCurrentUser] = useState(user)
  const [otherUserData, setOtherUserData] = useState({})
  const [meetStarted, setMeetStarted] = useState(false)

  const getHost = async()=>{
     
    try {
      const response = await axios.post(`${backendUrl}/api/v2/room/gethost`,{
        roomId:roomId
      });
       
      if(response.data?.success){
        setHost(response.data.host.hostName)
      }
    } catch (error) {
      console.log("from videoCall", error)
      console.error("error: ",error.message)
    }
  }

  useEffect(()=>{
    getHost()
  },[])

  useEffect(() => {
    socket.emit('user-join', { roomId,currectUser });

    socket.on('user-joined', ({ userId ,otherUser}) => {
      setRemoteUser(userId);
      setOtherUserData(otherUser)
      setMeetStarted(false)
      toast.info(`${otherUser.firstName} joined the room`);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream.current = stream
        localVideo.current.srcObject = stream;

        pc.current = new RTCPeerConnection();

        stream.getTracks().forEach((track) => {
          pc.current.addTrack(track, stream);
        });

        pc.current.ontrack = (event) => {
          remoteStream.current = event.streams[0];
          toast.success("Meet started succesfully")
          remoteVideo.current.srcObject = event.streams[0];
          setIsRemoteVideoOn(true);
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

    socket.on("toogle-Video",({enabled})=>setIsRemoteVideoOn(enabled))

    socket.on('leavedRoom',({userName})=>{
      setRemoteUser('');
      setOtherUserData({})
      setIsRemoteVideoOn(false);
      setMeetStarted(false)
      toast.info(`${userName} leaved the Meet`)
    })

    socket.on('meetingEnded', () => {
      alert("The meeting has been ended by the host.");
      // Navigate away or close the meeting UI
      window.location.href = '/'; // or any route


      const handleBeforeUnload = () => {
        host._id === currectUser._id ? socket.emit('endMeeting',{roomId})
         :
        socket.emit('leaveRoom', {
          roomId,
          userName: currectUser.firstName
        });
      };
    
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handleBeforeUnload);
    });
    return () => {
      socket.off('user-joined');
      socket.off('receive-ice-candidate');
      socket.off('receive-offer');
      socket.off('receive-answer');
      socket.off('peer-toggled-video');   // or "toogle-Video", whichever you choose
      socket.off('leavedRoom');
      socket.off('meetingEnded');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleBeforeUnload);
    };

  }, [remoteUser, roomId]);

  const startCall = async () => {
    setMeetStarted(true)
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socket.emit('send-offer', { offer, to: remoteUser });
  };

  const toggleVideo = ()=>{
     const track = localStream.current.getVideoTracks()[0];
      if( track){
        track.enabled = !track.enabled
        setIsVideoOn((prev)=>!prev)
      }

      socket.emit("peer-toggled-video", {
        to: remoteUser,
        enabled: track.enabled
      });
  }

  const toggleAudio = ()=>{
    const track = localStream.current.getAudioTracks()[0];
     if( track){
       track.enabled = !track.enabled
       setIsAudioOn((prev)=>!prev)
     }
 }

 const leaveMeet = ()=>{
  socket.emit('leaveRoom', {
    roomId,
    userName: currectUser.firstName // or correctUser['firstName'] if needed
  });

  setTimeout(()=>{
    window.location.href = '/';
  } ,2000)
  toast.success("Leaved Meet Successfully",{
    autoClose:2000
  })
  
 }

 const endMeet = ()=>{
  socket.emit('endMeeting',{roomId})
 }
 
 
 

  return (
    <div className="call-container">
      {
          host._id === currectUser._id ? <>
            <p style={{margin:'0px'}}>RoomId : {roomId}</p>
            <i >copy and send to other user</i>
          </> : ''
      }
       
  <div className="video-section">
    <div className={`video-box local-video ${isFriendMaximized ? 'minimized' : ''}`}>
    <video
    ref={localVideo}
    autoPlay
    playsInline
    muted
    style={{ display: isVideoOn ? 'block' : 'none' }}
  />
  {!isVideoOn && 
         <div className="userImg-container">
             <img src={userImg} alt="User avatar" className="userImg" />
         </div>
  }
  
       
      <div className="name-container">
        <p>You</p>
        <div className="audio-video-toggle">
          <div className="sub-audio-video-toggle">
          <p onClick={toggleVideo}>
            {
              isVideoOn ? <img src={videoImg} alt=""  />
              : <img src={noVideoImg} alt=""  />
            } 
           </p> 
          <p onClick={toggleAudio}>
            {
              isAudioOn ? <img src={micImg} alt=""  />
              : <img src={noMicImg} alt=""  />
            } 
          </p>
          </div>


        </div>
      </div>
    </div>
    <div className={`video-box remote-video ${isFriendMaximized ? 'maximized' : ''}`}>
    <video
    ref={remoteVideo}
    autoPlay
    playsInline
    
    style={{ display: isRemoteVideoOn ? 'block' : 'none' }}
  />
  {!isRemoteVideoOn && 
         <div className="userImg-container">
             <img src={userImg} alt="User avatar" className="userImg" />
         </div>
  }
       <div className="name-container">
        <p>{otherUserData?.firstName || 'Connecting..'}</p>
        <p onClick={() => setIsFriendMaximized(!isFriendMaximized)} >[   ]</p> 
       </div>
    </div>
  </div>

  {/* <div className="chat-section">
    <div className="messages">
      
      <p className="message sender">Hi!</p>
      <p className="message receiver">Hey there!</p>
    </div>
    <div className="chat-input">
      <input type="text" placeholder="Type your message..." />
      <button>Send</button>
    </div>
  </div> */}

<div className="controls">
  {/* Primary action: Start / End / Waiting messages */}
  {host._id === currectUser._id ? (
    // ─── I am the host ───────────────────────────────────────
    remoteUser ? (
      // Other user is in the room
      meetStarted ? (
        <button onClick={endMeet}>End Meet</button>
      ) : (
        <button onClick={startCall}>Start Meet</button>
      )
    ) : (
      // Waiting for the other user to join
      <p>Waiting for other user to join…</p>
    )
  ) : (
    // ─── I’m a participant ───────────────────────────────────
    meetStarted ? (
      <button onClick={leaveMeet}>Leave Meet</button>
    ) : (
      <p>Waiting for host to start the meet…</p>
    )
  )}

  {/* Secondary action: Always allow leaving before the meeting starts */}
  {!meetStarted && (
    <button onClick={leaveMeet}>Leave Room</button>
  )}
</div>

  <ToastContainer  preventDuplicates />
</div>

  );
};

export default VideoCall;
