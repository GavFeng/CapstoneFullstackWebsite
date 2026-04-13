import React from "react";
import "./Hero.css";
import { Link } from "react-router-dom";
import heroImage from '../../Assets/blue_14.jpg';

{/* Hero Compontent for Home Page */}
const Hero = () => {
  return (
    <section className="hero">

      <div className="hero-container">

        {/* Left Content */}
        <div className="hero-text">
          <h1>Premium Squid Jigs</h1>
          <p>
            Find you favorite handmade & high-quality squid jigs designed for performance and
            durability.
          </p>

          <div className="hero-buttons">
            <Link to="/alljigs" className="btn-primary-hero">
              Shop Now
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="hero-image">
          <img src={heroImage} alt="Squid Jig Fishing Lure"/>
        </div>

      </div>

    </section>
  )
}

export default Hero