import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTypewriterEffect } from './useTypewriterEffect'; // 👈 import hook

function Landingscreen() {
  const typedText = useTypewriterEffect('“There is only one boss. The Guest.”', 70);

  return (
    <div className='landing-container'>
      <video autoPlay muted loop className="landing-video">
        <source src="/hotel.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className='landing-overlay' />

      <motion.div
        className='landing-content text-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className='landing-title'>SheyRooms</h2>
        <h4 className='landing-quote'>{typedText}</h4> {/* 👈 Typewriter */}
        <Link to='/home'>
          <button className='btn landingbtn'>Get Started</button>
        </Link>
      </motion.div>
    </div>
  );
}

export default Landingscreen;



