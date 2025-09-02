"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { ArrowLeft, Bookmark, Search, Phone, Mail, Clock, MapPin, MessageSquare, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "../Components/ui/button.tsx"
import { Input } from "../Components/ui/input.tsx"
import { Textarea } from "../Components/ui/textarea.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select.tsx"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../Components/ui/form.tsx"
import { Card, CardContent } from "../Components/ui/card.tsx"

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export default function ContactPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
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

  const form = useForm<ContactFormData>({
    defaultValues: { 
      name: user?.name || "", 
      email: user?.email || "", 
      phone: "", 
      subject: "", 
      message: "" 
    },
  })

  // ✅ Handle navigation functions
  const handleBackClick = () => {
    navigate('/')
  }

  // ✅ Handle call support
  const handleCallSupport = () => {
    // You can replace with actual phone number
    window.location.href = "tel:+1-800-SHEYROOMS"
  }

  // ✅ Handle email support
  const handleEmailSupport = () => {
    window.location.href = "mailto:support@sheyrooms.com?subject=Support Request"
  }

  // ✅ Handle form submission with backend integration
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Replace with your actual backend API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: user?._id || null,
          timestamp: new Date().toISOString()
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        form.reset()
        console.log("✅ Contact form submitted successfully:", data)
      } else {
        throw new Error('Failed to submit form')
      }
    } catch (error) {
      console.error('❌ Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 hover:bg-gray-100 rounded-lg px-3 py-2"
              onClick={handleBackClick}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="text-blue-600 font-bold text-xl">
              SheyRooms
            </div>
          </div>

          <div className="flex-1 max-w-lg mx-8 hidden sm:block">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search stays, experiences, or hosts"
                className="pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl text-base focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Bookmark className="w-5 text-gray-600 hover:text-blue-600" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        {/* Enhanced Hero Section */}
        <section className="flex flex-col lg:flex-row items-start gap-12">
          <div className="w-full lg:w-[500px] flex-shrink-0">
            <div className="relative">
              <img
                src="/images/workspace-desk.jpg"
                alt="Modern workspace with computer and plants"
                className="w-full h-80 object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-lg border">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">24/7 Support</span>
                </div>
                <p className="text-sm text-gray-600">Always here to help</p>
              </div>
            </div>
          </div>

          <div className="space-y-8 flex-1">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Get in touch with our team
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                Whether it's about bookings, hosting, or payments — we're here to help you 24/7. 
                Our dedicated support team is ready to assist with any questions or concerns.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                size="lg"
                className="flex items-center gap-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300 px-8 py-4 text-base font-medium rounded-xl transition-all duration-200"
                onClick={handleCallSupport}
              >
                <Phone className="w-5 h-5" /> Call Support
              </Button>
              <Button 
                size="lg"
                className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-base font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={handleEmailSupport}
              >
                <Mail className="w-5 h-5" /> Email Us
              </Button>
            </div>

            {/* Quick Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Call us</p>
                  <p className="text-gray-600">1-800-SHEYROOMS</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email us</p>
                  <p className="text-gray-600">support@sheyrooms.com</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Contact Form + Support Info */}
        <section className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <Card className="lg:col-span-2 border-0 shadow-2xl rounded-3xl">
            <CardContent className="p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a message</h2>
                <p className="text-gray-600">Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>

              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">Message sent successfully! We'll get back to you soon.</p>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">Failed to send message. Please try again.</p>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-gray-700">Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500" 
                            placeholder="Enter your full name" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      rules={{ 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-700">Email *</FormLabel>
                          <FormControl>
                            <Input 
                              className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500" 
                              type="email" 
                              placeholder="you@example.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-700">Phone</FormLabel>
                          <FormControl>
                            <Input 
                              className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500" 
                              type="tel" 
                              placeholder="+1 555 000 0000" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    rules={{ required: "Please select a subject" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-gray-700">Subject *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500">
                              <SelectValue placeholder="Choose a topic" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-2">
                            <SelectItem value="booking">Booking Support</SelectItem>
                            <SelectItem value="host">Host Questions</SelectItem>
                            <SelectItem value="payments">Payment Issues</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    rules={{ required: "Message is required", minLength: { value: 10, message: "Message must be at least 10 characters" } }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-gray-700">Message *</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-32 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500 resize-none" 
                            placeholder="Write your message here..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4">
                    <p className="text-sm text-gray-500">
                      By submitting, you agree to our{" "}
                      <a href="#" className="text-blue-600 hover:underline">terms</a> and{" "}
                      <a href="#" className="text-blue-600 hover:underline">privacy policy</a>.
                    </p>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-base font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Enhanced Support Info */}
          <Card className="border-0 shadow-xl rounded-3xl bg-gradient-to-b from-orange-50 to-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-orange-700 mb-6">We reply within 24 hours</h3>
              <div className="space-y-6 text-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Business Hours</p>
                    <p className="text-gray-600">Mon-Fri, 9am - 6pm PST</p>
                    <p className="text-sm text-gray-500 mt-1">Average response: 2 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">24/7 Support</p>
                    <p className="text-gray-600">Emergency support available</p>
                    <p className="text-sm text-gray-500 mt-1">For urgent booking issues</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Multi-language</p>
                    <p className="text-gray-600">Support in 12+ languages</p>
                    <p className="text-sm text-gray-500 mt-1">Global assistance</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Enhanced Map Section */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Global Presence</h2>
            <p className="text-lg text-gray-600">Find us in major cities around the world</p>
          </div>
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100">
              <img
                src="/images/city-map-markers.png"
                alt="Interactive map showing SheyRooms office locations worldwide"
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        </section>

        {/* Enhanced Help Links */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Help</h2>
            <p className="text-lg text-gray-600">Find answers to common questions</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Guest & Host Protection",
                description: "Learn about our safety measures and protection policies for all users.",
                icon: MapPin
              },
              {
                title: "Billing & Refunds",
                description: "Understand charges, holds, refund policies, and payment methods.",
                icon: Mail
              },
              {
                title: "Booking Changes",
                description: "Information about changing dates, cancellations, and modifications.",
                icon: Clock
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <item.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-12 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg">SheyRooms</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your trusted platform for unique stays and memorable experiences worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Safety</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">© 2025 SheyRooms. All rights reserved.</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Made with ❤️ for travelers</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
