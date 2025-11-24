import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from './Icon';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced interfaces for better conversation flow
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'quick_reply' | 'system' | 'booking_step' | 'file_upload' | 'location_picker' | 'calendar' | 'carousel' | 'form' | 'confirmation';
  metadata?: {
    step?: string;
    data?: any;
    options?: any[];
    formData?: Record<string, any>;
    carouselItems?: CarouselItem[];
    validation?: ValidationRule[];
  };
  context?: {
    intent?: string;
    confidence?: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
    language?: 'en' | 'af' | 'zu';
  };
}

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  action?: string;
  data?: any;
}

interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'date' | 'number' | 'min' | 'max';
  value?: any;
  message: string;
}

interface ConversationNode {
  id: string;
  type: 'question' | 'action' | 'confirmation' | 'branch' | 'parallel' | 'loop' | 'carousel';
  content: {
    text: string;
    options?: ConversationOption[];
    form?: FormField[];
    conditions?: Condition[];
    carouselItems?: CarouselItem[];
  };
  next?: string | string[];
  validation?: ValidationRule[];
  metadata?: Record<string, any>;
}

interface ConversationOption {
  id: string;
  text: string;
  action?: string;
  next?: string;
  data?: any;
  icon?: string;
}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'number' | 'select' | 'multiselect' | 'file' | 'location';
  label: string;
  placeholder?: string;
  options?: string[];
  validation?: ValidationRule[];
  required?: boolean;
}

interface Condition {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists';
  value: any;
  next: string;
}

interface ConversationFlow {
  id: string;
  name: string;
  description: string;
  startNode: string;
  nodes: Record<string, ConversationNode>;
  variables: Record<string, any>;
  metadata: {
    category: string;
    priority: number;
    estimatedDuration: number;
    requiredPermissions?: string[];
  };
}

interface ConversationContext {
  currentFlow?: ConversationFlow;
  currentNode?: string;
  flowHistory: string[];
  userData: Record<string, any>;
  preferences: {
    language: 'en' | 'af' | 'zu';
    notifications: boolean;
    voiceEnabled: boolean;
  };
  sessionData: {
    startTime: Date;
    lastActivity: Date;
    messageCount: number;
    satisfactionScore?: number;
  };
  analytics: {
    intents: string[];
    sentiments: Array<{ sentiment: string; confidence: number }>;
    languages: string[];
    topics: string[];
  };
}

interface Intent {
  keywords: string[];
  synonyms: string[];
  response: string;
  followUp?: string[];
  priority: number;
  flow?: string;
  confidence?: number;
  category: 'booking' | 'listing' | 'support' | 'pricing' | 'safety' | 'general';
  requiresAuth?: boolean;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 Welcome to RideShare SA! I\'m your intelligent assistant, ready to help you with bookings, listings, and any questions you might have. How can I assist you today?',
      isUser: false,
      timestamp: new Date(),
      type: 'text',
      context: {
        intent: 'greeting',
        confidence: 1.0,
        sentiment: 'positive',
        language: 'en'
      }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    flowHistory: [],
    userData: {},
    preferences: {
      language: 'en',
      notifications: true,
      voiceEnabled: false
    },
    sessionData: {
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0
    },
    analytics: {
      intents: [],
      sentiments: [],
      languages: [],
      topics: []
    }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enhanced conversation flows with dynamic branching
  const conversationFlows: Record<string, ConversationFlow> = {
    booking_wizard: {
      id: 'booking_wizard',
      name: 'Smart Booking Assistant',
      description: 'Intelligent vehicle booking with personalized recommendations',
      startNode: 'welcome',
      variables: {},
      metadata: {
        category: 'booking',
        priority: 1,
        estimatedDuration: 5,
        requiredPermissions: ['location', 'calendar']
      },
      nodes: {
        welcome: {
          id: 'welcome',
          type: 'question',
          content: {
            text: '🚗 Great! Let\'s find you the perfect vehicle! I\'ll guide you through our smart booking process.\n\nFirst, where would you like to pick up your vehicle?',
            options: [
              { id: 'current_location', text: 'Use my current location', action: 'get_location', next: 'dates' },
              { id: 'search_location', text: 'Search for a location', action: 'search_location', next: 'location_search' },
              { id: 'popular_locations', text: 'Choose from popular locations', action: 'show_popular', next: 'popular_locations' }
            ]
          },
          next: 'dates'
        },
        location_search: {
          id: 'location_search',
          type: 'question',
          content: {
            text: '📍 Please enter the city or area where you\'d like to pick up your vehicle:',
            form: [
              {
                id: 'location',
                type: 'text',
                label: 'Pickup Location',
                placeholder: 'e.g., Cape Town, Johannesburg, Durban...',
                required: true,
                validation: [
                  { field: 'location', type: 'required', message: 'Please enter a location' },
                  { field: 'location', type: 'min', value: 2, message: 'Location must be at least 2 characters' }
                ]
              }
            ]
          },
          next: 'dates'
        },
        popular_locations: {
          id: 'popular_locations',
          type: 'question',
          content: {
            text: '📍 Choose from our popular pickup locations:',
            options: [
              { id: 'cape_town', text: 'Cape Town', data: { city: 'Cape Town', province: 'Western Cape' }, next: 'dates' },
              { id: 'johannesburg', text: 'Johannesburg', data: { city: 'Johannesburg', province: 'Gauteng' }, next: 'dates' },
              { id: 'durban', text: 'Durban', data: { city: 'Durban', province: 'KwaZulu-Natal' }, next: 'dates' },
              { id: 'pretoria', text: 'Pretoria', data: { city: 'Pretoria', province: 'Gauteng' }, next: 'dates' },
              { id: 'port_elizabeth', text: 'Port Elizabeth', data: { city: 'Port Elizabeth', province: 'Eastern Cape' }, next: 'dates' }
            ]
          },
          next: 'dates'
        },
        dates: {
          id: 'dates',
          type: 'question',
          content: {
            text: '📅 When do you need the vehicle?',
            form: [
              {
                id: 'start_date',
                type: 'date',
                label: 'Pickup Date',
                required: true,
                validation: [
                  { field: 'start_date', type: 'required', message: 'Please select a pickup date' },
                  { field: 'start_date', type: 'date', message: 'Please select a valid date' }
                ]
              },
              {
                id: 'end_date',
                type: 'date',
                label: 'Return Date',
                required: true,
                validation: [
                  { field: 'end_date', type: 'required', message: 'Please select a return date' },
                  { field: 'end_date', type: 'date', message: 'Please select a valid date' }
                ]
              }
            ]
          },
          next: 'vehicle_preferences'
        },
        vehicle_preferences: {
          id: 'vehicle_preferences',
          type: 'question',
          content: {
            text: '🚙 What type of vehicle are you looking for?',
            options: [
              { id: 'economy', text: 'Economy Car', data: { type: 'economy', price_range: '150-300' }, next: 'passengers' },
              { id: 'suv', text: 'SUV', data: { type: 'suv', price_range: '300-500' }, next: 'passengers' },
              { id: 'luxury', text: 'Luxury Vehicle', data: { type: 'luxury', price_range: '500+' }, next: 'passengers' },
              { id: 'bakkie', text: 'Bakkie', data: { type: 'bakkie', price_range: '200-400' }, next: 'passengers' },
              { id: 'van', text: 'Van', data: { type: 'van', price_range: '250-450' }, next: 'passengers' },
              { id: 'motorcycle', text: 'Motorcycle', data: { type: 'motorcycle', price_range: '100-200' }, next: 'passengers' }
            ]
          },
          next: 'passengers'
        },
        passengers: {
          id: 'passengers',
          type: 'question',
          content: {
            text: '👥 How many passengers will be traveling?',
            form: [
              {
                id: 'passenger_count',
                type: 'number',
                label: 'Number of Passengers',
                placeholder: '1-8',
                required: true,
                validation: [
                  { field: 'passenger_count', type: 'required', message: 'Please enter number of passengers' },
                  { field: 'passenger_count', type: 'min', value: 1, message: 'Must be at least 1 passenger' },
                  { field: 'passenger_count', type: 'max', value: 8, message: 'Maximum 8 passengers' }
                ]
              }
            ]
          },
          next: 'additional_preferences'
        },
        additional_preferences: {
          id: 'additional_preferences',
          type: 'question',
          content: {
            text: '⚙️ Any additional preferences or requirements?',
            options: [
              { id: 'automatic', text: 'Automatic transmission', data: { transmission: 'automatic' }, next: 'search_vehicles' },
              { id: 'manual', text: 'Manual transmission', data: { transmission: 'manual' }, next: 'search_vehicles' },
              { id: 'no_preference', text: 'No preference', data: { transmission: 'any' }, next: 'search_vehicles' },
              { id: 'add_requirements', text: 'Add more requirements', action: 'show_requirements_form', next: 'requirements_form' }
            ]
          },
          next: 'search_vehicles'
        },
        requirements_form: {
          id: 'requirements_form',
          type: 'question',
          content: {
            text: '📋 Please specify any additional requirements:',
            form: [
              {
                id: 'transmission',
                type: 'select',
                label: 'Transmission',
                options: ['Automatic', 'Manual', 'No Preference'],
                required: false
              },
              {
                id: 'fuel_type',
                type: 'select',
                label: 'Fuel Type',
                options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'No Preference'],
                required: false
              },
              {
                id: 'features',
                type: 'multiselect',
                label: 'Desired Features',
                options: ['GPS', 'Bluetooth', 'Air Conditioning', 'USB Ports', 'Backup Camera', 'Sunroof'],
                required: false
              }
            ]
          },
          next: 'search_vehicles'
        },
        search_vehicles: {
          id: 'search_vehicles',
          type: 'action',
          content: {
            text: '🔍 Searching for the perfect vehicle for you...',
            conditions: [
              { field: 'passenger_count', operator: 'greater', value: 4, next: 'large_vehicle_search' },
              { field: 'vehicle_type', operator: 'equals', value: 'luxury', next: 'luxury_vehicle_search' }
            ]
          },
          next: 'vehicle_results'
        },
        vehicle_results: {
          id: 'vehicle_results',
          type: 'carousel',
          content: {
            text: '🎯 Here are the best matches for your requirements:',
            carouselItems: [
              {
                id: 'vehicle_1',
                title: 'Toyota Corolla 2023',
                description: 'Economy • Automatic • 4 passengers • R180/day',
                image: '/images/vehicles/corolla.jpg',
                action: 'select_vehicle',
                data: { id: 'vehicle_1', price: 180, features: ['GPS', 'Bluetooth', 'AC'] }
              },
              {
                id: 'vehicle_2',
                title: 'Honda Civic 2023',
                description: 'Economy • Manual • 4 passengers • R160/day',
                image: '/images/vehicles/civic.jpg',
                action: 'select_vehicle',
                data: { id: 'vehicle_2', price: 160, features: ['GPS', 'Bluetooth'] }
              }
            ]
          },
          next: 'booking_confirmation'
        },
        booking_confirmation: {
          id: 'booking_confirmation',
          type: 'confirmation',
          content: {
            text: '✅ Perfect! Let\'s confirm your booking details:',
            form: [
              {
                id: 'driver_license',
                type: 'text',
                label: 'Driver\'s License Number',
                required: true,
                validation: [
                  { field: 'driver_license', type: 'required', message: 'Driver\'s license is required' }
                ]
              },
              {
                id: 'phone',
                type: 'phone',
                label: 'Contact Number',
                required: true,
                validation: [
                  { field: 'phone', type: 'required', message: 'Contact number is required' },
                  { field: 'phone', type: 'phone', message: 'Please enter a valid phone number' }
                ]
              },
              {
                id: 'email',
                type: 'email',
                label: 'Email Address',
                required: true,
                validation: [
                  { field: 'email', type: 'required', message: 'Email is required' },
                  { field: 'email', type: 'email', message: 'Please enter a valid email' }
                ]
              }
            ]
          },
          next: 'payment_method'
        },
        payment_method: {
          id: 'payment_method',
          type: 'question',
          content: {
            text: '💳 How would you like to pay?',
            options: [
              { id: 'credit_card', text: 'Credit/Debit Card', data: { method: 'card' }, next: 'payment_details' },
              { id: 'eft', text: 'EFT Transfer', data: { method: 'eft' }, next: 'booking_summary' },
              { id: 'payfast', text: 'PayFast', data: { method: 'payfast' }, next: 'booking_summary' }
            ]
          },
          next: 'booking_summary'
        },
        booking_summary: {
          id: 'booking_summary',
          type: 'confirmation',
          content: {
            text: '🎉 Congratulations! Your booking is confirmed!\n\n📋 Booking Summary:\n• Vehicle: [Vehicle Name]\n• Dates: [Start Date] - [End Date]\n• Location: [Pickup Location]\n• Total: R[Total Amount]\n\n📱 You\'ll receive a confirmation email shortly with all the details.\n\nIs there anything else I can help you with?'
          },
          next: 'end'
        }
      }
    },
    listing_wizard: {
      id: 'listing_wizard',
      name: 'Host Onboarding Assistant',
      description: 'Complete vehicle listing setup with verification',
      startNode: 'welcome',
      variables: {},
      metadata: {
        category: 'listing',
        priority: 2,
        estimatedDuration: 10,
        requiredPermissions: ['camera', 'storage']
      },
      nodes: {
        welcome: {
          id: 'welcome',
          type: 'question',
          content: {
            text: '💰 Welcome to RideShare SA Host Program! I\'ll help you list your vehicle and start earning money.\n\nLet\'s start with some basic information about your vehicle:'
          },
          next: 'vehicle_basic_info'
        },
        vehicle_basic_info: {
          id: 'vehicle_basic_info',
          type: 'question',
          content: {
            text: '🚗 Tell me about your vehicle:',
            form: [
              {
                id: 'vehicle_type',
                type: 'select',
                label: 'Vehicle Type',
                options: ['Economy Car', 'SUV', 'Luxury Vehicle', 'Bakkie', 'Van', 'Motorcycle'],
                required: true
              },
              {
                id: 'make',
                type: 'text',
                label: 'Make',
                placeholder: 'e.g., Toyota, BMW, Ford...',
                required: true
              },
              {
                id: 'model',
                type: 'text',
                label: 'Model',
                placeholder: 'e.g., Corolla, X3, Ranger...',
                required: true
              },
              {
                id: 'year',
                type: 'number',
                label: 'Year',
                placeholder: 'e.g., 2020',
                required: true,
                validation: [
                  { field: 'year', type: 'min', value: 2000, message: 'Year must be 2000 or later' },
                  { field: 'year', type: 'max', value: new Date().getFullYear() + 1, message: 'Year cannot be in the future' }
                ]
              }
            ]
          },
          next: 'vehicle_details'
        },
        vehicle_details: {
          id: 'vehicle_details',
          type: 'question',
          content: {
            text: '📋 Additional vehicle details:',
            form: [
              {
                id: 'mileage',
                type: 'number',
                label: 'Mileage (km)',
                required: true,
                validation: [
                  { field: 'mileage', type: 'min', value: 0, message: 'Mileage cannot be negative' }
                ]
              },
              {
                id: 'transmission',
                type: 'select',
                label: 'Transmission',
                options: ['Automatic', 'Manual'],
                required: true
              },
              {
                id: 'fuel_type',
                type: 'select',
                label: 'Fuel Type',
                options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
                required: true
              },
              {
                id: 'seats',
                type: 'number',
                label: 'Number of Seats',
                required: true,
                validation: [
                  { field: 'seats', type: 'min', value: 1, message: 'Must have at least 1 seat' },
                  { field: 'seats', type: 'max', value: 8, message: 'Maximum 8 seats' }
                ]
              }
            ]
          },
          next: 'location_pricing'
        },
        location_pricing: {
          id: 'location_pricing',
          type: 'question',
          content: {
            text: '📍 Where is your vehicle located and what\'s your pricing?',
            form: [
              {
                id: 'location',
                type: 'location',
                label: 'Vehicle Location',
                required: true
              },
              {
                id: 'daily_rate',
                type: 'number',
                label: 'Daily Rate (ZAR)',
                placeholder: 'e.g., 250',
                required: true,
                validation: [
                  { field: 'daily_rate', type: 'min', value: 50, message: 'Minimum rate is R50/day' },
                  { field: 'daily_rate', type: 'max', value: 2000, message: 'Maximum rate is R2000/day' }
                ]
              },
              {
                id: 'availability',
                type: 'multiselect',
                label: 'Available Days',
                options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                required: true
              }
            ]
          },
          next: 'document_upload'
        },
        document_upload: {
          id: 'document_upload',
          type: 'question',
          content: {
            text: '📄 Please upload your required documents:',
            form: [
              {
                id: 'id_document',
                type: 'file',
                label: 'ID Document',
                required: true
              },
              {
                id: 'drivers_license',
                type: 'file',
                label: 'Driver\'s License',
                required: true
              },
              {
                id: 'vehicle_registration',
                type: 'file',
                label: 'Vehicle Registration (NATIS)',
                required: true
              },
              {
                id: 'roadworthy_certificate',
                type: 'file',
                label: 'Roadworthy Certificate',
                required: true
              },
              {
                id: 'insurance_certificate',
                type: 'file',
                label: 'Insurance Certificate',
                required: true
              }
            ]
          },
          next: 'listing_confirmation'
        },
        listing_confirmation: {
          id: 'listing_confirmation',
          type: 'confirmation',
          content: {
            text: '🎉 Excellent! Your vehicle listing has been submitted for review!\n\n📋 Listing Summary:\n• Vehicle: [Make] [Model] ([Year])\n• Location: [Location]\n• Daily Rate: R[Rate]\n• Availability: [Days]\n\n⏰ Our team will review your listing within 24-48 hours. You\'ll receive an email notification once approved.\n\n💰 Once approved, you can start earning money immediately!\n\nIs there anything else I can help you with?'
          },
          next: 'end'
        }
      }
    }
  };

  // Enhanced intent definitions with better classification
  const intents: Intent[] = [
    {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'hallo', 'sawubona'],
      synonyms: ['greetings', 'salutations', 'howdy', 'welcome'],
      response: 'Hello! 👋 Welcome to RideShare SA! I\'m your intelligent assistant, ready to help you with bookings, listings, and any questions you might have. How can I assist you today?',
      followUp: ['Start booking wizard', 'Start listing wizard', 'What are your prices?', 'Find vehicles near me'],
      priority: 1,
      confidence: 0.95,
      category: 'general'
    },
    {
      keywords: ['book', 'rent', 'reserve', 'hire', 'rental', 'start booking', 'booking wizard', 'bespreek', 'qala i-booking'],
      synonyms: ['reservation', 'booking', 'renting', 'hiring', 'bespreking'],
      response: 'Perfect! Let\'s find you the perfect vehicle! 🚗 I\'ll guide you through our smart booking process with personalized recommendations.',
      followUp: ['Start booking wizard', 'What documents do I need?', 'How do I cancel a booking?'],
      priority: 2,
      flow: 'booking_wizard',
      confidence: 0.9,
      category: 'booking'
    },
    {
      keywords: ['list', 'host', 'earn', 'money', 'income', 'start listing', 'listing wizard', 'lys', 'qala i-listing'],
      synonyms: ['hosting', 'listing', 'earning', 'revenue', 'verdien'],
      response: 'Excellent! Let\'s get you started as a host! 💰 I\'ll guide you through our complete listing process to help you set up your vehicle and start earning money.',
      followUp: ['Start listing wizard', 'What documents do I need?', 'How much can I earn?'],
      priority: 2,
      flow: 'listing_wizard',
      confidence: 0.9,
      category: 'listing'
    },
    {
      keywords: ['price', 'cost', 'expensive', 'cheap', 'affordable', 'rates', 'prys', 'amanani'],
      synonyms: ['pricing', 'rates', 'fees', 'costs', 'tariewe'],
      response: 'Our pricing is competitive and varies by vehicle type and location! 💰\n\n**Daily Rates:**\n• Economy cars: R150-300/day\n• SUVs: R300-500/day\n• Luxury vehicles: R500+/day\n• Bakkies: R200-400/day\n• Vans: R250-450/day\n\nAll prices include basic insurance. You can see exact pricing when browsing vehicles!',
      followUp: ['Are there any hidden fees?', 'Do you offer discounts?', 'What payment methods do you accept?'],
      priority: 3,
      confidence: 0.85,
      category: 'pricing'
    },
    {
      keywords: ['safe', 'insurance', 'secure', 'protection', 'safety', 'veilig', 'uphephile'],
      synonyms: ['safety', 'security', 'insured', 'protected', 'sekuriteit'],
      response: 'Safety is our #1 priority! 🛡️\n\n**Security Features:**\n• All vehicles are fully insured\n• Hosts are verified and background checked\n• 24/7 support team\n• Secure payment processing\n• Vehicle condition checks\n• Emergency roadside assistance\n\nYou can read reviews and safety guidelines before booking.',
      followUp: ['What insurance is included?', 'How do you verify hosts?', 'What if there\'s an accident?'],
      priority: 3,
      confidence: 0.85,
      category: 'safety'
    },
    {
      keywords: ['help', 'support', 'problem', 'issue', 'trouble', 'contact', 'hulp', 'usizo'],
      synonyms: ['assistance', 'aid', 'support', 'problem', 'ondersteuning'],
      response: 'I\'m here to help! 🤝\n\n**Support Options:**\n• FAQ page: /faq\n• Email: support@rideshare-sa.co.za\n• Phone: +27 21 123 4567\n• Live chat: Right here!\n• WhatsApp: +27 82 123 4567\n• Emergency: +27 82 999 8888\n\nWhat specific issue can I help you with?',
      followUp: ['How do I contact support?', 'What are your hours?', 'Can you escalate my issue?'],
      priority: 4,
      confidence: 0.8,
      category: 'support'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced conversation flow management
  const startFlow = useCallback((flowId: string) => {
    const flow = conversationFlows[flowId];
    if (!flow) return;

    const newFlow = { ...flow, variables: {} };
    setContext(prev => ({ 
      ...prev, 
      currentFlow: newFlow, 
      currentNode: flow.startNode,
      flowHistory: [...prev.flowHistory, flowId]
    }));
    
    const startNode = flow.nodes[flow.startNode];
    const flowMessage: Message = {
      id: Date.now().toString(),
      text: startNode.content.text,
      isUser: false,
      timestamp: new Date(),
      type: 'booking_step',
      metadata: { 
        step: startNode.id, 
        data: startNode,
        options: startNode.content.options,
        formData: startNode.content.form,
        validation: startNode.validation
      }
    };
    
    setMessages(prev => [...prev, flowMessage]);
  }, []);

  const handleFlowStep = useCallback((userInput: string, selectedOption?: ConversationOption) => {
    if (!context.currentFlow || !context.currentNode) return false;

    const flow = context.currentFlow;
    const currentNode = flow.nodes[context.currentNode];
    
    if (!currentNode) return false;

    // Handle different node types
    switch (currentNode.type) {
      case 'question':
        return handleQuestionNode(userInput, selectedOption, currentNode, flow);
      case 'action':
        return handleActionNode(currentNode, flow);
      case 'confirmation':
        return handleConfirmationNode(userInput, currentNode, flow);
      case 'branch':
        return handleBranchNode(userInput, currentNode, flow);
      default:
        return handleDefaultNode(userInput, currentNode, flow);
    }
  }, [context.currentFlow, context.currentNode]);

  const handleQuestionNode = (userInput: string, selectedOption: ConversationOption | undefined, node: ConversationNode, flow: ConversationFlow): boolean => {
    // Validate input if form fields exist
    if (node.content.form) {
      const validationResult = validateFormInput(userInput, node.content.form, node.validation);
      if (!validationResult.isValid) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: `❌ ${validationResult.errors.join('\n')}\n\n${node.content.text}`,
          isUser: false,
          timestamp: new Date(),
          type: 'booking_step',
          metadata: { step: node.id, data: node }
        };
        setMessages(prev => [...prev, errorMessage]);
        return true;
      }
    }

    // Store user data
    const userData = selectedOption?.data || { input: userInput };
    setContext(prev => ({
      ...prev,
      userData: { ...prev.userData, ...userData }
    }));

    // Move to next node
    const nextNodeId = selectedOption?.next || node.next as string;
    if (nextNodeId && flow.nodes[nextNodeId]) {
      moveToNextNode(nextNodeId, flow);
      return true;
    }

    return false;
  };

  const handleActionNode = (node: ConversationNode, flow: ConversationFlow): boolean => {
    // Execute action based on node content
    const actionText = node.content.text;
    
    // Simulate action execution
    setTimeout(() => {
      const nextNodeId = node.next as string;
      if (nextNodeId && flow.nodes[nextNodeId]) {
        moveToNextNode(nextNodeId, flow);
      }
    }, 2000);

    const actionMessage: Message = {
      id: Date.now().toString(),
      text: actionText,
      isUser: false,
      timestamp: new Date(),
      type: 'system'
    };
    
    setMessages(prev => [...prev, actionMessage]);
    return true;
  };

  const handleConfirmationNode = (_userInput: string, node: ConversationNode, flow: ConversationFlow): boolean => {
    // Handle confirmation logic
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      text: node.content.text,
      isUser: false,
      timestamp: new Date(),
      type: 'confirmation',
      metadata: { step: node.id, data: node }
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    
    // Move to next node or end flow
    const nextNodeId = node.next as string;
    if (nextNodeId === 'end') {
      endFlow();
    } else if (nextNodeId && flow.nodes[nextNodeId]) {
      moveToNextNode(nextNodeId, flow);
    }
    
    return true;
  };

  const handleBranchNode = (_userInput: string, node: ConversationNode, flow: ConversationFlow): boolean => {
    // Evaluate conditions to determine next node
    if (node.content.conditions) {
      for (const condition of node.content.conditions) {
        if (evaluateCondition(condition, context.userData)) {
          moveToNextNode(condition.next, flow);
          return true;
        }
      }
    }
    
    // Default to next node
    const nextNodeId = node.next as string;
    if (nextNodeId && flow.nodes[nextNodeId]) {
      moveToNextNode(nextNodeId, flow);
      return true;
    }
    
    return false;
  };

  const handleDefaultNode = (_userInput: string, node: ConversationNode, flow: ConversationFlow): boolean => {
    const nextNodeId = node.next as string;
    if (nextNodeId && flow.nodes[nextNodeId]) {
      moveToNextNode(nextNodeId, flow);
      return true;
    }
    return false;
  };

  const moveToNextNode = (nextNodeId: string, flow: ConversationFlow) => {
    const nextNode = flow.nodes[nextNodeId];
    if (!nextNode) return;

    setContext(prev => ({ ...prev, currentNode: nextNodeId }));

    const nextMessage: Message = {
      id: Date.now().toString(),
      text: nextNode.content.text,
      isUser: false,
      timestamp: new Date(),
      type: 'booking_step',
      metadata: { 
        step: nextNode.id, 
        data: nextNode,
        options: nextNode.content.options,
        formData: nextNode.content.form,
        carouselItems: nextNode.content.carouselItems,
        validation: nextNode.validation
      }
    };
    
    setMessages(prev => [...prev, nextMessage]);
  };

  const endFlow = () => {
    setContext(prev => ({ 
      ...prev, 
      currentFlow: undefined, 
      currentNode: undefined 
    }));
  };

  const validateFormInput = (input: string, formFields: FormField[], _validationRules?: ValidationRule[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Basic validation logic
    if (!input.trim() && formFields.some(field => field.required)) {
      errors.push('Please provide the required information');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const evaluateCondition = (condition: Condition, userData: Record<string, any>): boolean => {
    const fieldValue = userData[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'contains':
        return fieldValue && fieldValue.toString().toLowerCase().includes(condition.value.toString().toLowerCase());
      case 'greater':
        return fieldValue > condition.value;
      case 'less':
        return fieldValue < condition.value;
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      default:
        return false;
    }
  };

  // Enhanced intent classification
  const classifyIntent = useCallback((userMessage: string): Intent | null => {
    const message = userMessage.toLowerCase();
    const words = message.split(/\s+/);
    
    let bestMatch: Intent | null = null;
    let bestScore = 0;
    
    for (const intent of intents) {
      let score = 0;
      
      // Check keywords
      for (const keyword of intent.keywords) {
        if (message.includes(keyword)) {
          score += 2;
        }
      }
      
      // Check synonyms
      for (const synonym of intent.synonyms) {
        if (message.includes(synonym)) {
          score += 1.5;
        }
      }
      
      // Check individual words
      for (const word of words) {
        for (const keyword of intent.keywords) {
          if (keyword.includes(word) || word.includes(keyword)) {
            score += 0.5;
          }
        }
      }
      
      // Apply priority and confidence multipliers
      score *= (1 + intent.priority * 0.1) * (intent.confidence || 0.8);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = intent;
      }
    }
    
    return bestScore > 1 ? bestMatch : null;
  }, []);

  // Enhanced bot response with conversation flow integration
  const getBotResponse = useCallback((userMessage: string): { response: string; followUp?: string[] } => {
    // Check if we're in a flow first
    if (context.currentFlow) {
      const handled = handleFlowStep(userMessage);
      if (handled) {
        return { response: '', followUp: [] };
      }
    }

    const intent = classifyIntent(userMessage);
    
    if (intent) {
      // Check if this intent should start a flow
      if (intent.flow && !context.currentFlow) {
        startFlow(intent.flow);
        return { response: '', followUp: [] };
      }

      // Update context with current intent
      setContext(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          intents: [...prev.analytics.intents, intent.category],
          topics: [...prev.analytics.topics, intent.category]
        }
      }));
      
      return {
        response: intent.response,
        followUp: intent.followUp
      };
    }
    
    // Enhanced fallback with context awareness
    const recentIntents = context.analytics.intents.slice(-3);
    const hasRecentBooking = recentIntents.includes('booking');
    
    if (hasRecentBooking) {
      return {
        response: 'I see you\'re interested in booking! 🚗\n\nI can help with:\n• Finding the right vehicle\n• Booking process\n• Payment options\n• Pickup locations\n• Document requirements\n\nWhat specific aspect would you like to know more about?',
        followUp: ['Start booking wizard', 'What documents do I need?', 'How do I cancel?', 'What if there\'s a problem?']
      };
    }
    
    return {
      response: `I understand you're asking about: "${userMessage}" 🤔\n\nI can help you with:\n• Booking vehicles (start booking wizard)\n• Listing your car (start listing wizard)\n• Pricing information\n• Safety & insurance\n• Payment methods\n• Locations\n• Document requirements\n• General support\n\nWhat would you like to know more about?`,
      followUp: ['Start booking wizard', 'Start listing wizard', 'What are your prices?', 'Is it safe?']
    };
  }, [classifyIntent, context.currentFlow, handleFlowStep, startFlow, context.analytics.intents]);

  const handleSendMessage = async (messageText?: string, _selectedOption?: ConversationOption) => {
    const messageToSend = messageText || inputValue.trim();
    if (!messageToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageToSend,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
      context: {
        intent: 'user_input',
        confidence: 1.0,
        sentiment: 'neutral',
        language: context.preferences.language
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Update session data
    setContext(prev => ({
      ...prev,
      sessionData: {
        ...prev.sessionData,
        lastActivity: new Date(),
        messageCount: prev.sessionData.messageCount + 1
      }
    }));

    // Simulate typing delay
    const typingDelay = 800 + Math.random() * 1200;
    
    setTimeout(() => {
      const botResponseData = getBotResponse(messageToSend);
      
      if (botResponseData.response) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponseData.response,
          isUser: false,
          timestamp: new Date(),
          type: 'text',
          context: {
            intent: 'bot_response',
            confidence: 0.9,
            sentiment: 'positive',
            language: context.preferences.language
          }
        };
        
        setMessages(prev => [...prev, botResponse]);
      }
      setIsTyping(false);
    }, typingDelay);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    { text: 'Start booking wizard', icon: 'Car' },
    { text: 'Start listing wizard', icon: 'DollarSign' },
    { text: 'What are your prices?', icon: 'DollarSign' },
    { text: 'Is it safe?', icon: 'Shield' },
    { text: 'Contact support', icon: 'Phone' }
  ];

  const handleQuickReply = (replyText: string) => {
    handleSendMessage(replyText);
  };

  // Enhanced message rendering with different types
  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'booking_step':
        return renderBookingStepMessage(message);
      case 'carousel':
        return renderCarouselMessage(message);
      case 'form':
        return renderFormMessage(message);
      case 'confirmation':
        return renderConfirmationMessage(message);
      default:
        return renderTextMessage(message);
    }
  };

  const renderBookingStepMessage = (message: Message) => {
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex justify-start"
      >
        <div className="flex items-end space-x-1">
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            🤖
          </div>
          <div className="bg-white dark:bg-gray-700 px-3 py-2 rounded-lg rounded-bl-sm border border-gray-200 dark:border-gray-600 shadow-sm max-w-[200px]">
            <div className="text-xs whitespace-pre-line leading-relaxed">{message.text}</div>
            
            {/* Render options */}
            {message.metadata?.options && (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.metadata.options.map((option: ConversationOption, index: number) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSendMessage(option.text, option)}
                    className="text-[10px] bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 px-2 py-1 rounded-full transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            )}
            
            <p className="text-[10px] mt-1 text-gray-500 dark:text-gray-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCarouselMessage = (message: Message) => {
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex justify-start"
      >
        <div className="flex items-end space-x-1">
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            🤖
          </div>
          <div className="bg-white dark:bg-gray-700 px-3 py-2 rounded-lg rounded-bl-sm border border-gray-200 dark:border-gray-600 shadow-sm max-w-[250px]">
            <div className="text-xs whitespace-pre-line leading-relaxed">{message.text}</div>
            
            {/* Render carousel items */}
            {message.metadata?.carouselItems && (
              <div className="mt-2 space-y-2">
                {message.metadata.carouselItems.map((item: CarouselItem, index: number) => (
                  <motion.div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-600 p-2 rounded-lg border border-gray-200 dark:border-gray-500"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="font-medium text-xs">{item.title}</div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-300">{item.description}</div>
                    <motion.button
                      onClick={() => handleSendMessage(`Select ${item.title}`)}
                      className="mt-1 text-[10px] bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Select
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
            
            <p className="text-[10px] mt-1 text-gray-500 dark:text-gray-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderFormMessage = (message: Message) => {
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex justify-start"
      >
        <div className="flex items-end space-x-1">
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            🤖
          </div>
          <div className="bg-white dark:bg-gray-700 px-3 py-2 rounded-lg rounded-bl-sm border border-gray-200 dark:border-gray-600 shadow-sm max-w-[250px]">
            <div className="text-xs whitespace-pre-line leading-relaxed">{message.text}</div>
            
            {/* Render form fields */}
            {message.metadata?.formData && (
              <div className="mt-2 space-y-2">
                {message.metadata.formData.map((field: FormField, index: number) => (
                  <div key={index}>
                    <label className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                      {field.label} {field.required && '*'}
                    </label>
                    {field.type === 'select' ? (
                      <select className="w-full text-[10px] border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800">
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option, optIndex) => (
                          <option key={optIndex} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full text-[10px] border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                      />
                    )}
                  </div>
                ))}
                <motion.button
                  onClick={() => handleSendMessage('Submit form')}
                  className="w-full text-[10px] bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Submit
                </motion.button>
              </div>
            )}
            
            <p className="text-[10px] mt-1 text-gray-500 dark:text-gray-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderConfirmationMessage = (message: Message) => {
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex justify-start"
      >
        <div className="flex items-end space-x-1">
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            ✅
          </div>
          <div className="bg-green-50 dark:bg-green-900 px-3 py-2 rounded-lg rounded-bl-sm border border-green-200 dark:border-green-700 shadow-sm max-w-[250px]">
            <div className="text-xs whitespace-pre-line leading-relaxed text-green-800 dark:text-green-200">{message.text}</div>
            <p className="text-[10px] mt-1 text-green-600 dark:text-green-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderTextMessage = (message: Message) => {
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex items-end space-x-1 ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {!message.isUser && (
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              🤖
            </div>
          )}
          <div
            className={`max-w-[200px] px-3 py-2 rounded-lg shadow-sm ${
              message.isUser
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white rounded-br-sm'
                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-sm'
            }`}
          >
            <div className="text-xs whitespace-pre-line leading-relaxed">{message.text}</div>
            <p className={`text-[10px] mt-1 ${
              message.isUser ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {message.isUser && (
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              <Icon name="User" size="sm" />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Enhanced Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl z-50 transition-all duration-300 hover:shadow-blue-500/25"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open chat"
      >
        <div className="relative">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.svg
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </motion.svg>
            ) : (
              <motion.svg
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </motion.svg>
            )}
          </AnimatePresence>
          {/* Enhanced notification dot */}
          {!isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"
            />
          )}
        </div>
      </motion.button>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25, stiffness: 500 }}
            className="fixed bottom-20 right-4 w-80 h-[450px] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col backdrop-blur-sm bg-white/95 dark:bg-gray-900/95"
          >
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2 backdrop-blur-sm">
                  <span className="text-sm">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">RideShare Assistant</h3>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    <p className="text-xs text-green-100">Online</p>
                    {context.currentFlow && (
                      <span className="ml-2 text-xs bg-blue-500 px-1 rounded">
                        {context.currentFlow.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {/* Language selector */}
                <motion.button
                  onClick={() => {
                    const languages: ('en' | 'af' | 'zu')[] = ['en', 'af', 'zu'];
                    const currentIndex = languages.indexOf(context.preferences.language);
                    const nextLanguage = languages[(currentIndex + 1) % languages.length];
                    setContext(prev => ({ 
                      ...prev, 
                      preferences: { ...prev.preferences, language: nextLanguage }
                    }));
                  }}
                  className="text-white hover:text-green-200 transition-colors p-1.5 rounded hover:bg-white/10"
                  title={`Current language: ${context.preferences.language.toUpperCase()}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-xs font-bold">
                    {context.preferences.language === 'af' ? 'AF' : context.preferences.language === 'zu' ? 'ZU' : 'EN'}
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    setMessages([{
                      id: '1',
                      text: 'Hello! 👋 Welcome to RideShare SA! I\'m your intelligent assistant, ready to help you with bookings, listings, and any questions you might have. How can I assist you today?',
                      isUser: false,
                      timestamp: new Date(),
                      type: 'text',
                      context: {
                        intent: 'greeting',
                        confidence: 1.0,
                        sentiment: 'positive',
                        language: 'en'
                      }
                    }]);
                    setContext({
                      flowHistory: [],
                      userData: {},
                      preferences: {
                        language: 'en',
                        notifications: true,
                        voiceEnabled: false
                      },
                      sessionData: {
                        startTime: new Date(),
                        lastActivity: new Date(),
                        messageCount: 0
                      },
                      analytics: {
                        intents: [],
                        sentiments: [],
                        languages: [],
                        topics: []
                      }
                    });
                  }}
                  className="text-white hover:text-green-200 transition-colors p-1.5 rounded hover:bg-white/10"
                  title="Start new conversation"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-green-200 transition-colors p-1.5 rounded hover:bg-white/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Enhanced Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-800">
              {messages.map((message) => renderMessage(message))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-end space-x-1">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      🤖
                    </div>
                    <div className="bg-white dark:bg-gray-700 px-3 py-2 rounded-lg rounded-bl-sm border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">typing...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Quick Replies */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuickReply(reply.text)}
                      className="text-xs bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-gray-600 px-3 py-2 rounded-full transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-gray-500 flex items-center space-x-1 shadow-sm hover:shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon name={reply.icon} size="sm" />
                      <span>{reply.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-xs placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-sm focus:shadow-md"
                  />
                  {inputValue && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-none"
                  whileHover={{ scale: inputValue.trim() && !isTyping ? 1.05 : 1 }}
                  whileTap={{ scale: inputValue.trim() && !isTyping ? 0.95 : 1 }}
                >
                  {isTyping ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;