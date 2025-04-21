import { forwardRef } from "react";
import "../components/About.css";
import features from "./feature.js";
import visionMissionData from "./visionMissionData.js";
import whyChooseUs from "./whyChooseUs.js";
const About = forwardRef((props,ref)=>{
    return(
        <>
            <div className="about-main-container" ref={ref}>
                <h2>About Us</h2>
                <div className="about-container">
                    <p>PCR Meet is a secure and seamless online meeting platform designed to enhance 
                        virtual collaboration for individuals, businesses, and educational institutions. 
                        Whether you're hosting a team meeting, conducting an online class, or catching up
                         with friends and family, PCR Meet provides high-quality video and audio conferencing
                          with advanced features. Our platform ensures a smooth and uninterrupted experience 
                          with low bandwidth consumption, instant meeting links, and secure communication, making
                           virtual interactions more efficient and productive."Let me know if you'd like any refinements
                    </p>
                    <h2 style={{textAlign:'start'}}>Features</h2>
                    <div className="card-container">
                       
                        {features.map((data)=>{
                            return(
                                <div className="about-card" key={data.id}>
                                        <h2>{data.title}</h2>
                                        <p>{data.description}</p>
                                            <ul>
                                            {data.keyBenefits.map((benifit,i)=>{
                                                return <li  key={i}>{benifit}</li>
                                            })}
                                        </ul>
                                         
                                </div>
                            )
                        })}
                    </div>
                    <h2 style={{textAlign:'start', marginTop:'20px'}}>  Why Choose PCR Meet?  </h2>
                    <div className="card-container">
                    {whyChooseUs.map((data)=>{
                            return(
                                <div className="about-card" key={data.id}>
                                        <h2><span>{data.icon}</span>{data.title}</h2>
                                        <p>{data.description}</p>
                                            <ul>
                                            {data.benefits.map((benifit,i)=>{
                                                return <li key={i}>{benifit}</li>
                                            })}
                                        </ul>
                                         
                                </div>
                            )
                        })}
                    </div>

                    <h2 style={{textAlign:'start', marginTop:'20px'}}>  Vision & Mission for PCR Meet </h2>
                    <div className="visi-card-container">
                    {visionMissionData.map((data)=>{
                            return(
                                <div className="visi-card" key={data.id}>
                                        <h2><span>{data.icon}</span>{data.title}</h2>
                                        <p>{data.description}</p>
                                            <ul>
                                            {data.keyPoints.map((benifit,i)=>{
                                                return <li  key={i}>{benifit}</li>
                                            })}
                                        </ul>
                                         
                                </div>
                            )
                        })}
                    </div>
                    
                </div>

            </div>
            
        </>
    )

})

export default About;