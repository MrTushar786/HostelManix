import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../css/ComingSoon.css';

const ComingSoon = () => {
    const navigate = useNavigate();

    return (
        <>
            <Navbar />
            <div className="coming-soon-page">
                <div className="particles" />
                <div className="coming-soon-container">
                    <div className="glass-card">
                        <div className="icon-wrapper">
                            <div className="icon-circle">
                                <span className="icon">🚀</span>
                            </div>
                        </div>
                        <h1>Coming Soon</h1>
                        <p className="subtitle">We're working hard to bring you an amazing payment experience!</p>
                        <p className="description">
                            Our secure payment gateway is currently under development. 
                            You'll be able to make payments directly through the platform soon.
                        </p>
                        <div className="features">
                            <div className="feature-item">
                                <span className="feature-icon">🔒</span>
                                <span>Secure Payment Processing</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">💳</span>
                                <span>Multiple Payment Options</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📧</span>
                                <span>Instant Payment Receipts</span>
                            </div>
                        </div>
                        <button className="back-btn" onClick={() => navigate(-1)}>
                            ← Go Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ComingSoon;

