"use client"

import { ArrowLeft, Bookmark, Search, Star, Triangle, Utensils, Music, HelpCircle } from "lucide-react"
import { Button } from "../Components/ui/button.tsx"
import { Input } from "../Components/ui/input.tsx"
import { Card, CardContent } from "../Components/ui/card.tsx"
import { useNavigate } from 'react-router-dom'

const categories = [
  { name: "Popular", icon: Star, active: true },
  { name: "Food & Drink", icon: Utensils, active: false },
  { name: "Outdoors", icon: Triangle, active: false },
  { name: "Arts & Culture", icon: Music, active: false },
  { name: "Accessible", icon: HelpCircle, active: false },
]

const experiences = [
  {
    id: 1,
    image: "/images/bangkok-street-food-market.png",
    title: "Street Food Market Tour",
    location: "Bangkok",
    duration: "3 hrs",
    details: "Small group",
    price: "$45",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    image: "/images/italian-pasta-making.png",
    title: "Authentic Pasta Making",
    location: "Rome",
    duration: "2.5 hrs",
    details: "Includes dinner",
    price: "$75",
    rating: 4.9,
    reviews: 89,
  },
  {
    id: 3,
    image: "/images/mallorca-sunset-boat.png",
    title: "Sunset Sailing Experience",
    location: "Mallorca",
    duration: "2 hrs",
    details: "All gear included",
    price: "$65",
    rating: 4.7,
    reviews: 156,
  },
  {
    id: 4,
    image: "/images/new-york-graffiti-wall.png",
    title: "Urban Photography Walk",
    location: "New York",
    duration: "2 hrs",
    details: "DSLR or phone",
    price: "$55",
    rating: 4.6,
    reviews: 203,
  },
  {
    id: 5,
    image: "/images/placeholder-ppdjt.png",
    title: "Wine Tasting Experience",
    location: "Napa",
    duration: "2 hrs",
    details: "4 varietals",
    price: "$85",
    rating: 4.9,
    reviews: 67,
  },
  {
    id: 6,
    image: "/images/bali-underwater-reef.png",
    title: "Coral Reef Snorkeling",
    location: "Bali",
    duration: "3 hrs",
    details: "Boat & guide",
    price: "$40",
    rating: 4.8,
    reviews: 189,
  },
]

export default function Experiencescreen() {
  const navigate = useNavigate()

  const handleBackClick = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-gray-100"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
            <div className="text-blue-600 font-bold text-xl">
              SheyRooms
            </div>
          </div>

          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search experiences, cities, or hosts"
                className="pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl text-base focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
              <Bookmark className="h-5 w-5 text-gray-600 hover:text-blue-600" />
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <img
              src="/images/hero-cooking.jpg"
              alt="People cooking together around a large pan"
              className="w-full h-80 object-cover rounded-3xl shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold mb-2">Discover Unique Experiences</h1>
              <p className="text-lg opacity-90">Connect with local hosts and create unforgettable memories</p>
            </div>
          </div>

          {/* Enhanced Category Filters */}
          <div className="flex gap-4 mt-8 overflow-x-auto pb-2">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Button
                  key={category.name}
                  variant={category.active ? "default" : "outline"}
                  size="lg"
                  className={`flex items-center gap-3 whitespace-nowrap rounded-full px-6 py-3 text-base font-medium transition-all duration-200 ${
                    category.active
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Experiences Grid */}
      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Experiences</h2>
            <p className="text-gray-600">Handpicked activities from local experts</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map((experience) => (
              <Card
                key={experience.id}
                className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white rounded-2xl"
              >
                <div className="relative">
                  <img
                    src={experience.image || "/placeholder.svg"}
                    alt={`${experience.location} experience`}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-900">{experience.rating}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold">{experience.price}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{experience.title}</h3>
                      <p className="text-blue-600 font-semibold">{experience.location}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">{experience.duration}</span>
                      <span>•</span>
                      <span>{experience.details}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-900">{experience.rating}</span>
                        <span className="text-sm text-gray-500">({experience.reviews} reviews)</span>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="flex justify-center gap-16 max-w-md mx-auto">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-xl">
            <Triangle className="h-6 w-6 text-gray-600" />
            <span className="text-xs text-gray-600">Outdoors</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-xl">
            <Utensils className="h-6 w-6 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Food</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-xl">
            <Music className="h-6 w-6 text-gray-600" />
            <span className="text-xs text-gray-600">Culture</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-xl">
            <HelpCircle className="h-6 w-6 text-gray-600" />
            <span className="text-xs text-gray-600">Help</span>
          </Button>
        </div>
      </nav>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-8 pb-24 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">SheyRooms</h3>
              <p className="text-gray-600 text-sm">Discover unique experiences and create unforgettable memories with local hosts around the world.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Experiences</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Food & Drink</a></li>
                <li><a href="#" className="hover:text-blue-600">Arts & Culture</a></li>
                <li><a href="#" className="hover:text-blue-600">Outdoors</a></li>
                <li><a href="#" className="hover:text-blue-600">Wellness</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600">Safety</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">About</a></li>
                <li><a href="#" className="hover:text-blue-600">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600">Press</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
              <span>© 2025 SheyRooms. All rights reserved.</span>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-blue-600">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600">Terms of Service</a>
                <a href="#" className="hover:text-blue-600">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
