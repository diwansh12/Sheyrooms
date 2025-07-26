import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  Star,
  Shield,
  Clock,
  Award,
  Users,
  MapPin,
  ChevronRight,
  ArrowDown,
  Calendar,
  Globe,
  Sparkles,
  Heart,
  TrendingUp,
  Award as Trophy
} from 'lucide-react';
import Button from '../component/ui/Button';
import Card from '../component/ui/Card';

const LandingScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [floatingElements, setFloatingElements] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const heroSlides = [
    {
      image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      title: 'Luxury Redefined',
      subtitle: 'Where Dreams Meet Reality',
      description: 'Experience unparalleled luxury in breathtaking destinations',
      gradient: 'from-purple-900/90 via-blue-900/80 to-indigo-900/90'
    },
    {
      image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      title: 'Comfort Beyond Compare',
      subtitle: 'Every Stay, A Masterpiece',
      description: 'Discover extraordinary comfort that exceeds expectations',
      gradient: 'from-emerald-900/90 via-teal-900/80 to-cyan-900/90'
    },
    {
      image: 'https://images.pexels.com/photos/2096983/pexels-photo-2096983.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      title: 'Your Perfect Escape',
      subtitle: 'Create Unforgettable Moments',
      description: 'Where luxury hospitality meets your wildest dreams',
      gradient: 'from-rose-900/90 via-pink-900/80 to-purple-900/90'
    }
  ];

  const features = [
    {
      icon: <Shield className="w-10 h-10" />,
      title: 'Premium Security',
      description: 'Military-grade security protocols ensure your complete safety and privacy',
      color: 'from-blue-500 to-blue-600',
      stat: '100%',
      statLabel: 'Secure'
    },
    {
      icon: <Clock className="w-10 h-10" />,
      title: 'Concierge Excellence',
      description: 'Personal butler service available 24/7 for your every need',
      color: 'from-emerald-500 to-emerald-600',
      stat: '24/7',
      statLabel: 'Service'
    },
    {
      icon: <Trophy className="w-10 h-10" />,
      title: 'Award Winning',
      description: 'Recognized globally for hospitality excellence and innovation',
      color: 'from-amber-500 to-amber-600',
      stat: '50+',
      statLabel: 'Awards'
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: 'Elite Staff',
      description: 'Michelin-trained professionals dedicated to perfection',
      color: 'from-purple-500 to-purple-600',
      stat: '5★',
      statLabel: 'Rated'
    }
  ];

  const testimonials = [
    {
      name: 'Isabella Rodriguez',
      rating: 5,
      comment: 'An absolutely transcendent experience. Every detail was perfection, from the champagne welcome to the silk sheets.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      location: 'Monaco',
      title: 'CEO, Fashion Empire'
    },
    {
      name: 'Alexander Chen',
      rating: 5,
      comment: 'SheyRooms redefined luxury for me. The personalized service and attention to detail is unmatched anywhere in the world.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      location: 'Singapore',
      title: 'Investment Director'
    },
    {
      name: 'Sophia Williams',
      rating: 5,
      comment: 'Pure magic. From the moment I arrived until checkout, I felt like royalty. This is how luxury should be.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      location: 'London',
      title: 'Art Curator'
    }
  ];

  const stats = [
    { number: '500K+', label: 'Happy Guests', icon: <Heart className="w-6 h-6" /> },
    { number: '150+', label: 'Luxury Properties', icon: <Globe className="w-6 h-6" /> },
    { number: '98%', label: 'Satisfaction Rate', icon: <TrendingUp className="w-6 h-6" /> },
    { number: '24/7', label: 'Concierge Service', icon: <Award className="w-6 h-6" /> }
  ];

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating elements animation
  useEffect(() => {
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.1,
      duration: Math.random() * 20 + 10
    }));
    setFloatingElements(elements);
  }, []);

  // Enhanced typewriter effect
  useEffect(() => {
    const phrases = [
      '"Luxury is in each detail"',
      '"Where dreams become reality"',
      '"Excellence is our standard"',
      '"Your comfort, our passion"'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeEffect = () => {
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        setTypedText(currentPhrase.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setTypedText(currentPhrase.substring(0, charIndex + 1));
        charIndex++;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        setTimeout(() => { isDeleting = true; }, 2000);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    };

    const timer = setInterval(typeEffect, isDeleting ? 50 : 100);
    return () => clearInterval(timer);
  }, []);

  // Auto-slide with enhanced timing
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              opacity: element.opacity,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [element.opacity, element.opacity * 2, element.opacity],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Revolutionary Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ scale: 1.2, opacity: 0, rotateZ: 5 }}
              animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateZ: -5 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div className="relative w-full h-full">
                <img
                  src={heroSlides[currentSlide].image}
                  alt={heroSlides[currentSlide].title}
                  className="w-full h-full object-cover"
                />
                {/* Multi-layer Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].gradient}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Animated Light Rays */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-white/40 to-transparent transform rotate-12 animate-pulse" />
                  <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-white/30 to-transparent transform -rotate-12 animate-pulse delay-1000" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Parallax Mouse Effect */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            x: mousePosition.x * 0.01,
            y: mousePosition.y * 0.01,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        >
          <div className="w-full h-full bg-gradient-radial from-white/10 to-transparent" />
        </motion.div>

        {/* Enhanced Content */}
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="max-w-6xl mx-auto"
          >
            {/* Floating Sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${10 + i * 10}%`,
                    top: `${20 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
              ))}
            </div>

            {/* Revolutionary Brand Name */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotateX: 90 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ duration: 1.5, delay: 0.5, type: "spring" }}
              className="relative mb-8"
            >
              <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-black mb-4 relative">
                <span className="bg-gradient-to-r from-white via-yellow-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                  SheyRooms
                </span>
                {/* 3D Text Effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 bg-clip-text text-transparent blur-sm -z-10 transform translate-x-2 translate-y-2">
                  SheyRooms
                </span>
              </h1>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-16 h-16 border-2 border-yellow-400 rounded-full opacity-30"
              />
            </motion.div>

            {/* Dynamic Subtitle */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-black/60 via-black/40 to-black/60 backdrop-blur-xl rounded-3xl px-12 py-6 border border-white/20 shadow-2xl">
                <h2 className="text-3xl md:text-5xl font-light mb-2 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                  {heroSlides[currentSlide].title}
                </h2>
                <p className="text-xl md:text-2xl text-blue-200 font-medium">
                  {heroSlides[currentSlide].subtitle}
                </p>
              </div>
            </motion.div>

            {/* Animated Typewriter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-lg rounded-2xl px-8 py-4 border border-purple-300/30">
                <p className="text-xl md:text-2xl font-medium min-h-[2em] flex items-center justify-center">
                  <span className="text-purple-200">
                    {typedText}
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-yellow-300 ml-1"
                    >
                      |
                    </motion.span>
                  </span>
                </p>
              </div>
            </motion.div>

            {/* Enhanced Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2 }}
              className="mb-12"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20 shadow-xl">
                <p className="text-xl md:text-2xl text-white/95 leading-relaxed">
                  {heroSlides[currentSlide].description}
                </p>
              </div>
            </motion.div>

            {/* Revolutionary CTA Buttons - Enhanced Typography */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 2.5, type: "spring" }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link to="/home">
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-enhanced btn-hero-primary group relative px-12 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl text-white overflow-hidden shadow-2xl border border-white/20"
                >
                  <span className="relative z-10 flex items-center">
                    Begin Your Journey
                    <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" size={24} />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: "rgb(30, 64, 175)"
                }}
                whileTap={{ scale: 0.95 }}
                className="btn-enhanced btn-hero-outline px-12 py-6 bg-white/20 backdrop-blur-lg rounded-2xl text-white border-2 border-white/30 hover:border-white transition-all duration-300 shadow-xl"
              >
                Explore Collection
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-4 bg-black/30 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
            {heroSlides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative w-4 h-4 rounded-full transition-all duration-500 ${
                  index === currentSlide 
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {index === currentSlide && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    layoutId="activeSlide"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white z-20"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-3 font-medium">Discover More</span>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
              <ArrowDown className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center text-white"
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="text-blue-400 mb-3 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Revolutionary Search Section */}
      <section className="py-32 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-500 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Find Your
              </span>
              <br />
              <span className="text-gray-900">Perfect Paradise</span>
            </h2>
            <p className="text-2xl md:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Discover extraordinary destinations curated for the discerning traveler
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="max-w-6xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1 rounded-2xl">
                <div className="bg-white rounded-2xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                      <label className="block text-lg font-bold text-gray-800 mb-4">Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500" size={24} />
                        <input
                          type="text"
                          placeholder="Where to?"
                          className="w-full pl-14 pr-4 py-5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all text-lg font-medium hover:border-purple-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-bold text-gray-800 mb-4">Check-in</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500" size={24} />
                        <input
                          type="date"
                          className="w-full pl-14 pr-4 py-5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all text-lg font-medium hover:border-purple-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-bold text-gray-800 mb-4">Check-out</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500" size={24} />
                        <input
                          type="date"
                          className="w-full pl-14 pr-4 py-5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all text-lg font-medium hover:border-purple-300"
                        />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <Link to="/home" className="w-full">
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="btn-enhanced btn-search-enhanced w-full h-16 rounded-xl flex items-center justify-center gap-3"
                        >
                          <Search size={24} />
                          <span>Discover Luxury</span>
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-32 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl md:text-8xl font-black text-white mb-8">
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Why Choose
              </span>
              <br />
              <span className="text-white">Excellence?</span>
            </h2>
            <p className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Experience the pinnacle of luxury hospitality
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 h-full">
                  <div className={`bg-gradient-to-br ${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-yellow-400 mb-1">{feature.stat}</div>
                    <div className="text-sm text-gray-400">{feature.statLabel}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">{feature.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed text-center">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury Testimonials */}
      <section className="py-32 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl md:text-8xl font-black text-gray-900 mb-8">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Elite
              </span>
              <span className="text-gray-900"> Experiences</span>
            </h2>
            <p className="text-2xl md:text-3xl text-gray-600">What our distinguished guests say</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 h-full">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-8 italic text-xl leading-relaxed">"{testimonial.comment}"</p>
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full border-4 border-purple-200 group-hover:border-purple-400 transition-colors duration-300"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 text-xl">{testimonial.name}</h4>
                      <p className="text-purple-600 font-medium">{testimonial.title}</p>
                      <p className="text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/50" />
          {/* Animated Background Elements */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [1, 2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-8xl font-black mb-8">
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Ready for
              </span>
              <br />
              <span className="text-white">Paradise?</span>
            </h2>
            <p className="text-2xl md:text-3xl mb-16 opacity-90 max-w-4xl mx-auto leading-relaxed">
              Join the elite circle of travelers who demand nothing but perfection
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-enhanced btn-hero-primary px-16 py-6 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300"
                >
                  Begin Your Journey
                </motion.button>
              </Link>
              <Link to="/home">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-enhanced btn-hero-outline px-16 py-6 bg-white/20 backdrop-blur-xl text-white rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all duration-300 shadow-xl"
                >
                  Explore Collection
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Styles with Superior Typography */}
      <style>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        /* Enhanced Button Typography Styles */
        .btn-enhanced {
          font-family: 'Inter', 'Segoe UI', 'Roboto', system-ui, -apple-system, sans-serif !important;
          font-weight: 800 !important;
          font-size: 1.2rem !important;
          letter-spacing: 0.8px !important;
          text-transform: none !important;
          line-height: 1.2 !important;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          font-feature-settings: 'kern' 1, 'liga' 1 !important;
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }

        /* Hero Button Enhanced Typography */
        .btn-hero-primary {
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif !important;
          font-weight: 900 !important;
          font-size: 1.4rem !important;
          letter-spacing: 1.2px !important;
          text-transform: uppercase !important;
          line-height: 1.1 !important;
          text-shadow: 0 3px 6px rgba(0, 0, 0, 0.5) !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          -webkit-font-smoothing: antialiased !important;
          text-rendering: optimizeLegibility !important;
        }

        .btn-hero-primary:hover {
          letter-spacing: 1.4px !important;
          font-weight: 900 !important;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.6) !important;
        }

        .btn-hero-outline {
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif !important;
          font-weight: 800 !important;
          font-size: 1.3rem !important;
          letter-spacing: 1px !important;
          text-transform: uppercase !important;
          line-height: 1.1 !important;
          text-shadow: 0 3px 8px rgba(0, 0, 0, 0.6) !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .btn-hero-outline:hover {
          letter-spacing: 1.2px !important;
          font-weight: 900 !important;
          text-shadow: none !important;
        }

        /* Search Button Enhanced Typography */
        .btn-search-enhanced {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) !important;
          color: white !important;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif !important;
          font-weight: 900 !important;
          font-size: 1.25rem !important;
          letter-spacing: 1px !important;
          border: none !important;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4) !important;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4) !important;
        }

        .btn-search-enhanced:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #9333ea 100%) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.6) !important;
          letter-spacing: 1.2px !important;
          font-weight: 900 !important;
        }

        /* Mobile Responsive Font Adjustments */
        @media (max-width: 768px) {
          .btn-enhanced {
            font-size: 1.1rem !important;
            letter-spacing: 0.6px !important;
          }

          .btn-hero-primary,
          .btn-hero-outline {
            font-size: 1.2rem !important;
            letter-spacing: 0.8px !important;
            padding: 1.2rem 2.5rem !important;
          }

          .btn-search-enhanced {
            font-size: 1.1rem !important;
            letter-spacing: 0.8px !important;
          }
        }

        /* Font Loading Optimization */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .text-shadow-lg {
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default LandingScreen;
