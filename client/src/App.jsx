import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Review from "./components/Review.jsx";
import Footer from "./components/Footer.jsx";
import About from "./components/About.jsx"
import VideoCall from '../src/components/VideoCall.jsx'
import axios from "axios";


function App() {
  const footerRef = useRef(null);
  const aboutRef = useRef(null);
  const [isLogin, setIsLogin] = useState(false)

  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLogin(false);
          return;
        }
  
        const response = await axios.get("http://localhost:5000/api/v1/user/isloginuser", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log("Login check response:", response.data);
        setIsLogin(response.data?.islogin || false);
      } catch (err) {
        console.error("Error checking login:", err.message);
        setIsLogin(false);
      }
    };
    
    checkLogin();


  }, []);
  
  

  

  return (
    <Router>
        <VideoCall />
        {/* <Routes>
          <Route  path="/" element={
            <>
              <Header scrollToFooter={scrollToFooter}  scrollToAbout={scrollToAbout} isLogin= {isLogin} setIsLogin={(value)=>setIsLogin(value)}/>
              <Hero isLogin= {isLogin} />
              <About  ref={aboutRef}/>
              <Review />
              <Footer ref={footerRef} />
            </>
              
            }/>
          <Route  path="/room/:roomId" element={<VideoCall/>}/>
        </Routes> */}
    </Router>
     
      


     
  );
}

export default App;
