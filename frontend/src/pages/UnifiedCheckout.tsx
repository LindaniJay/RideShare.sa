import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { containerVariants, itemVariants } from '../utils/motionVariants';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, CreditCard, CheckCircle, AlertCircle, User, Phone, FileText, Clock, DollarSign } from 'lucide-react';
import { getApiBaseUrl } from '../utils/apiConfig';

interface Listing {
  id: number;
  hostId: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  price_per_day?: number;
  image: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  city: string;
  description?: string;
  features?: string[] | any;
  fuelType?: string;
  transmission?: string;
  seats?: number;
  mileage?: number;
  host?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone_number?: string;
  };
}

interface BookingFormData {
  startDate: string;
  endDate: string;
  pickupLocation: string;
  returnLocation: string;
  pickupTime: string;
  returnTime: string;
  specialRequests: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  agreeToTerms: boolean;
  driverLicense?: File | null;
  idDocument?: File | null;
  selfieVerification?: File | null;
}

type CheckoutStep = 'dates' | 'details' | 'review' | 'payment' | 'confirmation';

const UnifiedCheckout: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('dates');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [_unavailableDates, setUnavailableDates] = useState<string[]>([]);
  
  const [bookingData, setBookingData] = useState<BookingFormData>({
    startDate: '',
    endDate: '',
    pickupLocation: listing?.city || '',
    returnLocation: listing?.city || '',
    pickupTime: '10:00',
    returnTime: '10:00',
    specialRequests: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    agreeToTerms: false,
    driverLicense: null,
    idDocument: null,
    selfieVerification: null
  });

  const [days, setDays] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [insuranceFee, setInsuranceFee] = useState(0);
  const [vat, setVat] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (listingId) {
      fetchListing();
      fetchUnavailableDates();
    }
  }, [listingId]);

  useEffect(() => {
    if (listing && bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      setDays(diffDays);
      
      const pricePerDay = listing.pricePerDay || listing.price_per_day || 0;
      const base = diffDays * pricePerDay;
      const service = Math.round(base * 0.1); // 10% service fee
      const insurance = Math.round(base * 0.05); // 5% insurance fee
      const vatAmount = Math.round((base + service + insurance) * 0.15); // 15% VAT
      const total = base + service + insurance + vatAmount;
      
      setBasePrice(base);
      setServiceFee(service);
      setInsuranceFee(insurance);
      setVat(vatAmount);
      setTotalPrice(total);
    }
  }, [bookingData.startDate, bookingData.endDate, listing]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/listings/${listingId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listing');
      }
      
      const data = await response.json();
      
      if (data.success || data.data) {
        const listingData = data.data || data;
        setListing(listingData);
        setBookingData(prev => ({
          ...prev,
          pickupLocation: listingData.city || '',
          returnLocation: listingData.city || ''
        }));
      } else {
        throw new Error(data.error || 'Failed to fetch listing');
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast.error('Failed to load vehicle details');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnavailableDates = async () => {
    if (!listingId) return;
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/bookings/unavailable/${listingId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.dates) {
          setUnavailableDates(data.dates);
        }
      }
    } catch (error) {
      console.error('Error fetching unavailable dates:', error);
      // Silently fail - unavailable dates are optional
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: string | boolean) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: CheckoutStep): boolean => {
    switch (step) {
      case 'dates':
        if (!bookingData.startDate || !bookingData.endDate) {
          toast.error('Please select both start and end dates');
          return false;
        }
        if (days <= 0) {
          toast.error('End date must be after start date');
          return false;
        }
        if (new Date(bookingData.startDate) < new Date()) {
          toast.error('Start date cannot be in the past');
          return false;
        }
        return true;
      
      case 'details':
        if (!bookingData.pickupLocation || !bookingData.returnLocation) {
          toast.error('Please specify pickup and return locations');
          return false;
        }
        if (!bookingData.emergencyContactName || !bookingData.emergencyContactPhone) {
          toast.error('Please provide emergency contact information');
          return false;
        }
        return true;
      
      case 'review':
        if (!bookingData.agreeToTerms) {
          toast.error('Please accept the terms and conditions');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const steps: CheckoutStep[] = ['dates', 'details', 'review', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: CheckoutStep[] = ['dates', 'details', 'review', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleBooking = async () => {
    if (!user?.uid || !listing) return;
    
    if (!validateStep('review')) return;

    try {
      setBookingLoading(true);
      
      const token = await user.getIdToken();
      
      // Create FormData if documents are uploaded, otherwise use JSON
      const hasDocuments = bookingData.driverLicense || bookingData.idDocument || bookingData.selfieVerification;
      
      let requestBody: FormData | string;
      let headers: HeadersInit;
      
      if (hasDocuments) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('vehicleId', listing.id.toString());
        formData.append('startDate', `${bookingData.startDate}T${bookingData.pickupTime}:00`);
        formData.append('endDate', `${bookingData.endDate}T${bookingData.returnTime}:00`);
        formData.append('totalPrice', totalPrice.toString());
        formData.append('specialRequests', bookingData.specialRequests);
        formData.append('pickupLocation', bookingData.pickupLocation);
        formData.append('returnLocation', bookingData.returnLocation);
        formData.append('paymentMethod', paymentMethod);
        
        if (bookingData.driverLicense) {
          formData.append('driverLicense', bookingData.driverLicense);
        }
        if (bookingData.idDocument) {
          formData.append('idDocument', bookingData.idDocument);
        }
        if (bookingData.selfieVerification) {
          formData.append('selfieVerification', bookingData.selfieVerification);
        }
        
        requestBody = formData;
        headers = {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser will set it with boundary
        };
      } else {
        // Use JSON for regular booking
        requestBody = JSON.stringify({
          vehicleId: listing.id.toString(),
          startDate: `${bookingData.startDate}T${bookingData.pickupTime}:00`,
          endDate: `${bookingData.endDate}T${bookingData.returnTime}:00`,
          totalPrice: totalPrice,
          specialRequests: bookingData.specialRequests,
          pickupLocation: bookingData.pickupLocation,
          returnLocation: bookingData.returnLocation,
          paymentMethod: paymentMethod
        });
        headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      }
      
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/bookings/unified`, {
        method: 'POST',
        headers: headers,
        body: requestBody
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const data = await response.json();
      
      if (data.success) {
        setBookingId(data.data?.booking?.id || data.data?.bookingId || '');
        setCurrentStep('confirmation');
        toast.success('Booking created successfully! 🎉');
        
        // Emit custom event to refresh dashboards
        window.dispatchEvent(new CustomEvent('bookingCreated', { 
          detail: { booking: data.data?.booking || data.data } 
        }));
        
        // Navigate to renter dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard/renter');
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  // const isDateUnavailable = (date: string): boolean => {
  //   return unavailableDates.includes(date);
  // };

  const getMinEndDate = (): string => {
    if (!bookingData.startDate) return new Date().toISOString().split('T')[0];
    const start = new Date(bookingData.startDate);
    start.setDate(start.getDate() + 1);
    return start.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="page-background">
        <motion.div 
          className="min-h-screen p-4 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="bg-white/10 rounded-xl h-96 mb-8"></div>
              <div className="bg-white/10 rounded-xl h-64"></div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!listing) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-4 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard level={2} className="py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Vehicle Not Found</h2>
            <p className="text-white/70 mb-6">The vehicle you're looking for doesn't exist or is no longer available.</p>
            <GlassButton
              onClick={() => navigate('/search')}
              variant="primary"
              size="md"
            >
              Back to Search
            </GlassButton>
          </GlassCard>
        </div>
      </motion.div>
    );
  }

  const steps = [
    { id: 'dates', title: 'Select Dates', icon: Calendar },
    { id: 'details', title: 'Booking Details', icon: FileText },
    { id: 'review', title: 'Review', icon: CheckCircle },
    { id: 'payment', title: 'Payment', icon: CreditCard },
    { id: 'confirmation', title: 'Confirmed', icon: CheckCircle }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="page-background">
      <motion.div 
        className="min-h-screen p-4 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            variants={itemVariants}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white font-heading text-shadow-lg mb-4">
              Complete Your Booking
            </h1>
            <p className="text-white/70 text-lg font-body">
              {listing.make} {listing.model} • {listing.year}
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div variants={itemVariants} className="mb-8">
            <GlassCard level={2} className="p-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;
                  
                  return (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white scale-110' 
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-white/50'
                        }`}>
                          <StepIcon className="w-6 h-6" />
                        </div>
                        <span className={`text-sm font-medium ${
                          isActive ? 'text-white' : 'text-white/60'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                          isCompleted ? 'bg-green-500' : 'bg-white/10'
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard level={3} className="p-6">
                    {/* Step 1: Dates */}
                    {currentStep === 'dates' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Select Rental Dates</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              <Calendar className="w-4 h-4 inline mr-2" />
                              Pickup Date
                            </label>
                            <input
                              type="date"
                              value={bookingData.startDate}
                              onChange={(e) => handleInputChange('startDate', e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              <Calendar className="w-4 h-4 inline mr-2" />
                              Return Date
                            </label>
                            <input
                              type="date"
                              value={bookingData.endDate}
                              onChange={(e) => handleInputChange('endDate', e.target.value)}
                              min={getMinEndDate()}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              <Clock className="w-4 h-4 inline mr-2" />
                              Pickup Time
                            </label>
                            <input
                              type="time"
                              value={bookingData.pickupTime}
                              onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              <Clock className="w-4 h-4 inline mr-2" />
                              Return Time
                            </label>
                            <input
                              type="time"
                              value={bookingData.returnTime}
                              onChange={(e) => handleInputChange('returnTime', e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                          </div>
                        </div>

                        {days > 0 && (
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between text-white">
                              <span className="font-medium">Rental Duration</span>
                              <span className="text-lg font-bold">{days} {days === 1 ? 'day' : 'days'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Details */}
                    {currentStep === 'details' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Booking Details</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              <MapPin className="w-4 h-4 inline mr-2" />
                              Pickup Location
                            </label>
                            <input
                              type="text"
                              value={bookingData.pickupLocation}
                              onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                              placeholder="Enter pickup address"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              <MapPin className="w-4 h-4 inline mr-2" />
                              Return Location
                            </label>
                            <input
                              type="text"
                              value={bookingData.returnLocation}
                              onChange={(e) => handleInputChange('returnLocation', e.target.value)}
                              placeholder="Enter return address"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Special Requests (Optional)
                          </label>
                          <textarea
                            value={bookingData.specialRequests}
                            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                            placeholder="Any special requirements, requests, or notes..."
                            rows={4}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                          />
                        </div>

                        <div className="border-t border-white/10 pt-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Emergency Contact</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-white/80 mb-2">
                                <User className="w-4 h-4 inline mr-2" />
                                Contact Name
                              </label>
                              <input
                                type="text"
                                value={bookingData.emergencyContactName}
                                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                                placeholder="Full name"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/80 mb-2">
                                <Phone className="w-4 h-4 inline mr-2" />
                                Contact Phone
                              </label>
                              <input
                                type="tel"
                                value={bookingData.emergencyContactPhone}
                                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                                placeholder="+27 12 345 6789"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Review */}
                    {currentStep === 'review' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Review Your Booking</h2>
                        
                        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                          <h3 className="text-lg font-semibold text-white mb-4">Vehicle Information</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-white/60">Vehicle:</span>
                              <span className="text-white ml-2 font-medium">{listing.make} {listing.model} {listing.year}</span>
                            </div>
                            <div>
                              <span className="text-white/60">Location:</span>
                              <span className="text-white ml-2 font-medium">{listing.city}</span>
                            </div>
                            <div>
                              <span className="text-white/60">Pickup:</span>
                              <span className="text-white ml-2 font-medium">
                                {new Date(bookingData.startDate).toLocaleDateString()} at {bookingData.pickupTime}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/60">Return:</span>
                              <span className="text-white ml-2 font-medium">
                                {new Date(bookingData.endDate).toLocaleDateString()} at {bookingData.returnTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                          <h3 className="text-lg font-semibold text-white mb-4">Price Breakdown</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-white/70">
                              <span>Base Price ({days} days × R{listing.pricePerDay || listing.price_per_day})</span>
                              <span>R{basePrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-white/70">
                              <span>Service Fee (10%)</span>
                              <span>R{serviceFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-white/70">
                              <span>Insurance Fee (5%)</span>
                              <span>R{insuranceFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-white/70">
                              <span>VAT (15%)</span>
                              <span>R{vat.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-white/10 pt-2 mt-2">
                              <div className="flex justify-between text-white font-bold text-lg">
                                <span>Total</span>
                                <span>R{totalPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id="agreeToTerms"
                            checked={bookingData.agreeToTerms}
                            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-green-500 focus:ring-2 focus:ring-green-500"
                          />
                          <label htmlFor="agreeToTerms" className="text-white/80 text-sm">
                            I agree to the <a href="/terms" className="text-green-400 hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-green-400 hover:underline">Privacy Policy</a>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Payment */}
                    {currentStep === 'payment' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>
                        
                        <div className="space-y-4">
                          <button
                            onClick={() => setPaymentMethod('card')}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                              paymentMethod === 'card'
                                ? 'border-green-500 bg-green-500/20'
                                : 'border-white/20 bg-white/5 hover:border-white/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <CreditCard className="w-6 h-6 text-white" />
                                <div>
                                  <div className="text-white font-medium">Credit/Debit Card</div>
                                  <div className="text-white/60 text-sm">Visa, Mastercard, Amex</div>
                                </div>
                              </div>
                              {paymentMethod === 'card' && (
                                <CheckCircle className="w-6 h-6 text-green-400" />
                              )}
                            </div>
                          </button>

                          <button
                            onClick={() => setPaymentMethod('eft')}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                              paymentMethod === 'eft'
                                ? 'border-green-500 bg-green-500/20'
                                : 'border-white/20 bg-white/5 hover:border-white/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <DollarSign className="w-6 h-6 text-white" />
                                <div>
                                  <div className="text-white font-medium">Bank Transfer (EFT)</div>
                                  <div className="text-white/60 text-sm">Direct bank transfer</div>
                                </div>
                              </div>
                              {paymentMethod === 'eft' && (
                                <CheckCircle className="w-6 h-6 text-green-400" />
                              )}
                            </div>
                          </button>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between text-white font-bold text-xl">
                            <span>Total Amount</span>
                            <span>R{totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Confirmation */}
                    {currentStep === 'confirmation' && (
                      <div className="text-center space-y-6 py-8">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Booking Confirmed! 🎉</h2>
                        <p className="text-white/70 text-lg">
                          Your booking has been successfully created. You'll receive a confirmation email shortly.
                        </p>
                        {bookingId && (
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-white/60 text-sm">Booking ID</p>
                            <p className="text-white font-mono font-bold">{bookingId}</p>
                          </div>
                        )}
                        <div className="flex gap-4 justify-center">
                          <GlassButton
                            onClick={() => navigate('/renter/dashboard')}
                            variant="primary"
                            size="lg"
                          >
                            View My Bookings
                          </GlassButton>
                          <GlassButton
                            onClick={() => navigate('/search')}
                            variant="secondary"
                            size="lg"
                          >
                            Book Another Vehicle
                          </GlassButton>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    {currentStep !== 'confirmation' && (
                      <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                        <GlassButton
                          onClick={handleBack}
                          variant="secondary"
                          size="md"
                          disabled={currentStep === 'dates'}
                        >
                          Back
                        </GlassButton>
                        <GlassButton
                          onClick={currentStep === 'review' ? handleBooking : handleNext}
                          variant="primary"
                          size="md"
                          disabled={bookingLoading}
                          icon={bookingLoading ? <div className="animate-spin">⏳</div> : undefined}
                        >
                          {bookingLoading 
                            ? 'Processing...' 
                            : currentStep === 'review' 
                            ? 'Confirm & Pay' 
                            : 'Continue'
                          }
                        </GlassButton>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sidebar - Vehicle Summary */}
            <div className="lg:col-span-1">
              <motion.div variants={itemVariants}>
                <GlassCard level={3} className="sticky top-8 overflow-hidden">
                  <div className="relative">
                    <img
                      src={listing.image || listing.images?.[0]}
                      alt={`${listing.make} ${listing.model}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Available
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white font-heading mb-2">
                      {listing.make} {listing.model}
                    </h3>
                    <p className="text-white/70 font-body mb-4">
                      {listing.year} • {listing.city}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      {listing.seats && (
                        <div className="flex items-center space-x-2 text-white/70">
                          <Icon name="Users" size="sm" />
                          <span>{listing.seats} seats</span>
                        </div>
                      )}
                      {listing.fuelType && (
                        <div className="flex items-center space-x-2 text-white/70">
                          <Icon name="Fuel" size="sm" />
                          <span className="capitalize">{listing.fuelType}</span>
                        </div>
                      )}
                      {listing.transmission && (
                        <div className="flex items-center space-x-2 text-white/70">
                          <Icon name="Settings" size="sm" />
                          <span className="capitalize">{listing.transmission}</span>
                        </div>
                      )}
                      {listing.mileage && (
                        <div className="flex items-center space-x-2 text-white/70">
                          <Icon name="Gauge" size="sm" />
                          <span>{listing.mileage.toLocaleString()} km</span>
                        </div>
                      )}
                    </div>
                    
                    {listing.host && (
                      <div className="border-t border-white/10 pt-4">
                        <h4 className="text-white font-medium mb-2">Hosted by</h4>
                        <p className="text-white/70 text-sm">
                          {listing.host.firstName} {listing.host.lastName}
                        </p>
                      </div>
                    )}

                    {days > 0 && (
                      <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white/70 text-sm">Rental Period</span>
                          <span className="text-white font-medium">{days} {days === 1 ? 'day' : 'days'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-sm">Price per day</span>
                          <span className="text-white font-medium">R{listing.pricePerDay || listing.price_per_day}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UnifiedCheckout;
