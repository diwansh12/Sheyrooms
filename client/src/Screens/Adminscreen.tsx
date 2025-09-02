"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../Components/ui/button.tsx"
import { Input } from "../Components/ui/input.tsx"
import { Badge } from "../Components/ui/badge.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "../Components/ui/avatar.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../Components/ui/dialog.tsx"
import { Textarea } from "../Components/ui/textarea.tsx"
import {
  Calendar,
  Users,
  Building,
  Search,
  Bell,
  LogOut,
  Download,
  Upload,
  ArrowLeft,
  Wifi,
  AirVent,
  Briefcase,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Plus,
  TrendingUp,
  DollarSign,
  Home,
  RefreshCw
} from "lucide-react"
import { authAPI, bookingsAPI, roomsAPI } from '../services/api.ts'
import Swal from 'sweetalert2'

// ✅ Fixed TypeScript interfaces
interface Booking {
  _id: string
  userid?: {
    name?: string
    email?: string
  }
  room?: string
  fromdate: string
  todate: string
  totalamount?: number
  status: 'confirmed' | 'pending' | 'cancelled'
}

interface Room {
  _id: string
  name: string
  type: string
  rentperday?: number
  maxcount?: number
  phonenumber?: string
  description?: string
  imageurls?: string[]
}

interface User {
  _id: string
  name?: string
  email?: string
  isAdmin: boolean
  profileImage?: string
  createdAt?: string
}

interface Stats {
  totalBookings: number
  totalRooms: number
  totalUsers: number
  revenue: number
  occupancyRate: number
}

interface RoomForm {
  name: string
  rentperday: string
  maxcount: string
  description: string
  phonenumber: string
  type: string
  imageurl1: string
  imageurl2: string
  imageurl3: string
}

// ✅ API Error interface
interface ApiError {
  response?: {
    data?: {
      message?: string
    }
    status?: number
  }
  message?: string
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  </div>
)

// Error component
const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <p className="text-red-600 mb-4">{message}</p>
    <Button onClick={onRetry} variant="outline" size="sm">
      <RefreshCw className="h-4 w-4 mr-2" />
      Retry
    </Button>
  </div>
)

export default function Adminscreen() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("bookings")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ Fixed Data states with proper typing
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalRooms: 0,
    totalUsers: 0,
    revenue: 0,
    occupancyRate: 0
  })

  // Loading states
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)

  // ✅ Fixed Error states with proper typing
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [roomsError, setRoomsError] = useState<string | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("30")
  const [userRoleFilter, setUserRoleFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Add room form state
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false)
  const [addingRoom, setAddingRoom] = useState(false)
  const [roomForm, setRoomForm] = useState<RoomForm>({
    name: '',
    rentperday: '',
    maxcount: '',
    description: '',
    phonenumber: '',
    type: '',
    imageurl1: '',
    imageurl2: '',
    imageurl3: ''
  })

  // ✅ Enhanced authentication check
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        console.log('Checking admin authentication...')

        const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}')
        const token = localStorage.getItem("token") || localStorage.getItem("authToken")

        console.log('Auth check:', { hasUser: !!currentUser.name, hasToken: !!token, isAdmin: currentUser.isAdmin })

        if (!currentUser.name || !token) {
          console.log('No valid user or token found')
          navigate('/login', { replace: true })
          return
        }

        if (!currentUser.isAdmin) {
          console.log('User is not admin')
          navigate('/home', { replace: true })
          return
        }

        // Verify token with backend
        await authAPI.verifyToken()
        console.log('✅ Admin access granted')
        setIsAuthorized(true)

      } catch (error) {
        console.error('Auth verification failed:', error)
        navigate('/login', { replace: true })
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAccess()
  }, [navigate])

  // ✅ Fixed error handling function
  const handleApiError = (error: unknown): string => {
    const apiError = error as ApiError
    return apiError?.response?.data?.message || apiError?.message || 'An unexpected error occurred'
  }

  // ✅ Fetch bookings data with proper error handling
  const fetchBookings = async () => {
    setBookingsLoading(true)
    setBookingsError(null)
    try {
      console.log('📊 Fetching bookings...')
      const response = await bookingsAPI.getAllBookings()
      const bookingsData: Booking[] = response.data.data || response.data || []
      setBookings(bookingsData)
      console.log(`✅ Loaded ${bookingsData.length} bookings`)
    } catch (error) {
      console.error('❌ Failed to fetch bookings:', error)
      setBookingsError(handleApiError(error))
    } finally {
      setBookingsLoading(false)
    }
  }

  // ✅ Fetch rooms data with proper error handling
  const fetchRooms = async () => {
    setRoomsLoading(true)
    setRoomsError(null)
    try {
      console.log('🏨 Fetching rooms...')
      const response = await roomsAPI.getAllRooms()
      const roomsData: Room[] = response.data || []
      setRooms(roomsData)
      console.log(`✅ Loaded ${roomsData.length} rooms`)
    } catch (error) {
      console.error('❌ Failed to fetch rooms:', error)
      setRoomsError(handleApiError(error))
    } finally {
      setRoomsLoading(false)
    }
  }

  // ✅ Fetch users data with proper error handling
  const fetchUsers = async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      console.log('👥 Fetching users...')
      const response = await authAPI.getAllUsers()
      const usersData: User[] = response.data.data || response.data || []
      setUsers(Array.isArray(usersData) ? usersData : [])
      console.log(`✅ Loaded ${usersData.length} users`)
    } catch (error) {
      console.error('❌ Failed to fetch users:', error)
      setUsersError(handleApiError(error))
    } finally {
      setUsersLoading(false)
    }
  }

  // ✅ Calculate statistics with proper typing
  useEffect(() => {
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalamount || 0), 0)
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
    const occupancyRate = rooms.length > 0 ? Math.round((confirmedBookings / rooms.length) * 100) : 0

    setStats({
      totalBookings: bookings.length,
      totalRooms: rooms.length,
      totalUsers: users.length,
      revenue: totalRevenue,
      occupancyRate
    })
  }, [bookings, rooms, users])

  // ✅ Load data when tab changes
  useEffect(() => {
    if (!isAuthorized) return

    switch (activeTab) {
      case 'bookings':
        if (bookings.length === 0) fetchBookings()
        break
      case 'rooms':
        if (rooms.length === 0) fetchRooms()
        break
      case 'users':
        if (users.length === 0) fetchUsers()
        break
      default:
        // Load overview data
        if (bookings.length === 0) fetchBookings()
        if (rooms.length === 0) fetchRooms()
        if (users.length === 0) fetchUsers()
    }
  }, [activeTab, isAuthorized])

  // ✅ Handle logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Logout'
    })

    if (result.isConfirmed) {
      localStorage.removeItem('token')
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      navigate('/login')
    }
  }

  // ✅ Add room handler with proper error handling
  const handleAddRoom = async () => {
    if (!roomForm.name || !roomForm.rentperday || !roomForm.type || !roomForm.description) {
      Swal.fire('Error', 'Please fill all required fields', 'error')
      return
    }

    const newRoom = {
      name: roomForm.name,
      rentperday: parseInt(roomForm.rentperday),
      maxcount: parseInt(roomForm.maxcount),
      description: roomForm.description,
      phonenumber: roomForm.phonenumber,
      type: roomForm.type,
      imageurls: [roomForm.imageurl1, roomForm.imageurl2, roomForm.imageurl3].filter(url => url)
    }

    setAddingRoom(true)
    try {
      console.log('➕ Adding new room:', newRoom)
      const response = await roomsAPI.addRoom(newRoom)
      console.log('✅ Room added successfully:', response.data)

      Swal.fire('Success!', 'Room added successfully', 'success')
      setShowAddRoomDialog(false)
      setRoomForm({
        name: '', rentperday: '', maxcount: '', description: '',
        phonenumber: '', type: '', imageurl1: '', imageurl2: '', imageurl3: ''
      })
      fetchRooms() // Refresh rooms list

    } catch (error) {
      console.error('❌ Failed to add room:', error)
      Swal.fire('Error!', handleApiError(error), 'error')
    } finally {
      setAddingRoom(false)
    }
  }

  // ✅ Filter functions with proper typing
  const getFilteredBookings = (): Booking[] => {
    let filtered = bookings

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.userid?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.userid?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.room?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const getFilteredUsers = (): User[] => {
    let filtered = users

    if (userRoleFilter === 'admin') {
      filtered = filtered.filter(user => user.isAdmin)
    } else if (userRoleFilter === 'user') {
      filtered = filtered.filter(user => !user.isAdmin)
    }

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500 hover:bg-green-600"
      case "pending":
        return "bg-orange-500 hover:bg-orange-600"
      case "cancelled":
        return "bg-gray-500 hover:bg-gray-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  // Unauthorized state
  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Enhanced Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600"
              onClick={() => navigate('/home')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-bold text-gray-900">🏨 SheyRooms Admin</h1>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search bookings, users, rooms"
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* ✅ Stats Dashboard */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-white/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Rooms</p>
                  <p className="text-2xl font-bold">{stats.totalRooms}</p>
                </div>
                <Building className="h-8 w-8 text-white/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-white/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Revenue</p>
                  <p className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-white/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ✅ Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-8">
          {[
            { key: 'bookings', label: 'Bookings', icon: Calendar },
            { key: 'rooms', label: 'Rooms', icon: Building },
            { key: 'users', label: 'Users', icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === key
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* ✅ Enhanced Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              {activeTab === 'bookings' && 'Monitor reservations'}
              {activeTab === 'rooms' && 'Manage properties'}
              {activeTab === 'users' && 'User management'}
            </h3>

            <div className="space-y-4">
              {activeTab === 'bookings' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Time period</label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => fetchBookings()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </>
              )}

              {activeTab === 'rooms' && (
                <>
                  <Dialog open={showAddRoomDialog} onOpenChange={setShowAddRoomDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Room
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#111827',
                        fontSize: '16px',
                        zIndex: 9999
                      }}
                    >
                      <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                      />

                      <div className="relative z-50 bg-white rounded-lg p-6">
                        <DialogHeader className="pb-6 border-b border-gray-200">
                          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
                            🏨 Add New Room
                          </DialogTitle>
                          <p className="text-sm text-gray-600 text-center mt-2">
                            Fill in the details below to add a new room to your property
                          </p>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          {/* Left Column */}
                          <div className="space-y-5">
                            <div>
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Room Name <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder="e.g., Deluxe Suite"
                                value={roomForm.name}
                                onChange={(e) => setRoomForm(prev => ({ ...prev, name: e.target.value }))}
                                className="h-12 text-base font-medium border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                style={{ fontSize: '16px', color: '#111827' }}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Price per Night <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                                  ₹
                                </span>
                                <Input
                                  type="number"
                                  placeholder="5000"
                                  value={roomForm.rentperday}
                                  onChange={(e) => setRoomForm(prev => ({ ...prev, rentperday: e.target.value }))}
                                  className="h-12 pl-8 text-base font-medium border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                  style={{ fontSize: '16px', color: '#111827' }}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Maximum Guests <span className="text-red-500">*</span>
                              </label>
                              <Input
                                type="number"
                                placeholder="4"
                                value={roomForm.maxcount}
                                onChange={(e) => setRoomForm(prev => ({ ...prev, maxcount: e.target.value }))}
                                className="h-12 text-base font-medium border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                style={{ fontSize: '16px', color: '#111827' }}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Phone Number
                              </label>
                              <Input
                                placeholder="9876543210"
                                value={roomForm.phonenumber}
                                onChange={(e) => setRoomForm(prev => ({ ...prev, phonenumber: e.target.value }))}
                                className="h-12 text-base font-medium border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                style={{ fontSize: '16px', color: '#111827' }}
                              />
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-5">
                            <div>
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Room Type <span className="text-red-500">*</span>
                              </label>
                              <Select
                                value={roomForm.type}
                                onValueChange={(value) => setRoomForm(prev => ({ ...prev, type: value }))}
                              >
                                <SelectTrigger className="h-12 text-base font-medium border-2 border-gray-300 focus:border-orange-500">
                                  <SelectValue placeholder="Select room type" style={{ fontSize: '16px', color: '#111827' }} />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-2 border-gray-200 shadow-lg z-[9999]">
                                  <SelectItem value="Standard" className="text-base font-medium text-gray-800 hover:bg-orange-50">
                                    Standard Room
                                  </SelectItem>
                                  <SelectItem value="Deluxe" className="text-base font-medium text-gray-800 hover:bg-orange-50">
                                    Deluxe Room
                                  </SelectItem>
                                  <SelectItem value="Suite" className="text-base font-medium text-gray-800 hover:bg-orange-50">
                                    Suite
                                  </SelectItem>
                                  <SelectItem value="Presidential" className="text-base font-medium text-gray-800 hover:bg-orange-50">
                                    Presidential Suite
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Image URL 1
                              </label>
                              <Input
                                placeholder="https://example.com/image1.jpg"
                                value={roomForm.imageurl1}
                                onChange={(e) => setRoomForm(prev => ({ ...prev, imageurl1: e.target.value }))}
                                className="h-12 text-base font-medium border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                style={{ fontSize: '16px', color: '#111827' }}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Image URL 2
                              </label>
                              <Input
                                placeholder="https://example.com/image2.jpg"
                                value={roomForm.imageurl2}
                                onChange={(e) => setRoomForm(prev => ({ ...prev, imageurl2: e.target.value }))}
                                className="h-12 text-base font-medium border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                style={{ fontSize: '16px', color: '#111827' }}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Image URL 3
                              </label>
                              <Input
                                placeholder="https://example.com/image3.jpg"
                                value={roomForm.imageurl3}
                                onChange={(e) => setRoomForm(prev => ({ ...prev, imageurl3: e.target.value }))}
                                className="h-12 text-base font-medium border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                                style={{ fontSize: '16px', color: '#111827' }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Description Field - Full Width */}
                        <div className="mt-6">
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Room Description <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            placeholder="Describe the room features, amenities, and special highlights..."
                            rows={4}
                            value={roomForm.description}
                            onChange={(e) => setRoomForm(prev => ({ ...prev, description: e.target.value }))}
                            className="text-base font-medium border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-200 resize-none"
                            style={{ fontSize: '16px', color: '#111827', lineHeight: '1.5' }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Include details about bed type, room size, amenities, view, etc.
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddRoomDialog(false)
                              // Reset form on cancel
                              setRoomForm({
                                name: '', rentperday: '', maxcount: '', description: '',
                                phonenumber: '', type: '', imageurl1: '', imageurl2: '', imageurl3: ''
                              })
                            }}
                            className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 hover:bg-gray-50"
                            style={{ fontSize: '16px' }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddRoom}
                            disabled={addingRoom || !roomForm.name || !roomForm.rentperday || !roomForm.type || !roomForm.description}
                            className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontSize: '16px' }}
                          >
                            {addingRoom ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                                Adding Room...
                              </div>
                            ) : (
                              'Add Room'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="w-full mt-4" onClick={() => fetchRooms()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Rooms
                  </Button>
                </>
              )}


              {activeTab === 'users' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by role</label>
                    <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                        <SelectItem value="user">Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => fetchUsers()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Users
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Quick stats for current tab */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-700">
                  {activeTab === 'bookings' && getFilteredBookings().length}
                  {activeTab === 'rooms' && rooms.length}
                  {activeTab === 'users' && getFilteredUsers().length}
                </p>
                <p className="text-sm text-orange-600">
                  {activeTab === 'bookings' && 'Filtered Bookings'}
                  {activeTab === 'rooms' && 'Total Rooms'}
                  {activeTab === 'users' && 'Filtered Users'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Enhanced Main Content */}
        <div className="flex-1 p-6">
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    📊 Booking Management
                  </CardTitle>
                  <Badge variant="secondary" className="text-sm font-medium">
                    {getFilteredBookings().length} bookings
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <LoadingSpinner />
                ) : bookingsError ? (
                  <ErrorMessage message={bookingsError} onRetry={fetchBookings} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Booking ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Guest</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Room</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Check-in</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Check-out</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredBookings().length > 0 ? (
                          getFilteredBookings().map((booking) => (
                            <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <code className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                  {booking._id?.slice(-8)}
                                </code>
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-sm">{booking.userid?.name || 'N/A'}</p>
                                  <p className="text-xs text-gray-500">{booking.userid?.email}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium">{booking.room}</td>
                              <td className="py-3 px-4 text-sm">{new Date(booking.fromdate).toLocaleDateString()}</td>
                              <td className="py-3 px-4 text-sm">{new Date(booking.todate).toLocaleDateString()}</td>
                              <td className="py-3 px-4 font-semibold text-green-600">
                                ₹{booking.totalamount?.toLocaleString() || '0'}
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={`text-white text-xs ${getStatusColor(booking.status)}`}>
                                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="text-xs">
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-gray-500">
                              No bookings found matching your criteria
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    🏨 Room Management
                  </CardTitle>
                  <Badge variant="secondary" className="text-sm font-medium">
                    {rooms.length} rooms
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {roomsLoading ? (
                  <LoadingSpinner />
                ) : roomsError ? (
                  <ErrorMessage message={roomsError} onRetry={fetchRooms} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Room ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Price/Night</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Max Guests</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.length > 0 ? (
                          rooms.map((room) => (
                            <tr key={room._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <code className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                                  {room._id?.slice(-6)}
                                </code>
                              </td>
                              <td className="py-3 px-4 font-medium">{room.name}</td>
                              <td className="py-3 px-4">
                                <Badge variant="secondary" className="text-xs">
                                  {room.type}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 font-semibold text-green-600">
                                ₹{room.rentperday?.toLocaleString()}
                              </td>
                              <td className="py-3 px-4">👥 {room.maxcount}</td>
                              <td className="py-3 px-4 text-sm">📞 {room.phonenumber}</td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="text-xs">
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-gray-500">
                              No rooms found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    👥 User Management
                  </CardTitle>
                  <Badge variant="secondary" className="text-sm font-medium">
                    {getFilteredUsers().length} users
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <LoadingSpinner />
                ) : usersError ? (
                  <ErrorMessage message={usersError} onRetry={fetchUsers} />
                ) : (
                  <div className="space-y-4">
                    {getFilteredUsers().length > 0 ? (
                      getFilteredUsers().map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.profileImage} />
                              <AvatarFallback className="bg-orange-100 text-orange-700">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <Badge className={user.isAdmin ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}>
                              {user.isAdmin ? '👑 Admin' : '👤 User'}
                            </Badge>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3 mr-1" />
                                {user.isAdmin ? 'Manage' : 'Edit'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No users found matching your criteria
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ✅ Enhanced Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>© 2025 SheyRooms Admin Dashboard</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
