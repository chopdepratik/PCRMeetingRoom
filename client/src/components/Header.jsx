import logo from "../images/logo2.png"
import "../components/Header.css"
import AuthenticationForms from '../components/AuthenticationForms.jsx'
import { useState } from "react";
function Header({scrollToFooter, scrollToAbout, isLogin , setIsLogin}) {
    const [loginClick, setLoginClick] = useState(false)
    const [registerClick, setRegisterClick] = useState(false)
    const [showNav, setShowNav] = useState(false)

    
    const loginClicked = ()=>{
        setLoginClick(true)
        setRegisterClick(false)
    }

    const registerCliked = ()=>{
        setLoginClick(false)
        setRegisterClick(true)
    }

    const logoutHandle = ()=>{
        localStorage.removeItem('token')
        setIsLogin(false)
    }
    return (
        <>  
         <div className="header-container  ">
            <div className={`hamburger-container ${showNav ? 'open':''}`} onClick={()=>setShowNav(!showNav)}>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </div>
            <div className={`responsive-header ${showNav ? 'display-flex':''} `}>
                <ul className="responsive-nav-links">
                        <li>Home</li>
                        <li onClick={scrollToAbout}>About</li>
                        <li onClick={scrollToFooter}>Contact</li>
                        {
                    isLogin? <button className="login-button" onClick={logoutHandle}>LogOut</button>
                    :
                      <button className="login-button" onClick={loginClicked}>Login</button>  
                }
                    </ul>
            </div>
            <div className="logo-container">
                <img src={logo} alt="Website Logo" className="logo" />
            </div>
            <nav>
                <ul className="nav-links">
                    <li>Home</li>
                    <li onClick={scrollToAbout}>About</li>
                    <li onClick={scrollToFooter}>Contact</li>
                     
                </ul>
            </nav>

             <div className="button-container">
                {
                    isLogin? <button className="login-button" onClick={logoutHandle}>LogOut</button>
                    :
                    <>
                        <button className="login-button" onClick={registerCliked}>Register</button>
                        <button className="login-button" onClick={loginClicked}>Login</button>
                    </>
                     
                }
                
             </div>
         </div>
         <AuthenticationForms loginClick = {loginClick} setLoginClick = {setLoginClick} registerClick = {registerClick} setRegisterClick = {setRegisterClick} setIsLogin= {setIsLogin}/>
        </>
        
    );
}

export default Header;
