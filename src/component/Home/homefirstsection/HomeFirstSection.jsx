'use client'
import React from 'react'
import './homefirstsection.scss'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

export default function Homefirstsection () {
  return (
    <section className='homefirstsection'>
      {/* Background video */}
      <video
        className='background-video'
        autoPlay
        muted
        loop
        playsInline
        poster='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920'
      >
        <source
          src='https://media.gettyimages.com/id/1483000197/video/japanese-style-living-room-interior-with-dining-table-chairs-sofa-armchair-and-houseplants.mp4?s=mp4-640x640-gi&k=20&c=Lpu3Et6gtcF6PBsZFRKUCIvo5CuxSPUt61A6tD-98hU='
          type='video/mp4'
        />
      </video>

      {/* Overlay gradient */}
      <div className='overlay'></div>

      {/* Content */}
      <motion.div
        className='content'
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <h1>
          Find Your <span>Perfect Home</span>
          <br />
          Buy & Sell with Confidence
        </h1>
        <p>
          Explore premium homes, apartments, and investment properties in top
          locations. List your property or find your dream home effortlessly.
        </p>

        <div className='search-box'>
          <input type='text' placeholder='Enter city or location...' />
          <select>
            <option>Buy</option>
            <option>Rent</option>
            <option>Sell</option>
          </select>
          <a href='/search'>
            <button>
              <Search size={18} /> Search
            </button>
          </a>
        </div>
      </motion.div>
    </section>
  )
}
