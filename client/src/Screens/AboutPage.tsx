"use client"

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  Search,
  Building2,
  Users,
  MapPin,
  Heart,
  Award,
  Globe,
  Shield,
  Star
} from "lucide-react"
import { Button } from "../Components/ui/button.tsx"
import { Input } from "../Components/ui/input.tsx"
import { Card, CardContent } from "../Components/ui/card.tsx"

// ✅ Define User interface for authentication
interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

const stats = [
  { number: "150k+", label: "Nights booked", icon: Building2 },
  { number: "12k+", label: "Verified stays", icon: Users },
  { number: "2k+", label: "Local hosts", icon: MapPin },
  { number: "95%", label: "Satisfaction", icon: Heart },
]

const teamMembers = [
  { 
    id: 1, 
    image: "/images/team-photo.jpg", 
    name: "Sarah Johnson",
    role: "Co-founder & CEO",
    description: "Leading SheyRooms with 10+ years in hospitality"
  },
  { 
    id: 2, 
    image: "/images/team-photo.jpg", 
    name: "Michael Chen",
    role: "Co-founder & CTO",
    description: "Building scalable technology for seamless travel experiences"
  },
  { 
    id: 3, 
    image: "/images/team-photo.jpg", 
    name: "Emily Rodriguez",
    role: "Head of Operations",
    description: "Ensuring quality and excellence in every stay"
  },
]

const values = [
  {
    icon: Heart,
    title: "Community First",
    description: "Building meaningful connections between travelers and local hosts worldwide."
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "Verified properties and secure payments for peace of mind every time."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Expanding access to unique accommodations in destinations worldwide."
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Committed to delivering exceptional experiences that exceed expectations."
  }
]

export default function AboutPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  // ✅ Check authentication state
  useEffect(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null") as User | null
      setUser(currentUser)
    } catch (error) {
      console.error('Error checking auth state:', error)
      setUser(null)
    }
  }, [])

  // ✅ Handle navigation functions
  const handleBackClick = () => {
    navigate('/')
  }

  const handleExploreStays = () => {
    if (user) {
      navigate('/home')
    } else {
      navigate('/login')
    }
  }

  const handleDiscoverExperiences = () => {
    navigate('/experiences')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left controls */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
            <div className="text-blue-600 font-bold text-xl">
              SheyRooms
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg mx-6 hidden sm:block">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search stays, experiences, or hosts"
                className="pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl text-base focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Bookmark className="h-5 w-5 text-gray-600 hover:text-blue-600" />
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="px-4 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src="/images/team-photo.jpg"
                alt="SheyRooms team collaborating"
                className="w-96 h-96 object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-bold text-lg">4.9</span>
                </div>
                <p className="text-sm opacity-90">Rated by travelers</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 text-center lg:text-left max-w-2xl">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                About <span className="text-orange-600">SheyRooms</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                We're redefining the way people experience travel by connecting them with trusted hosts, unique stays, and memorable experiences. With thousands of nights booked and a growing community, our mission is to make travel feel like home — wherever you are.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300 px-8 py-4 text-base font-medium transition-all duration-200"
                onClick={handleExploreStays}
              >
                <Building2 className="h-5 w-5" />
                Explore Stays
              </Button>
              <Button
                size="lg"
                className="flex items-center gap-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-base font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={handleDiscoverExperiences}
              >
                Discover Experiences
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-lg text-gray-600">Numbers that showcase our growing community</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="text-center border-0 shadow-lg rounded-2xl bg-gradient-to-b from-orange-50 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <stat.icon className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-orange-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-base text-gray-700 font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at SheyRooms
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Team Section */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate people behind SheyRooms, dedicated to transforming your travel experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {teamMembers.map((member) => (
              <Card
                key={member.id}
                className="overflow-hidden border-0 shadow-lg rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
              >
                <div className="relative">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-orange-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers who trust SheyRooms for their perfect stays and unforgettable experiences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 text-base font-medium rounded-xl transition-all duration-200"
              onClick={handleExploreStays}
            >
              Start Exploring
            </Button>
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-base font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={handleDiscoverExperiences}
            >
              Book Experience
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-12 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg">SheyRooms</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Making travel feel like home, wherever you are. Connect with trusted hosts and discover unique stays worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Trust & Safety</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
              <span>© 2025 SheyRooms. All rights reserved.</span>
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <span>Made with ❤️ for travelers worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
