import React from 'react'

import NewJigs from '../../Components/CarouselJigs/NewJigs';
import PopularJigs from '../../Components/CarouselJigs/PopularJigs';
import Hero from '../../Components/Hero/Hero';
import InfoPanel from '../../Components/InfoPanel/InfoPanel';

const Homepage = () => {
  return (
    <div> 
      <Hero />
      <NewJigs />
      <InfoPanel />
      <PopularJigs />
    </div>
  )
}

export default Homepage