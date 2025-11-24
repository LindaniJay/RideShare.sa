import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Car, 
  Camera, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Upload, 
  X, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Star,
  Shield,
  Settings,
  FileText,
  Image as ImageIcon,
  Eye,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Fuel,
  Clock
} from 'lucide-react';
import GlassCard from './GlassCard';
import GlassInput from './GlassInput';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

interface VehicleFormData {
  // Basic Info
  make: string;
  model: string;
  year: number;
  type: 'car' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'luxury' | 'electric';
  color: string;
  mileage: number;
  transmission: 'manual' | 'automatic' | 'cvt' | 'semi-automatic';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg';
  seats: number;
  doors: number;
  engineSize: string;
  vin: string;
  
  // Pricing
  pricePerDay: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  minimumRentalDays: number;
  maximumRentalDays?: number;
  
  // Location
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: { latitude: number; longitude: number };
  };
  
  // Features
  features: string[];
  amenities: string[];
  safetyFeatures: string[];
  entertainmentFeatures: string[];
  
  // Media
  coverImage: File | null;
  images: File[];
  
  // Documents
  documents: {
    license: File[];
    registration: File[];
    insurance: File[];
  };
  
  // Description
  description: string;
  
  // Status
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

interface ModernVehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: VehicleFormData) => void;
  initialData?: Partial<VehicleFormData>;
}

const VEHICLE_TYPES = [
  { id: 'car', label: 'Car', icon: 'Car', color: 'blue', description: 'Sedan, Hatchback, Coupe' },
  { id: 'suv', label: 'SUV', icon: 'Car', color: 'green', description: 'Sports Utility Vehicle' },
  { id: 'truck', label: 'Truck', icon: 'Car', color: 'orange', description: 'Pickup, Commercial' },
  { id: 'van', label: 'Van', icon: 'Car', color: 'purple', description: 'Minivan, Cargo Van' },
  { id: 'motorcycle', label: 'Motorcycle', icon: 'Car', color: 'red', description: 'Bike, Scooter' },
  { id: 'luxury', label: 'Luxury', icon: 'Star', color: 'yellow', description: 'Premium Vehicles' },
  { id: 'electric', label: 'Electric', icon: 'Zap', color: 'emerald', description: 'EV, Hybrid' }
];

const FEATURES = [
  { category: 'Comfort', items: ['Air Conditioning', 'Heated Seats', 'Leather Seats', 'Sunroof', 'Power Windows', 'Central Locking'] },
  { category: 'Technology', items: ['Bluetooth', 'USB Port', 'GPS Navigation', 'Backup Camera', 'Touchscreen', 'Wireless Charging'] },
  { category: 'Safety', items: ['ABS', 'Airbags', 'Stability Control', 'Blind Spot Monitor', 'Lane Departure Warning', 'Parking Sensors'] },
  { category: 'Entertainment', items: ['AM/FM Radio', 'CD Player', 'Premium Sound', 'Apple CarPlay', 'Android Auto', 'Satellite Radio'] }
];

const ModernVehicleForm: React.FC<ModernVehicleFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'car',
    color: '',
    mileage: 0,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    doors: 4,
    engineSize: '',
    vin: '',
    pricePerDay: 0,
    pricePerWeek: 0,
    pricePerMonth: 0,
    minimumRentalDays: 1,
    maximumRentalDays: 30,
    location: {
      address: '',
      city: '',
      state: '',
      country: 'South Africa',
      postalCode: '',
      coordinates: { latitude: 0, longitude: 0 }
    },
    features: [],
    amenities: [],
    safetyFeatures: [],
    entertainmentFeatures: [],
    coverImage: null,
    images: [],
    documents: {
      license: [],
      registration: [],
      insurance: []
    },
    description: '',
    status: 'draft',
    ...initialData
  });

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const steps = [
    { id: 1, title: 'Vehicle Info', icon: 'Car', description: 'Basic vehicle details' },
    { id: 2, title: 'Pricing', icon: 'DollarSign', description: 'Set your rates' },
    { id: 3, title: 'Location', icon: 'MapPin', description: 'Where is your vehicle' },
    { id: 4, title: 'Features', icon: 'Star', description: 'What makes it special' },
    { id: 5, title: 'Photos', icon: 'Camera', description: 'Show off your vehicle' },
    { id: 6, title: 'Documents', icon: 'FileText', description: 'Required paperwork' },
    { id: 7, title: 'Review', icon: 'CheckCircle', description: 'Final review' }
  ];

  const nextStep = () => {
    console.log('Next step clicked, current step:', currentStep, 'total steps:', steps.length);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (files: FileList, category: keyof VehicleFormData) => {
    const fileArray = Array.from(files);
    
    // Validate file types and sizes
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    const validFiles = fileArray.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type. Please use JPEG, PNG, or WebP.`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    
    if (category === 'images') {
      // Limit to 10 additional images
      const currentCount = formData.images.length;
      const remainingSlots = 10 - currentCount;
      const filesToAdd = validFiles.slice(0, remainingSlots);
      
      if (validFiles.length > remainingSlots) {
        toast.error(`You can only upload ${remainingSlots} more image(s). Maximum 10 additional photos.`);
      }
      
      setFormData(prev => ({
        ...prev,
        [category]: [...prev.images, ...filesToAdd]
      }));
    } else if (category === 'coverImage') {
      setFormData(prev => ({
        ...prev,
        [category]: validFiles.length > 0 ? validFiles[0] : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [category]: validFiles
      }));
    }
  };

  const handleDocumentUpload = (files: FileList, docType: keyof VehicleFormData['documents']) => {
    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: fileArray
      }
    }));
  };

  const removeFile = (category: keyof VehicleFormData, index: number) => {
    setFormData(prev => {
      const currentFiles = prev[category] as File[];
      const newFiles = currentFiles.filter((_, i) => i !== index);
      return {
        ...prev,
        [category]: newFiles
      };
    });
  };

  const removeDocument = (docType: keyof VehicleFormData['documents'], index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: prev.documents[docType].filter((_, i) => i !== index)
      }
    }));
  };

  const toggleFeature = (category: 'features' | 'amenities' | 'safetyFeatures' | 'entertainmentFeatures', feature: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(feature)
        ? prev[category].filter(f => f !== feature)
        : [...prev[category], feature]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create FormData for the API call
      const submitData = new FormData();
      
      // Add basic vehicle information
      submitData.append('title', `${formData.year} ${formData.make} ${formData.model}`);
      submitData.append('description', formData.description || `${formData.year} ${formData.make} ${formData.model} - ${formData.type}`);
      submitData.append('make', formData.make);
      submitData.append('model', formData.model);
      submitData.append('year', formData.year.toString());
      submitData.append('vehicle_type', formData.type);
      submitData.append('category', formData.type);
      submitData.append('price_per_day', formData.pricePerDay.toString());
      
      if (formData.pricePerWeek) {
        submitData.append('price_per_week', formData.pricePerWeek.toString());
      }
      if (formData.pricePerMonth) {
        submitData.append('price_per_month', formData.pricePerMonth.toString());
      }
      
      // Add location information
      submitData.append('location', JSON.stringify(formData.location));
      
      // Add vehicle details
      submitData.append('fuel_type', formData.fuelType);
      submitData.append('transmission', formData.transmission);
      submitData.append('seats', formData.seats.toString());
      submitData.append('mileage', formData.mileage.toString());
      submitData.append('minimum_rental_days', formData.minimumRentalDays.toString());
      
      // Add features
      submitData.append('features', JSON.stringify([
        ...formData.features,
        ...formData.amenities,
        ...formData.safetyFeatures,
        ...formData.entertainmentFeatures
      ]));
      
      // Add images - cover image first, then additional images
      if (formData.coverImage) {
        submitData.append('coverImage', formData.coverImage);
      }
      formData.images.forEach((image) => {
        submitData.append('images', image);
      });
      
      // Add category for image storage
      submitData.append('category', formData.type || 'uncategorized');
      
      // Make API call to create vehicle listing
      const { getApiBaseUrl } = await import('../utils/apiConfig');
      const API_BASE_URL = getApiBaseUrl();
      
      // Get Firebase token from auth context
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      const token = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/enhanced-vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: submitData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create vehicle listing');
      }
      
      const result = await response.json();
      
      // Emit custom event to refresh host dashboard
      window.dispatchEvent(new CustomEvent('listingCreated', { 
        detail: { listing: result.vehicle || result.data } 
      }));
      
      onSuccess(result.vehicle || result.data || formData);
      toast.success('Vehicle listing created successfully! It will be reviewed by admin before going live.');
      onClose();
    } catch (error) {
      console.error('Error creating vehicle listing:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderVehicleInfo();
      case 2: return renderPricing();
      case 3: return renderLocation();
      case 4: return renderFeatures();
      case 5: return renderPhotos();
      case 6: return renderDocuments();
      case 7: return renderReview();
      default: return null;
    }
  };

  const renderVehicleInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Car className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Vehicle Information</h2>
        <p className="text-white/70">Tell us about your vehicle</p>
      </div>

      {/* Vehicle Type Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Vehicle Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VEHICLE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setFormData(prev => ({ ...prev, type: type.id as any }))}
              className={`group p-6 rounded-2xl border-2 transition-all duration-300 ${
                formData.type === type.id
                  ? `border-${type.color}-500 bg-${type.color}-500/20 shadow-lg scale-105`
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 hover:scale-105'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${type.color}-500 to-${type.color}-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <Icon name={type.icon} className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-white mb-1">{type.label}</div>
                <div className="text-xs text-white/60">{type.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassInput
          label="Make"
          value={formData.make}
          onChange={(value) => setFormData(prev => ({ ...prev, make: value }))}
          placeholder="e.g., Toyota"
          required
        />
        <GlassInput
          label="Model"
          value={formData.model}
          onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
          placeholder="e.g., Corolla"
          required
        />
        <GlassInput
          label="Year"
          type="number"
          value={formData.year.toString()}
          onChange={(value) => setFormData(prev => ({ ...prev, year: parseInt(value) || new Date().getFullYear() }))}
          min="1990"
          max={new Date().getFullYear().toString()}
          required
        />
        <GlassInput
          label="Color"
          value={formData.color}
          onChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
          placeholder="e.g., White"
          required
        />
        <GlassInput
          label="Mileage (km)"
          type="number"
          value={formData.mileage.toString()}
          onChange={(value) => setFormData(prev => ({ ...prev, mileage: parseInt(value) || 0 }))}
          placeholder="0"
        />
        <GlassInput
          label="Engine Size"
          value={formData.engineSize}
          onChange={(value) => setFormData(prev => ({ ...prev, engineSize: value }))}
          placeholder="e.g., 1.8L"
        />
        <GlassInput
          label="VIN"
          value={formData.vin}
          onChange={(value) => setFormData(prev => ({ ...prev, vin: value }))}
          placeholder="17-character VIN"
        />
        <GlassInput
          label="Seats"
          type="number"
          value={formData.seats.toString()}
          onChange={(value) => setFormData(prev => ({ ...prev, seats: parseInt(value) || 5 }))}
          min="1"
          max="9"
        />
      </div>

      {/* Transmission & Fuel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-white font-medium">Transmission</label>
          <div className="grid grid-cols-2 gap-3">
            {['manual', 'automatic', 'cvt', 'semi-automatic'].map((transmission) => (
              <button
                key={transmission}
                onClick={() => setFormData(prev => ({ ...prev, transmission: transmission as any }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.transmission === transmission
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10'
                }`}
              >
                <div className="text-center">
                  <Settings className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium capitalize">{transmission}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-white font-medium">Fuel Type</label>
          <div className="grid grid-cols-2 gap-3">
            {['petrol', 'diesel', 'electric', 'hybrid', 'lpg'].map((fuel) => (
              <button
                key={fuel}
                onClick={() => setFormData(prev => ({ ...prev, fuelType: fuel as any }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.fuelType === fuel
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10'
                }`}
              >
                <div className="text-center">
                  <Fuel className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium capitalize">{fuel}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderPricing = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <DollarSign className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Pricing & Availability</h2>
        <p className="text-white/70">Set competitive rates for your vehicle</p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-2 border-blue-500/30 bg-blue-500/10">
          <div className="text-center">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Daily Rate</h3>
            <GlassInput
              label="Price per Day (R)"
              type="number"
              value={formData.pricePerDay.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, pricePerDay: parseInt(value) || 0 }))}
              placeholder="250"
              required
            />
            <p className="text-blue-300 text-sm mt-2">Most popular option</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-2 border-purple-500/30 bg-purple-500/10">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Weekly Rate</h3>
            <GlassInput
              label="Price per Week (R)"
              type="number"
              value={formData.pricePerWeek?.toString() || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, pricePerWeek: parseInt(value) || 0 }))}
              placeholder="1500"
            />
            <p className="text-purple-300 text-sm mt-2">Save 15% vs daily</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-2 border-emerald-500/30 bg-emerald-500/10">
          <div className="text-center">
            <Star className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Monthly Rate</h3>
            <GlassInput
              label="Price per Month (R)"
              type="number"
              value={formData.pricePerMonth?.toString() || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, pricePerMonth: parseInt(value) || 0 }))}
              placeholder="5000"
            />
            <p className="text-emerald-300 text-sm mt-2">Save 25% vs daily</p>
          </div>
        </GlassCard>
      </div>

      {/* Rental Periods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassInput
          label="Minimum Rental Days"
          type="number"
          value={formData.minimumRentalDays.toString()}
          onChange={(value) => setFormData(prev => ({ ...prev, minimumRentalDays: parseInt(value) || 1 }))}
          min="1"
          placeholder="1"
        />
        <GlassInput
          label="Maximum Rental Days"
          type="number"
          value={formData.maximumRentalDays?.toString() || ''}
          onChange={(value) => setFormData(prev => ({ ...prev, maximumRentalDays: parseInt(value) || 30 }))}
          min="1"
          placeholder="30"
        />
      </div>

      {/* Pricing Tips */}
      <GlassCard className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Pricing Tips</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• Research similar vehicles in your area for competitive pricing</li>
              <li>• Consider offering weekly and monthly discounts to attract longer rentals</li>
              <li>• Factor in maintenance, insurance, and depreciation costs</li>
              <li>• Start with competitive rates to build reviews and ratings</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );

  const renderLocation = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <MapPin className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Location Details</h2>
        <p className="text-white/70">Where is your vehicle located?</p>
      </div>

      {/* Location Form */}
      <div className="space-y-6">
        <GlassInput
          label="Street Address"
          value={formData.location.address}
          onChange={(value) => setFormData(prev => ({ 
            ...prev, 
            location: { ...prev.location, address: value }
          }))}
          placeholder="123 Main Street"
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassInput
            label="City"
            value={formData.location.city}
            onChange={(value) => setFormData(prev => ({ 
              ...prev, 
              location: { ...prev.location, city: value }
            }))}
            placeholder="Cape Town"
            required
          />
          <GlassInput
            label="State/Province"
            value={formData.location.state}
            onChange={(value) => setFormData(prev => ({ 
              ...prev, 
              location: { ...prev.location, state: value }
            }))}
            placeholder="Western Cape"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassInput
            label="Postal Code"
            value={formData.location.postalCode}
            onChange={(value) => setFormData(prev => ({ 
              ...prev, 
              location: { ...prev.location, postalCode: value }
            }))}
            placeholder="8001"
            required
          />
          <GlassInput
            label="Country"
            value={formData.location.country}
            onChange={(value) => setFormData(prev => ({ 
              ...prev, 
              location: { ...prev.location, country: value }
            }))}
            placeholder="South Africa"
            required
          />
        </div>
      </div>

      {/* Location Tips */}
      <GlassCard className="p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Location Tips</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• Be specific about pickup and drop-off locations</li>
              <li>• Mention nearby landmarks for easy finding</li>
              <li>• Ensure the location is safe and accessible 24/7</li>
              <li>• Consider parking availability and restrictions</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );

  const renderFeatures = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Star className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Features & Amenities</h2>
        <p className="text-white/70">What makes your vehicle special?</p>
      </div>

      {/* Feature Categories */}
      <div className="space-y-8">
        {FEATURES.map((category, index) => (
          <div key={category.category} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                index === 0 ? 'from-blue-500 to-blue-600' :
                index === 1 ? 'from-purple-500 to-purple-600' :
                index === 2 ? 'from-red-500 to-red-600' :
                'from-green-500 to-green-600'
              } flex items-center justify-center`}>
                <Icon name={
                  index === 0 ? 'Zap' :
                  index === 1 ? 'Settings' :
                  index === 2 ? 'Shield' :
                  'Heart'
                } className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">{category.category}</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {category.items.map((feature) => (
                <button
                  key={feature}
                  onClick={() => {
                    const categoryKey = index === 0 ? 'features' :
                                      index === 1 ? 'amenities' :
                                      index === 2 ? 'safetyFeatures' :
                                      'entertainmentFeatures';
                    toggleFeature(categoryKey as any, feature);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    (index === 0 ? formData.features.includes(feature) :
                     index === 1 ? formData.amenities.includes(feature) :
                     index === 2 ? formData.safetyFeatures.includes(feature) :
                     formData.entertainmentFeatures.includes(feature))
                      ? `border-${index === 0 ? 'blue' : index === 1 ? 'purple' : index === 2 ? 'red' : 'green'}-500 bg-${index === 0 ? 'blue' : index === 1 ? 'purple' : index === 2 ? 'red' : 'green'}-500/20 text-${index === 0 ? 'blue' : index === 1 ? 'purple' : index === 2 ? 'red' : 'green'}-300`
                      : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                      (index === 0 ? formData.features.includes(feature) :
                       index === 1 ? formData.amenities.includes(feature) :
                       index === 2 ? formData.safetyFeatures.includes(feature) :
                       formData.entertainmentFeatures.includes(feature))
                        ? `border-${index === 0 ? 'blue' : index === 1 ? 'purple' : index === 2 ? 'red' : 'green'}-500 bg-${index === 0 ? 'blue' : index === 1 ? 'purple' : index === 2 ? 'red' : 'green'}-500`
                        : 'border-white/30'
                    }`}>
                      {(index === 0 ? formData.features.includes(feature) :
                        index === 1 ? formData.amenities.includes(feature) :
                        index === 2 ? formData.safetyFeatures.includes(feature) :
                        formData.entertainmentFeatures.includes(feature)) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderPhotos = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Camera className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Vehicle Photos</h2>
        <p className="text-white/70">Show off your vehicle with great photos</p>
      </div>

      {/* Cover Photo */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Cover Photo</h3>
        <div className="relative">
          {formData.coverImage ? (
            <div className="relative group">
              <img
                src={URL.createObjectURL(formData.coverImage)}
                alt="Cover photo"
                className="w-full h-64 object-cover rounded-2xl"
              />
              <button
                onClick={() => setFormData(prev => ({ ...prev, coverImage: null }))}
                className="absolute top-4 right-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div
              className="w-full h-64 border-2 border-dashed border-white/30 rounded-2xl flex items-center justify-center hover:border-white/50 transition-colors cursor-pointer"
              onClick={() => fileInputRefs.current.coverImage?.click()}
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-white/60 mx-auto mb-3" />
                <p className="text-white/60">Click to upload cover photo</p>
                <p className="text-white/40 text-sm">Recommended: 16:9 aspect ratio</p>
              </div>
            </div>
          )}
          <input
            ref={(el) => fileInputRefs.current.coverImage = el}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && setFormData(prev => ({ ...prev, coverImage: e.target.files![0] }))}
            className="hidden"
          />
        </div>
      </div>

      {/* Additional Photos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Additional Photos</h3>
          <span className="text-white/60 text-sm">{formData.images.length} / 10 photos</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.images.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={`Photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-xl"
              />
              <button
                onClick={() => removeFile('images', index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}

          {formData.images.length < 10 && (
            <button
              onClick={() => fileInputRefs.current.images?.click()}
              className="w-full h-24 border-2 border-dashed border-white/30 rounded-xl flex items-center justify-center text-white/60 hover:border-white/50 hover:text-white/80 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>

        <input
          ref={(el) => fileInputRefs.current.images = el}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'images')}
          className="hidden"
        />
      </div>

      {/* Photo Tips */}
      <GlassCard className="p-6 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500/30">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Photo Tips</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• Use good lighting (natural light is best)</li>
              <li>• Take photos from multiple angles</li>
              <li>• Show both interior and exterior details</li>
              <li>• Include close-ups of important features</li>
              <li>• Keep photos clear and well-framed</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );

  const renderDocuments = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Required Documents</h2>
        <p className="text-white/70">Upload necessary paperwork</p>
      </div>

      {/* Document Upload Areas */}
      <div className="space-y-6">
        {[
          { key: 'license', label: 'Driver\'s License', description: 'Valid driver\'s license', icon: 'Shield' },
          { key: 'registration', label: 'Vehicle Registration', description: 'Current registration certificate', icon: 'FileText' },
          { key: 'insurance', label: 'Insurance Certificate', description: 'Valid insurance documentation', icon: 'Shield' }
        ].map((doc) => (
          <div key={doc.key} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <Icon name={doc.icon} className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{doc.label}</h3>
                <p className="text-white/60 text-sm">{doc.description}</p>
              </div>
              <span className="text-white/60 text-sm ml-auto">
                {formData.documents[doc.key as keyof VehicleFormData['documents']].length} files
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.documents[doc.key as keyof VehicleFormData['documents']].map((file, index) => (
                <div key={index} className="relative group">
                  <div className="w-full h-24 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white/60" />
                  </div>
                  <button
                    onClick={() => removeDocument(doc.key as keyof VehicleFormData['documents'], index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <p className="text-xs text-white/60 mt-2 truncate">{file.name}</p>
                </div>
              ))}

              <button
                onClick={() => fileInputRefs.current[doc.key]?.click()}
                className="w-full h-24 border-2 border-dashed border-white/30 rounded-xl flex items-center justify-center text-white/60 hover:border-white/50 hover:text-white/80 transition-colors"
              >
                <Upload className="w-6 h-6" />
              </button>
            </div>

            <input
              ref={(el) => fileInputRefs.current[doc.key] = el}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={(e) => e.target.files && handleDocumentUpload(e.target.files, doc.key as keyof VehicleFormData['documents'])}
              className="hidden"
            />
          </div>
        ))}
      </div>

      {/* Document Requirements */}
      <GlassCard className="p-6 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border-indigo-500/30">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Document Requirements</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• All documents must be current and valid</li>
              <li>• Photos should be clear and readable</li>
              <li>• PDF files are preferred for documents</li>
              <li>• Ensure all personal information is visible</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );

  const renderReview = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Review & Submit</h2>
        <p className="text-white/70">Review your listing before submitting</p>
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2" />
            Vehicle Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Make & Model:</span>
              <span className="text-white">{formData.make} {formData.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Year:</span>
              <span className="text-white">{formData.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Type:</span>
              <span className="text-white capitalize">{formData.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Color:</span>
              <span className="text-white">{formData.color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Mileage:</span>
              <span className="text-white">{formData.mileage.toLocaleString()} km</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Pricing
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Per Day:</span>
              <span className="text-white font-semibold">R{formData.pricePerDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Per Week:</span>
              <span className="text-white">R{formData.pricePerWeek || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Per Month:</span>
              <span className="text-white">R{formData.pricePerMonth || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Min Rental:</span>
              <span className="text-white">{formData.minimumRentalDays} days</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location
          </h3>
          <div className="space-y-2 text-sm">
            <div className="text-white">{formData.location.address}</div>
            <div className="text-white/60">{formData.location.city}, {formData.location.state}</div>
            <div className="text-white/60">{formData.location.postalCode}, {formData.location.country}</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Features
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-white/60 text-sm">Comfort Features:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.features.slice(0, 3).map((feature) => (
                  <span key={feature} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                    {feature}
                  </span>
                ))}
                {formData.features.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                    +{formData.features.length - 3} more
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-white/60 text-sm">Safety Features:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.safetyFeatures.slice(0, 3).map((feature) => (
                  <span key={feature} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                    {feature}
                  </span>
                ))}
                {formData.safetyFeatures.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                    +{formData.safetyFeatures.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Media & Documents Summary */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Media & Documents
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <ImageIcon className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-white font-medium">{formData.coverImage ? '✓' : '✗'}</div>
            <div className="text-white/60">Cover Photo</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Camera className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-white font-medium">{formData.images.length}</div>
            <div className="text-white/60">Photos</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-white font-medium">{formData.documents.license.length + formData.documents.registration.length + formData.documents.insurance.length}</div>
            <div className="text-white/60">Documents</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-white font-medium">Ready</div>
            <div className="text-white/60">Status</div>
          </div>
        </div>
      </GlassCard>

      {/* What Happens Next */}
      <GlassCard className="p-6 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/30">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">What Happens Next?</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• Your listing will be reviewed by our admin team</li>
              <li>• You'll receive an email notification once approved</li>
              <li>• Approved listings become visible to renters</li>
              <li>• You can manage your listing from your dashboard</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[95vh] bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600/30 to-green-700/30 border-b border-white/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-white">Add New Vehicle</h1>
              <p className="text-white/70 text-sm">Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                    index + 1 <= currentStep
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/20 text-white/60'
                  }`}>
                    {index + 1 < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 rounded-full transition-all ${
                      index + 1 < currentStep ? 'bg-blue-500' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-white/5 border-t border-white/20 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center ${
                currentStep === 1
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-all hover:scale-105"
              >
                Cancel
              </button>

              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all hover:scale-105 shadow-lg flex items-center"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg ${
                    loading
                      ? 'bg-white/20 text-white/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit for Approval
                      <CheckCircle className="w-5 h-5 inline ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernVehicleForm;
