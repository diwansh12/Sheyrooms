import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button.tsx";
import { Input } from "../Components/ui/input.tsx";
import { Card, CardContent } from "../Components/ui/card.tsx";
import { Badge } from "../Components/ui/badge.tsx";
import { Switch } from "../Components/ui/switch.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../Components/ui/dialog.tsx";
import { 
  Camera,
  Share2,
  Mail,
  Phone,
  Shield,
  Key,
  CreditCard,
  Plus,
  Bell,
  User as UserIcon,
  Globe,
  MapPin,
  Clock,
  Smartphone,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Upload,
  X,
  Monitor,
  Lock,
  Unlock,
  AlertTriangle,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Building,
  Calendar,
  Save,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { authAPI } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

// Enhanced interfaces
interface NotificationSettings {
  bookingUpdates: boolean;
  priceDropsDeals: boolean;
  messagesFromHosts: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'paypal' | 'amex';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  isDefault: boolean;
  cardholderName?: string;
}

interface LoginDevice {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface GovernmentId {
  id: string;
  type: 'passport' | 'license' | 'national_id';
  number: string;
  issuedDate: string;
  expiryDate: string;
  isVerified: boolean;
  verifiedDate?: string;
  documentUrl?: string;
}

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  timezone: string;
  isAdmin?: boolean;
  createdAt?: string;
  profileImage?: string;
  preferences?: {
    propertyTypes: string[];
    amenities: string[];
  };
  notifications: NotificationSettings;
  twoFactorEnabled: boolean;
  governmentId?: GovernmentId;
}

export default function Profilescreen() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const govIdInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Image preview states
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [govIdPreview, setGovIdPreview] = useState<string>('');
  const [selectedGovIdFile, setSelectedGovIdFile] = useState<File | null>(null);
  
  // Modal states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditPaymentDialog, setShowEditPaymentDialog] = useState(false);
  const [showDevicesDialog, setShowDevicesDialog] = useState(false);
  const [showIdDialog, setShowIdDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [phoneInput, setPhoneInput] = useState('');
  
  // Payment method editing states
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const [newPaymentForm, setNewPaymentForm] = useState({
    type: 'visa',
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  
  // Data states
  const [profileData, setProfileData] = useState<ProfileData>({
    _id: '',
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    timezone: '',
    isAdmin: false,
    createdAt: '',
    preferences: {
      propertyTypes: ['Hotels', 'Apartments', 'Resorts'],
      amenities: ['Wi-Fi', 'Pool', 'Gym', 'Breakfast']
    },
    notifications: {
      bookingUpdates: true,
      priceDropsDeals: true,
      messagesFromHosts: false,
      emailNotifications: true,
      smsNotifications: false
    },
    twoFactorEnabled: false
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      cardholderName: 'John Doe',
      isDefault: true
    },
    {
      id: '2',
      type: 'paypal',
      email: 'user@example.com',
      isDefault: false
    }
  ]);

  const [loginDevices, setLoginDevices] = useState<LoginDevice[]>([
    {
      id: '1',
      deviceName: 'MacBook Pro',
      deviceType: 'desktop',
      browser: 'Chrome 119',
      location: 'Mumbai, India',
      lastActive: '2 minutes ago',
      isCurrent: true
    },
    {
      id: '2',
      deviceName: 'iPhone 15',
      deviceType: 'mobile',
      browser: 'Safari Mobile',
      location: 'Mumbai, India',
      lastActive: '1 hour ago',
      isCurrent: false
    }
  ]);

  // Fetch profile data
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (authUser) {
        const userData = {
          ...profileData,
          _id: authUser._id,
          name: authUser.name,
          email: authUser.email,
          isAdmin: authUser.isAdmin || false,
          createdAt: authUser.createdAt || '',
          phone: authUser.phone || '',
          country: authUser.country || '',
          city: authUser.city || '',
          timezone: authUser.timezone || ''
        };
        setProfileData(userData);
        setPhoneInput(userData.phone || '');
        
        // Set profile image preview if exists
        if (authUser.profileImage) {
          setProfileImagePreview(authUser.profileImage);
        }
      }
      
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Photo upload handler
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);
    setSelectedProfileFile(file);

    setUploadingPhoto(true);
    setError('');

    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backendImageUrl = previewUrl;
      setProfileData(prev => ({ ...prev, profileImage: backendImageUrl }));
      setSuccessMessage('Profile photo updated successfully!');
      
    } catch (err: any) {
      setError('Failed to upload photo. Please try again.');
      setProfileImagePreview(profileData.profileImage || '');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleGovIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      setError('Document size must be less than 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image (JPG, PNG) or PDF file');
      return;
    }

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setGovIdPreview(previewUrl);
    }
    setSelectedGovIdFile(file);

    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('govId', file);

      // TODO: Replace with actual API call
      // const response = await authAPI.uploadGovernmentId(formData);

      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccessMessage('Government ID uploaded successfully! Verification pending.');
      setShowIdDialog(false);
      
    } catch (err: any) {
      setError('Failed to upload document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Phone number update handler
  const handlePhoneUpdate = async () => {
    if (!phoneInput) {
      setError('Please enter a valid phone number');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfileData(prev => ({ ...prev, phone: phoneInput }));
      setSuccessMessage('Phone number updated successfully!');
      setShowPhoneDialog(false);
      
    } catch (err: any) {
      setError('Failed to update phone number. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Payment method edit handlers
  const handleEditPayment = (payment: PaymentMethod) => {
    setEditingPayment(payment);
    setPaymentForm({
      cardholderName: payment.cardholderName || '',
      cardNumber: `**** **** **** ${payment.last4}` || '',
      expiryMonth: payment.expiryMonth?.toString() || '',
      expiryYear: payment.expiryYear?.toString() || '',
      cvv: ''
    });
    setShowEditPaymentDialog(true);
  };

  const handleSavePaymentMethod = async () => {
    if (!editingPayment) return;

    setSaving(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === editingPayment.id 
            ? { ...method, cardholderName: paymentForm.cardholderName }
            : method
        )
      );
      
      setSuccessMessage('Payment method updated successfully!');
      setShowEditPaymentDialog(false);
      setEditingPayment(null);
      
    } catch (err: any) {
      setError('Failed to update payment method. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Add new payment method handler
  const handleAddPaymentMethod = async () => {
    if (!newPaymentForm.cardNumber || !newPaymentForm.cardholderName || 
        !newPaymentForm.expiryMonth || !newPaymentForm.expiryYear || !newPaymentForm.cvv) {
      setError('Please fill in all payment details');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: newPaymentForm.type as 'visa' | 'mastercard' | 'paypal' | 'amex',
        last4: newPaymentForm.cardNumber.slice(-4),
        expiryMonth: parseInt(newPaymentForm.expiryMonth),
        expiryYear: parseInt(newPaymentForm.expiryYear),
        cardholderName: newPaymentForm.cardholderName,
        isDefault: paymentMethods.length === 0
      };
      
      setPaymentMethods(prev => [...prev, newMethod]);
      setSuccessMessage('Payment method added successfully!');
      setShowAddPaymentDialog(false);
      setNewPaymentForm({
        type: 'visa',
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
      });
      
    } catch (err: any) {
      setError('Failed to add payment method. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Password update handler
  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Password updated successfully!');
      setShowPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      setError('Failed to update password. Please check your current password.');
    } finally {
      setSaving(false);
    }
  };

  // 2FA setup handler
  const handleSetup2FA = async () => {
    setSaving(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/SheyRooms:user@example.com?secret=ABCD1234&issuer=SheyRooms');
      setBackupCodes(['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345', 'PQR678', 'STU901', 'VWX234']);
      
    } catch (err: any) {
      setError('Failed to setup 2FA. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Enable 2FA handler
  const handleEnable2FA = async () => {
    if (!twoFactorCode) {
      setError('Please enter the verification code');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfileData(prev => ({ ...prev, twoFactorEnabled: true }));
      setSuccessMessage('Two-factor authentication enabled successfully!');
      setShow2FADialog(false);
      setTwoFactorCode('');
      
    } catch (err: any) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Share profile handler
  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileData._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData.name}'s Profile - SheyRooms`,
          text: `Check out ${profileData.name}'s verified profile on SheyRooms`,
          url: profileUrl
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      setSuccessMessage('Profile link copied to clipboard!');
    }
    setShowShareDialog(false);
  };

  // Copy to clipboard handler
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSuccessMessage('Copied to clipboard!');
  };

  const formatMemberSince = (dateString: string | undefined) => {
    if (!dateString) return 'Member since 2022';
    try {
      const date = new Date(dateString);
      return `Member since ${date.getFullYear()}`;
    } catch {
      return 'Member since 2022';
    }
  };

  // Generate profile image with proper fallback
  const getProfileImageUrl = () => {
    if (profileImagePreview) return profileImagePreview;
    if (profileData.profileImage) return profileData.profileImage;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&size=96&background=3b82f6&color=ffffff&rounded=true`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center font-['Inter',_sans-serif]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-['Inter',_sans-serif]">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/home')}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm hidden sm:block">Back to Home</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <button onClick={() => navigate('/')} className="text-blue-600 font-bold text-xl hover:text-blue-700 transition-colors">
                SheyRooms
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600 hidden sm:block">Account Settings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm font-medium text-green-800 flex-1">{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="ml-auto hover:bg-green-100 p-1 rounded-md transition-colors">
              <X className="w-4 h-4 text-green-600" />
            </button>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm font-medium text-red-800 flex-1">{error}</span>
            <button onClick={() => setError('')} className="ml-auto hover:bg-red-100 p-1 rounded-md transition-colors">
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Header */}
          <Card className="overflow-hidden shadow-lg border-0 bg-white">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                    <img
                      src={getProfileImageUrl()}
                      alt={profileData.name || 'Profile'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&size=96&background=3b82f6&color=ffffff&rounded=true`;
                      }}
                    />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute -bottom-2 -right-2 bg-white border-2 border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
                  >
                    {uploadingPhoto ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      <Camera className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileData.name || 'Loading...'}</h1>
                  <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600 mb-4">
                    <span className="font-medium">{formatMemberSince(profileData.createdAt)}</span>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="font-medium">Verified</span>
                    </div>
                    {profileData.isAdmin && (
                      <Badge variant="secondary" className="text-xs font-semibold bg-blue-100 text-blue-800">Admin</Badge>
                    )}
                    {profileData.twoFactorEnabled && (
                      <Badge className="bg-green-100 text-green-800 text-xs font-semibold">2FA Enabled</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center space-x-2 font-medium border-2 hover:bg-blue-50 hover:border-blue-300">
                          <Share2 className="w-4 h-4" />
                          <span>Share Profile</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md rounded-xl shadow-2xl border-0 bg-white">
                        <DialogHeader className="pb-4">
                          <DialogTitle className="text-xl font-bold text-gray-900">Share Your Profile</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <p className="text-sm text-gray-600 leading-relaxed">
                            Share your verified SheyRooms profile with others to build trust and credibility.
                          </p>
                          <div className="flex items-center space-x-2">
                            <Input
                              value={`${window.location.origin}/profile/${profileData._id}`}
                              readOnly
                              className="flex-1 text-sm bg-gray-50 border-2"
                            />
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(`${window.location.origin}/profile/${profileData._id}`)}
                              className="px-3 py-2"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex space-x-3">
                            <Button onClick={handleShareProfile} className="flex-1 font-medium py-2.5">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                            <Button variant="outline" onClick={() => setShowShareDialog(false)} className="flex-1 font-medium py-2.5">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center space-x-2 font-medium border-2 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                      <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">Email Address</h3>
                      <p className="text-sm text-gray-600">Your primary contact email</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-base">{profileData.email}</p>
                    <p className="text-xs text-green-600 font-medium">Verified</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">Phone Number</h3>
                      <p className="text-sm text-gray-600">For booking confirmations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-base">{profileData.phone || 'Not provided'}</p>
                    {!profileData.phone ? (
                      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="mt-1 font-medium">Add Phone</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-xl shadow-2xl border-0 bg-white">
                          <DialogHeader className="pb-4">
                            <DialogTitle className="text-xl font-bold">Add Phone Number</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number
                              </label>
                              <Input
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                placeholder="+1 234 567 8900"
                                className="border-2"
                              />
                            </div>
                            
                            <div className="flex space-x-3">
                              <Button onClick={handlePhoneUpdate} disabled={saving} className="flex-1 font-medium py-2.5">
                                {saving ? 'Saving...' : 'Save Phone'}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowPhoneDialog(false)}
                                className="flex-1 font-medium py-2.5"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowPhoneDialog(true)}
                        className="mt-1 font-medium"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">
                        {profileData.twoFactorEnabled ? 'Extra security is enabled' : 'Add extra security to your account'}
                      </p>
                    </div>
                  </div>
                  <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant={profileData.twoFactorEnabled ? "outline" : "default"}
                        className={`font-medium ${profileData.twoFactorEnabled ? "text-red-600 border-red-600 hover:bg-red-50" : ""}`}
                      >
                        {profileData.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-xl shadow-2xl border-0 bg-white">
                      <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-bold">
                          {profileData.twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
                        </DialogTitle>
                      </DialogHeader>
                      {!profileData.twoFactorEnabled ? (
                        <div className="space-y-6">
                          {!qrCodeUrl ? (
                            <div>
                              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                Two-factor authentication adds an extra layer of security to your account by requiring both your password and a verification code.
                              </p>
                              <Button onClick={handleSetup2FA} disabled={saving} className="w-full font-medium py-2.5">
                                {saving ? 'Setting up...' : 'Setup 2FA'}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="text-center">
                                <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto mb-4 rounded-lg shadow-md" />
                                <p className="text-sm text-gray-600">
                                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                                </p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Enter verification code
                                </label>
                                <Input
                                  value={twoFactorCode}
                                  onChange={(e) => setTwoFactorCode(e.target.value)}
                                  placeholder="000000"
                                  maxLength={6}
                                  className="text-center text-lg tracking-widest font-mono"
                                />
                              </div>
                              
                              <div className="flex space-x-3">
                                <Button onClick={handleEnable2FA} disabled={saving} className="flex-1 font-medium py-2.5">
                                  {saving ? 'Verifying...' : 'Enable 2FA'}
                                </Button>
                                <Button variant="outline" onClick={() => setShow2FADialog(false)} className="flex-1 font-medium py-2.5">
                                  Cancel
                                </Button>
                              </div>
                              
                              {backupCodes.length > 0 && (
                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                                  <h4 className="font-semibold text-yellow-800 mb-2">Backup Codes</h4>
                                  <p className="text-xs text-yellow-700 mb-3 leading-relaxed">
                                    Save these codes in a safe place. You can use them to access your account if you lose your phone.
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {backupCodes.map((code, index) => (
                                      <div key={index} className="bg-white p-2 rounded text-xs font-mono text-center shadow-sm">
                                        {code}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-red-900">Warning</h4>
                                <p className="text-sm text-red-700 mt-1 leading-relaxed">
                                  This will disable two-factor authentication and make your account less secure.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <Button 
                              variant="destructive" 
                              onClick={() => {
                                setProfileData(prev => ({ ...prev, twoFactorEnabled: false }));
                                setShow2FADialog(false);
                                setSuccessMessage('Two-factor authentication disabled');
                              }}
                              className="flex-1 font-medium py-2.5"
                            >
                              Disable 2FA
                            </Button>
                            <Button variant="outline" onClick={() => setShow2FADialog(false)} className="flex-1 font-medium py-2.5">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Key className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">Password</h3>
                      <p className="text-sm text-gray-600">Change your account password</p>
                    </div>
                  </div>
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="font-medium">Update</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-xl shadow-2xl border-0 bg-white">
                      <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-bold">Update Password</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Current Password
                          </label>
                          <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="border-2"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            New Password
                          </label>
                          <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="border-2"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border-2"
                          />
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button onClick={handlePasswordUpdate} disabled={saving} className="flex-1 font-medium py-2.5">
                            {saving ? 'Updating...' : 'Update Password'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowPasswordDialog(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                            }}
                            className="flex-1 font-medium py-2.5"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center space-x-2 font-medium py-2.5">
                      <Plus className="w-4 h-4" />
                      <span>Add Payment Method</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-xl shadow-2xl border-0 bg-white">
                    <DialogHeader className="pb-4">
                      <DialogTitle className="text-xl font-bold">Add Payment Method</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Card Type
                        </label>
                        <Select 
                          value={newPaymentForm.type} 
                          onValueChange={(value) => setNewPaymentForm(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select card type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visa">Visa</SelectItem>
                            <SelectItem value="mastercard">MasterCard</SelectItem>
                            <SelectItem value="amex">American Express</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <Input
                          value={newPaymentForm.cardholderName}
                          onChange={(e) => setNewPaymentForm(prev => ({ ...prev, cardholderName: e.target.value }))}
                          className="border-2"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Card Number
                        </label>
                        <Input
                          value={newPaymentForm.cardNumber}
                          onChange={(e) => setNewPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                          className="border-2"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
                          <Select 
                            value={newPaymentForm.expiryMonth} 
                            onValueChange={(value) => setNewPaymentForm(prev => ({ ...prev, expiryMonth: value }))}
                          >
                            <SelectTrigger className="border-2">
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                  {month.toString().padStart(2, '0')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                          <Select 
                            value={newPaymentForm.expiryYear} 
                            onValueChange={(value) => setNewPaymentForm(prev => ({ ...prev, expiryYear: value }))}
                          >
                            <SelectTrigger className="border-2">
                              <SelectValue placeholder="YYYY" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                          <Input
                            value={newPaymentForm.cvv}
                            onChange={(e) => setNewPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                            placeholder="123"
                            maxLength={4}
                            className="border-2"
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button onClick={handleAddPaymentMethod} disabled={saving} className="flex-1 font-medium py-2.5">
                          {saving ? 'Adding...' : 'Add Payment Method'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddPaymentDialog(false)}
                          className="flex-1 font-medium py-2.5"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between py-6 border-2 border-gray-100 rounded-xl px-6 hover:border-gray-200 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                          {method.type === 'paypal' ? 'PayPal' : `${method.type.toUpperCase()} •••• ${method.last4}`}
                          {method.isDefault && <Badge className="ml-2 text-xs bg-blue-100 text-blue-800">Default</Badge>}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {method.type === 'paypal' 
                            ? method.email 
                            : `${method.cardholderName} • Expires ${method.expiryMonth}/${method.expiryYear}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditPayment(method)}
                        className="font-medium"
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 font-medium">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Payment Method Dialog */}
              <Dialog open={showEditPaymentDialog} onOpenChange={setShowEditPaymentDialog}>
                <DialogContent className="sm:max-w-md rounded-xl shadow-2xl border-0 bg-white">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="text-xl font-bold">Edit Payment Method</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <Input
                        value={paymentForm.cardholderName}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, cardholderName: e.target.value }))}
                        className="border-2"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Card Number
                      </label>
                      <Input
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                        className="border-2"
                        placeholder="**** **** **** 1234"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Card number cannot be changed for security reasons</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
                        <Select value={paymentForm.expiryMonth} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, expiryMonth: value }))}>
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                {month.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                        <Select value={paymentForm.expiryYear} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, expiryYear: value }))}>
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                        <Input
                          value={paymentForm.cvv}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                          placeholder="123"
                          maxLength={4}
                          className="border-2"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button onClick={handleSavePaymentMethod} disabled={saving} className="flex-1 font-medium py-2.5">
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowEditPaymentDialog(false)}
                        className="flex-1 font-medium py-2.5"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Identity Verification */}
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Identity Verification</h2>
              
              <div className="flex items-center justify-between py-6 bg-green-50 border-2 border-green-200 rounded-xl px-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Government ID</h3>
                    <p className="text-sm text-gray-600">
                      Status: <span className="text-green-600 font-medium">Verified</span> • Updated Aug 2024
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Dialog open={showIdDialog} onOpenChange={setShowIdDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="font-medium">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-xl shadow-2xl border-0 bg-white">
                      <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-bold">Government ID Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="bg-gray-50 border-2 border-gray-100 p-6 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-4 text-base">Document Information</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Type:</span>
                              <span className="font-medium">Passport</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Number:</span>
                              <span className="font-medium">***1234</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Verified:</span>
                              <span className="text-green-600 font-medium">Aug 15, 2024</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-base">Update Document</h4>
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                              ref={govIdInputRef}
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleGovIdUpload}
                              className="hidden"
                            />
                            {govIdPreview ? (
                              <div className="space-y-3">
                                <img
                                  src={govIdPreview}
                                  alt="ID Preview"
                                  className="max-w-full h-32 object-cover mx-auto rounded-lg"
                                />
                                <p className="text-sm text-gray-600">New document selected</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Upload new government ID</p>
                                  <p className="text-xs text-gray-500">PNG, JPG or PDF up to 10MB</p>
                                </div>
                              </div>
                            )}
                            <Button
                              onClick={() => govIdInputRef.current?.click()}
                              disabled={saving}
                              className="mt-4 font-medium"
                            >
                              {saving ? 'Uploading...' : 'Choose File'}
                            </Button>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => setShowIdDialog(false)} 
                          className="w-full font-medium py-2.5"
                        >
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button size="sm" variant="outline" className="font-medium">
                    <Edit className="w-4 h-4 mr-1" />
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Login Devices */}
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Active Login Sessions</h2>
                  <p className="text-sm text-gray-600 mt-1">{loginDevices.length} devices currently signed in</p>
                </div>
                <Dialog open={showDevicesDialog} onOpenChange={setShowDevicesDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="font-medium">Manage Devices</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl rounded-xl shadow-2xl border-0 bg-white">
                    <DialogHeader className="pb-4">
                      <DialogTitle className="text-xl font-bold">Manage Login Devices</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {loginDevices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                              {device.deviceType === 'mobile' ? (
                                <Smartphone className="w-6 h-6 text-gray-600" />
                              ) : (
                                <Monitor className="w-6 h-6 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-base">
                                {device.deviceName}
                                {device.isCurrent && <Badge className="ml-2 text-xs bg-blue-100 text-blue-800">Current</Badge>}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {device.browser} • {device.location}
                              </p>
                              <p className="text-xs text-gray-500">Last active: {device.lastActive}</p>
                            </div>
                          </div>
                          {!device.isCurrent && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setLoginDevices(prev => prev.filter(d => d.id !== device.id));
                                setSuccessMessage('Device signed out successfully');
                              }}
                              className="text-red-600 border-red-600 hover:bg-red-50 font-medium"
                            >
                              Sign Out
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-3 pt-4 border-t-2">
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          setLoginDevices(prev => prev.filter(device => device.isCurrent));
                          setSuccessMessage('All other devices signed out');
                          setShowDevicesDialog(false);
                        }}
                        className="flex-1 font-medium py-2.5"
                      >
                        Sign Out All Other Devices
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowDevicesDialog(false)}
                        className="flex-1 font-medium py-2.5"
                      >
                        Close
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {loginDevices.slice(0, 3).map((device) => (
                  <div key={device.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        {device.deviceType === 'mobile' ? (
                          <Smartphone className="w-6 h-6 text-gray-600" />
                        ) : (
                          <Monitor className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base">
                          {device.deviceName}
                          {device.isCurrent && <Badge className="ml-2 text-xs bg-blue-100 text-blue-800">Current</Badge>}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {device.browser} • {device.location} • {device.lastActive}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Notification Preferences</h2>
              
              <div className="space-y-6">
                {[
                  {
                    key: 'bookingUpdates' as keyof NotificationSettings,
                    title: 'Booking Updates',
                    description: 'Get notified about your reservation status'
                  },
                  {
                    key: 'priceDropsDeals' as keyof NotificationSettings,
                    title: 'Price Drops & Special Deals',
                    description: 'Receive alerts for discounts and promotions'
                  },
                  {
                    key: 'messagesFromHosts' as keyof NotificationSettings,
                    title: 'Messages from Hosts',
                    description: 'Communication from property owners'
                  },
                  {
                    key: 'emailNotifications' as keyof NotificationSettings,
                    title: 'Email Notifications',
                    description: 'Receive notifications via email'
                  },
                  {
                    key: 'smsNotifications' as keyof NotificationSettings,
                    title: 'SMS Notifications',
                    description: 'Receive notifications via text message'
                  }
                ].map(({ key, title, description }) => (
                  <div key={key} className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                    <Switch 
                      checked={profileData.notifications[key]}
                      onCheckedChange={(checked) => {
                        setProfileData(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [key]: checked
                          }
                        }));
                        setTimeout(() => {
                          setSuccessMessage('Notification preferences updated');
                        }, 300);
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 font-medium"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="text-base border-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <Input
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="text-base border-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    className="text-base border-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country/Region</label>
                  <Select disabled={!isEditing} value={profileData.country} onValueChange={(value) => setProfileData(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger className="text-base border-2">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <Input
                    value={profileData.city}
                    onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your city"
                    className="text-base border-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                  <Select disabled={!isEditing} value={profileData.timezone} onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger className="text-base border-2">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                      <SelectItem value="pst">PST (UTC-8)</SelectItem>
                      <SelectItem value="est">EST (UTC-5)</SelectItem>
                      <SelectItem value="cst">CST (UTC-6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex space-x-4 mt-8 pt-6 border-t-2 border-gray-100">
                  <Button 
                    onClick={() => {
                      setIsEditing(false);
                      setSuccessMessage('Profile updated successfully!');
                    }}
                    disabled={saving}
                    className="flex-1 font-medium py-2.5"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 font-medium py-2.5"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Travel Preferences */}
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Travel Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Property Types</h3>
                  <div className="p-6 border-2 border-gray-100 rounded-xl bg-gray-50">
                    <p className="text-gray-700 text-base font-medium">
                      {profileData.preferences?.propertyTypes.join(', ') || 'Hotels, Apartments, Resorts'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Amenities</h3>
                  <div className="p-6 border-2 border-gray-100 rounded-xl bg-gray-50">
                    <p className="text-gray-700 text-base font-medium">
                      {profileData.preferences?.amenities.join(', ') || 'Wi-Fi, Pool, Gym, Breakfast'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 shadow-lg bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-red-900 mb-8">Danger Zone</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b-2 border-red-100">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">Sign Out All Devices</h3>
                    <p className="text-sm text-gray-600">This will sign you out of all devices except this one</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setLoginDevices(prev => prev.filter(device => device.isCurrent));
                      setSuccessMessage('All other devices signed out successfully');
                    }}
                    className="text-red-600 border-red-600 hover:bg-red-50 font-medium"
                  >
                    Sign Out All
                  </Button>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">Delete Account</h3>
                    <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                  </div>
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center space-x-2 text-red-600 hover:bg-red-50 font-medium">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Account</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-xl shadow-2xl border-0 bg-white">
                      <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-bold text-red-900">Delete Account</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-red-900">Warning</h4>
                              <p className="text-sm text-red-700 mt-1 leading-relaxed">
                                This action cannot be undone. This will permanently delete your account and remove all data from our servers.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-3">
                            Please type <strong>DELETE</strong> to confirm:
                          </p>
                          <Input placeholder="Type DELETE here" className="border-2" />
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button variant="destructive" className="flex-1 font-medium py-2.5">
                            I understand, delete my account
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowDeleteDialog(false)}
                            className="flex-1 font-medium py-2.5"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t-2 border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Current Route: /profile</p>
        </div>
      </div>
    </div>
  );
}