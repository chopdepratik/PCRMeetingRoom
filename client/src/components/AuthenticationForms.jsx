import { useState } from "react";
import "../components/AuthenticationForms.css"
import { useEffect } from "react";
function AuthenticationForms ({loginClick, setLoginClick, registerClick, setRegisterClick }){
 
    const [loginShow, setLoginShow] = useState(loginClick)
    const [registerShow, setRegisterShow] = useState(registerClick)
    useEffect(() => {
        setLoginShow(loginClick);
        setRegisterShow(registerClick)
    }, [loginClick,registerClick]);
    return(
        <>
             <div className="forms-container">
                <div 
                    className={`main-container ${loginShow || registerShow ? "display-flex" : ""}`} 
                    onClick={(e) => {
                        if (e.target.classList.contains("main-container")) {
                            setLoginClick(false);
                            setRegisterClick(false);
                        }
                    }}
                 >


                    {loginShow ? (
                            <div className="login-container">
                            <span className="close-form" onClick={()=>{
                                setRegisterClick(false)
                                setLoginClick(false)
                            }} >X</span>
                            <h2>Login Form</h2>
                            <div className="username-container">
                                <label htmlFor="">Username</label>
                                <input type="text" placeholder="enter username"/>
                            </div>
                            <div className="password-container">
                                <label htmlFor="">Password</label>
                                <input type="text" placeholder="enter password" />
                            </div>
                            <button className="login-button">Login</button>
                            <p>don't have account ? <i style= {{color:'blue'}} onClick={()=>{
                                setRegisterClick(true)
                                setLoginClick(false)
                            }}>Register</i></p>

                           </div>
                             
                    )
                    :
                    registerShow?
                    (
                        <div className="register-container">
                            <span className="close-form" onClick={()=>{
                                setRegisterClick(false)
                                setLoginClick(false)
                            }} >X</span>
                            <h2>Registration Form</h2>
                            <div className="firstname-container">
                                <label htmlFor="">First Name</label>
                                <input type="text" placeholder="e.g John "/>
                            </div>

                            <div className="lastname-container">
                                <label htmlFor="">Last Name</label>
                                <input type="text" placeholder="e.g Doe"/>
                            </div>

                            <div className="email-container">
                                <label htmlFor="">Email</label>
                                <input type="email" placeholder="e.g johndoe@gmail.com"/>
                            </div>

                            <div className="password-container">
                                <label htmlFor="">Password</label>
                                <input type="text" enterKeyHint="e.g Pass@123"/>
                            </div>

                            <div className="cpassword-container">
                                <label htmlFor="">Confirm Password</label>
                                <input type="text" enterKeyHint=".g Pass@123"/>
                            </div>
                            <button className="register-button">Register</button>
                            <p>Already have account ? <i onClick={()=>{
                                setRegisterClick(false)
                                setLoginClick(true)
                            }} style= {{color:'blue'}}>Login</i></p>
                    </div>
                    )
                    :
                    ''
                }
                </div>
             </div>
        </>
    )
}

export default AuthenticationForms;