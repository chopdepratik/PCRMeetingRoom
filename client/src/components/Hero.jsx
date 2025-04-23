import { useState } from "react"
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import heroImage from "../images/hero-image.png"
import heroImage2 from "../images/hero-image2.png"
import heroImage4 from "../images/hero-image4.webp"
import rightTike from "../images/right-tike.png"
import "../components/Hero.css"

const backendUrl = import.meta.env.VITE_BACKEND
 
function Hero({isLogin}) {
    const [showForm, setShowFrom] = useState(false)
    const [joinClick, setJoinClick] = useState(false)
    const [userName, setUserName] = useState('')
    const [roomId, setRoomId] = useState('')
    const [loading, setLoading] = useState(false)
    
    const navigate = useNavigate();

    const hostMeeting = ()=>{
        if(isLogin){
            setShowFrom(true)
            {joinClick ? setJoinClick(false):''}
        }else{
            toast.error("Login first to host meeting",{
                autoClose: 3000
            })
        }
        
    }
    const joinMeeting = () => {
        if (isLogin) {
          setShowFrom(true);
          setJoinClick(true);
        } else {
           toast.error("Login first to join meeting",{
            autoClose: 3000
           })
        }
      };

    const closeForm = ()=>{
        setJoinClick(false)
        setShowFrom(false)
    }

    const changeForm = ()=>{
        {joinClick ? setJoinClick(false):setJoinClick(true)}
    }

    const submitForm = async(e) => {
        e.preventDefault();
        if(userName.trim() === ""){
            toast.error("Please write your name", {
                autoClose: 3000
            });
            return
        }

        
       if( joinClick ){
        if(roomId.trim() === ""){
            toast.error("Please write room id", {
                autoClose: 3000
            });
            return
          }
          
        }
         
    
        if (!joinClick) {
            setLoading(true)
            try {
                const response = await axios.post(`${backendUrl}/api/v2/room/createroom`, {
                    hostName: userName,
                });
                if(response.data){
                    const newRoomId = response.data.roomId; // ✅ renamed to avoid conflict
                    setLoading(false)
                    toast.success(`${response.data.message}`)
                    navigate(`/room/${newRoomId}`);
                }
                 
            } catch (error) {
                setLoading(false)
                
                console.error(error.response?.data || error.message);
            }
        } else {
            setLoading(true)
            try {
                const response = await axios.post(`${backendUrl}/api/v2/room/joinroom`, {
                    hostName: userName,
                    roomId: roomId
                });
                if(response.data?.success){ // if success false and status 404 then control go to catch block or if status 200 then go to else
                    console.log(response.data);
                    setLoading(false)
                    toast.success(`${response.data.message}`)
                    navigate(`/room/${roomId}`); // using state value directly
                }else {
                    setLoading(false)
                    toast.error('Room does not exist')  
                }
                
            } catch (error) {
                setLoading(false)
                console.error(error.response?.data || error.message);
                toast.error(error.response?.data?.message || 'Something went wrong')
            }
        }
    };
    
    return (
        <> 
        <ToastContainer />
           <div className="container">
           <div className="hero-main-container">
                <div className="info-container">
                    <h1>Welcome To Your Personal Metting Room</h1>
                    <h2>Seamless & Secure Online Meetings with PCR</h2>
                    <p className="paragraph">Connect, collaborate, and communicate effortlessly with PCR—your 
                        ultimate video  conferencing solution. Whether you're 
                        hosting a business meeting, an online class, 
                        or catching up with friends, PCR provides seamless HD video,
                         crystal-clear audio, and advanced security features to ensure a smooth 
                         and secure experience anytime, anywhere.
                    </p>
                    <div className="hero-button-container">
                        <button onClick={hostMeeting} >Host Meeting</button>
                        <button onClick={joinMeeting} >Join Meeting</button>
                    </div>
                </div>
                <div className="image-container">
                    <img src={heroImage} alt="" />
                </div>
                
            </div>

            <div className="image-container-absolute">
                    <img src={heroImage4} alt="" />
            </div>
            
            <div className="main-container2">
                <div className="image-container2">
                    <img src={heroImage2} alt="" />
                </div>

                <div className="info-container2">
                    
                    <h2>Bring Your Team Together with PCR – The Future of Online Meetings!</h2>
                    <p className="paragraph">With PCR, you can host seamless, high-quality video meetings 
                        with just one click. Whether you're working remotely, teaching a class,
                         or catching up with friends,
                         our platform provides a secure, fast, and hassle-free video conferencing
                          experience.
                    </p>
                    <ul>
                        <li><img src={rightTike} alt="" srcset="" />No Installation Required – Join meetings directly from your browser</li>
                        <li><img src={rightTike} alt="" srcset="" />Crystal-Clear HD Video & Audio – Stay connected with top quality</li>
                        <li><img src={rightTike} alt="" srcset="" />Real-Time Chat & File Sharing – Communicate effectively</li>
                        <li><img src={rightTike} alt="" srcset="" />Multi-Device Support – Access from PC, mobile, or tablet</li>
                    </ul>
                    <div className="hero-button-container2">
                        <button onClick={(e)=>joinMeeting(e)}>Start a Meeting Now</button>
                    </div>
                </div>
             </div>
            { showForm &&(<form action="" className="meetingForm">
                <span onClick={closeForm}>X</span>
                 <label htmlFor="">Enter Your Name:</label>
                 <input type="text" value={userName} onChange={(e)=>setUserName(e.target.value)} required/>
                {
                    joinClick &&(
                        <> 
                            <label htmlFor="">Enter RoomId</label>
                            <input type="text" value={roomId} onChange={(e)=>setRoomId(e.target.value)} required/>
                        </>
                    )
                }
                <p className="changeForm"  onClick={changeForm}>click here to  <i>{!joinClick ? 'join meeting':'host meeting'}</i> </p>
                <button onClick={submitForm}>Submit</button>
                {
                                loading &&(
                                    <div className="loader-container">
                                        <div className="loader">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <p>wait while loading...</p>
                                    </div>
                                )
                            }
             </form>)}
           </div>
            
        </>
    )
}

export default Hero;