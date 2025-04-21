import { forwardRef } from "react";
import "../components/Footer.css";

const Footer = forwardRef((props, ref) => {
  return (
    <>
      <div className="footer-main-container" ref={ref}>
        <h1>Connect. Collaborate. Communicate – Anytime, Anywhere with PCR Meet!</h1>
        <p className="footer-about">
          PCR is a secure and seamless online meeting platform designed to enhance virtual
          collaboration. Whether for work, education, or personal meetings,
          PCR provides high-quality video and audio conferencing with powerful features.
        </p>

        <div className="quick-links-container">
          <div className="quick-links">
            <h4>Quick Links</h4>
            <ul className="footer-ul">
              <li>Features</li>
              <li>Pricing</li>
              <li>FAQs</li>
              <li>Support</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div className="contact-us">
            <h4>Contact Us</h4>
            <ul className="footer-ul">
              <li>Email: support@pcrmeet.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Address: Nagpur, India</li>
            </ul>
          </div>
          <div className="follow-us">
            <h4>Follow Us</h4>
            <ul className="footer-ul">
              <li>Facebook</li>
              <li>Twitter</li>
              <li>LinkedIn</li>
              <li>Instagram</li>
            </ul>
          </div>
        </div>
        <p>© 2025 PCR Meet. All rights reserved.</p>
      </div>
    </>
  );
});

export default Footer;
