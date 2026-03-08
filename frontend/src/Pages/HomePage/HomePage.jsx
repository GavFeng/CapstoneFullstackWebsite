import React from 'react'

import NewJigs from '../../Components/CarouselJigs/NewJigs';
import PopularJigs from '../../Components/CarouselJigs/PopularJigs';

const Homepage = () => {
  return (
    <div> 
      <NewJigs />
      <PopularJigs />
    </div>
  )
}

export default Homepage