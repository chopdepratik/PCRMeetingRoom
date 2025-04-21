import { useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Review from "./components/Review.jsx";
import Footer from "./components/Footer.jsx";
import About from "./components/About.jsx"
import VideoCall from '../src/components/VideoCall.jsx'


function App() {
  const footerRef = useRef(null);
  const aboutRef = useRef(null);

  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Router>
        
        <Routes>
          <Route  path="/" element={
            <>
              <Header scrollToFooter={scrollToFooter}  scrollToAbout={scrollToAbout}/>
              <Hero />
              <About  ref={aboutRef}/>
              <Review />
              <Footer ref={footerRef} />
            </>
              
            }/>
          <Route  path="/room/:roomId" element={<VideoCall/>}/>
        </Routes>
    </Router>
     
      


     
  );
}

export default App;
