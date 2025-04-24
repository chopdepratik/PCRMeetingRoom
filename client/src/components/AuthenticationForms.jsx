import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import "../components/AuthenticationForms.css"
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function AuthenticationForms ({loginClick, setLoginClick, registerClick, setRegisterClick , setIsLogin}){
    
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [showPasswordError, setShowPasswordError] = useState(false)
    const [loginShow, setLoginShow] = useState(loginClick)
    const [registerShow, setRegisterShow] = useState(registerClick)
    const [formData, setFormData] = useState({
        firstName:'',
        lastName:'',
        email:'',
        password:'',
        cpassword:''
    })

    const backendUrl = import.meta.env.VITE_BACKEND
    useEffect(() => {
        setLoginShow(loginClick);
        setRegisterShow(registerClick)
    }, [loginClick,registerClick]);

    const handleRegister = async()=>{
        setLoading(true)

        const {firstName, lastName,email,password,cpassword} = formData
        
        setShowPasswordError(false)
        if(password !== cpassword){
            setShowPasswordError(true)
            return
        }
        try {
            const response = await axios.post(`${backendUrl}/api/v1/user/registeruser`,{
                firstName,
                lastName,
                email,
                password
            })

            if(response.data?.success){
                setLoading(false)
                setShowPasswordError(false)
                toast.success("Register Successfully",{
                    autoClose: 3000
                })
                setRegisterClick(false)
                setLoginClick(true)
            }
            setLoading(false)

        } catch (err) {
             setLoading(false)
             if(err.response.data?.success){
                toast.info("User exist with Email Id")
             }
            console.log('error',err.message)
        }
    }

    const handleLogin = async()=>{
        setShowPasswordError(false)
        setLoading(true)
        try {
            const {email, password} = formData
            
            const response = await axios.post(`${backendUrl}/api/v1/user/loginuser`,{
                email,
                password
            })
            console.log(response)
            if(response.data?.success){
                setLoading(false)
                toast.success("Logged in successfully",{
                    autoClose: 3000
                })
                setRegisterClick(false)
                setLoginClick(false)
                localStorage.setItem('token', response.data.token)
                setIsLogin(true)
                navigate('/')
            }
            setShowPasswordError(true)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.info(error.response.data?.message || "Something went Wrong!")
            console.log("error while login: ",error.message)
        }

    }
    return(
        <>
        <ToastContainer />
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
                                <label htmlFor="">email</label>
                                <input 
                                  type="email" 
                                  name="email"
                                  value={formData.email}
                                  onChange={(e)=>setFormData({...formData, email:e.target.value})}
                                  placeholder="enter email"/>
                            </div>
                            <div className="password-container">
                                <label htmlFor="">Password</label>
                                <input 
                                  type="password" 
                                  name="password"
                                  value={formData.password}
                                  onChange={(e)=>setFormData({...formData, password:e.target.value})}
                                  placeholder="enter password" />
                            </div>
                            <button className="login-button" onClick={handleLogin}>Login</button>
                            {showPasswordError ? <p>Email or Password does not match</p>:''}
                            <p>don't have account ? <i style= {{color:'blue'}} onClick={()=>{
                                setRegisterClick(true)
                                setLoginClick(false)
                            }}>Register</i></p>
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
                                <input
                                  type="text" 
                                  name="firstName"
                                  value={formData.firstName}
                                  onChange={(e)=>setFormData({...formData, firstName:e.target.value})}
                                  placeholder="e.g John "/>
                            </div>

                            <div className="lastname-container">
                                <label htmlFor="">Last Name</label>
                                <input 
                                  type="text"
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={(e)=>setFormData({...formData, lastName:e.target.value})}
                                  placeholder="e.g Doe"/>
                            </div>

                            <div className="email-container">
                                <label htmlFor="">Email</label>
                                <input 
                                  type="email" 
                                  name="email"
                                  value={formData.email}
                                  onChange={(e)=>setFormData({...formData, email:e.target.value})}
                                  placeholder="e.g johndoe@gmail.com"/>
                            </div>

                            <div className="password-container">
                                <label htmlFor="">Password</label>
                                <input 
                                  type="password" 
                                  name="password"
                                  value={formData.password}
                                  onChange={(e)=>setFormData({...formData, password:e.target.value})}
                                  placeholder="e.g Pass@123"/>
                            </div>

                            <div className="cpassword-container">
                                <label htmlFor="">Confirm Password</label>
                                <input 
                                  type="password" 
                                  name="cpassword"
                                  value={formData.cpassword}
                                  onChange={(e)=>setFormData({...formData, cpassword:e.target.value})}
                                  placeholder=".g Pass@123"/>
                            </div>
                            <button className="register-button" onClick={handleRegister}>Register</button>
                             {showPasswordError ? <p>Password does not match</p>:''}
                            <p>Already have account ? <i onClick={()=>{
                                setRegisterClick(false)
                                setLoginClick(true)
                            }} style= {{color:'blue'}}>Login</i></p>

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