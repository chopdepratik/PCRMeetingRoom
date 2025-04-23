import { useState, useEffect } from "react";
import profile1 from "../images/review-profile1.png";
import { reviewData } from "./review-data.js";
import "../components/Review.css";
import leftArrow from "../images/left-arrow.png";
import rightArrow from "../images/right-arrow.png";

function Review() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(3);
    const cardWidth = 300; // width + gap
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCardsToShow(1);
            } else if (window.innerWidth < 1024) {
                setCardsToShow(4);
            } else {
                setCardsToShow(5);
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex >= reviewData.length+3 - cardsToShow ? 0 : prevIndex + 1
        );
    };
    
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex <= 0 ? reviewData.length+3 - cardsToShow : prevIndex - 1
        );
    };
    
    return (
        <section className="review-section">
            <h2 className="review-heading" >Customer Reviews</h2>
            <div className="review-main-container">
                <button className="nav-btn prev-btn" onClick={prevSlide}>
                    <img src={leftArrow} alt="Previous" />
                </button>
                
                <div className="review-wrapper" style={{
                    transform: `translateX(-${currentIndex * cardWidth}px)`
                }}>
                    {reviewData.map((user) => (
                        <div className="card" key={user.id}>
                            <div className="profile-container">
                                <img src={profile1} alt={user.username} />
                                <p>{user.username}</p>
                            </div>
                            <div className="review-container">
                                <p>{user.review}</p>
                                <p>Rating: {user.rating}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button className="nav-btn next-btn" onClick={nextSlide}>
                    <img src={rightArrow} alt="Next" />
                </button>
            </div>
        </section>
    );
}

export default Review;