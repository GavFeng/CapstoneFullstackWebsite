import React from "react";
import "./Hero.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroImage from '../../Assets/blue_14.jpg';

{/* Hero Compontent for Home Page */}
const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="hero">

      <div className="hero-container">

        {/* Left Content */}
        <div className="hero-text">
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.subtitle')}</p>

          <div className="hero-buttons">
            <Link to="/alljigs" className="btn-primary-hero">
              {t('hero.button')}
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="hero-image">
          <img src={heroImage} alt={t('hero.imageAlt')}/>
        </div>

      </div>

    </section>
  )
}

export default Hero