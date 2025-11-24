import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';
import SEO from '../components/SEO';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { usePageTracking } from '../hooks/useAnalytics';
import { heroVariants, containerVariants, itemVariants } from '../utils/motionVariants';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  usePageTracking();

  const handleEnterPlatform = () => {
    navigate('/home');
  };

  const features = [
    {
      icon: 'Shield',
      title: 'Safe & Secure',
      description: 'All vehicles are verified, insured, and backed by our comprehensive safety system. Real-time tracking and emergency support available.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: 'MapPin',
      title: 'Nationwide Coverage',
      description: 'Available across all 9 provinces of South Africa. From major cities to tourist destinations, find vehicles wherever you need them.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: 'CreditCard',
      title: 'Local Payment Options',
      description: 'Pay with EFT, PayFast, SnapScan, Zapper, or credit cards. Transparent pricing with no hidden fees.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: 'Car',
      title: 'Wide Vehicle Selection',
      description: 'Choose from sedans, SUVs, bakkies, trucks, luxury vehicles, and more. Find the perfect vehicle for your needs.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: 'Users',
      title: 'Trusted Community',
      description: 'Verified hosts and renters with ratings and reviews. Build trust through our community-driven platform.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: 'Clock',
      title: 'Flexible Booking',
      description: 'Book instantly or request approval. Same-day bookings available. Modify or cancel with ease.',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  const benefits = [
    {
      title: 'For Renters',
      items: [
        'Access thousands of vehicles across South Africa',
        'Competitive pricing with transparent fees',
        'Instant booking or request-based reservations',
        '24/7 customer support and roadside assistance',
        'Secure payment processing with multiple options'
      ]
    },
    {
      title: 'For Hosts',
      items: [
        'Earn extra income from your idle vehicle',
        'Set your own pricing and availability',
        'Comprehensive insurance coverage included',
        'Easy vehicle management dashboard',
        'Secure payment processing and tracking'
      ]
    }
  ];

  const vehicleTypes = [
    { type: 'car', icon: 'Car', label: 'Cars', description: 'Economy to luxury sedans' },
    { type: 'bakkie', icon: 'Truck', label: 'Bakkies', description: 'Toyota Hilux, Ford Ranger & more' },
    { type: 'suv', icon: 'Car', label: 'SUVs', description: 'Perfect for family trips' },
    { type: 'truck', icon: 'Truck', label: 'Trucks', description: 'Commercial vehicles' },
    { type: 'van', icon: 'Van', label: 'Vans', description: 'For moving & transport' },
    { type: 'luxury', icon: 'Car', label: 'Luxury', description: 'Premium vehicles' }
  ];

  return (
    <div className="page-background">
      <SEO 
        title="RideShare SA - South Africa's Leading Peer-to-Peer Vehicle Rental Platform"
        description="Rent vehicles from trusted hosts across South Africa. Find cars, bakkies, SUVs and more. Safe, secure, and insured rentals with local payment options including Payfast."
        keywords="vehicle rental South Africa, car rental Cape Town, bakkie rental Johannesburg, SUV rental Durban, peer-to-peer car sharing, Payfast payment, EFT car rental"
        url="https://rideshare-sa.co.za"
      />
      
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <motion.section 
          className="flex-1 flex flex-col items-center justify-center text-center text-white px-4 py-20 min-h-[90vh]"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <span className="text-6xl mb-4 block">🇿🇦</span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-6 text-shadow-lg font-heading">
              Welcome to RideShare SA
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-4 max-w-3xl mx-auto text-shadow-md font-body">
              South Africa's Premier Peer-to-Peer Vehicle Rental Platform
            </p>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/90 text-shadow-sm font-body">
              Connecting vehicle owners with renters across all 9 provinces. 
              From Cape Town to Johannesburg, discover a smarter way to rent and share vehicles.
            </p>
          </motion.div>

          {/* Main Enter Platform Button */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <GlassButton
              onClick={handleEnterPlatform}
              variant="primary"
              size="xl"
              icon={<Icon name="Car" size="xl" />}
              glow
              className="text-2xl px-12 py-8 font-bold"
            >
              Enter Platform →
            </GlassButton>
          </motion.div>

          {/* Secondary Info Buttons */}
          <motion.div 
            className="flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <GlassButton
              onClick={() => navigate('/pricing')}
              variant="secondary"
              size="md"
              icon={<Icon name="DollarSign" size="md" />}
            >
              View Pricing
            </GlassButton>
            <GlassButton
              onClick={() => navigate('/about')}
              variant="secondary"
              size="md"
              icon={<Icon name="Info" size="md" />}
            >
              Learn More
            </GlassButton>
            <GlassButton
              onClick={() => navigate('/faq')}
              variant="secondary"
              size="md"
              icon={<Icon name="HelpCircle" size="md" />}
            >
              FAQ
            </GlassButton>
          </motion.div>
        </motion.section>

        {/* What is RideShare SA Section */}
        <motion.section 
          className="py-20 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              variants={itemVariants}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading text-shadow-md">
                What is RideShare SA?
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <GlassCard
                level={3}
                animated
                className="p-8 md:p-12"
              >
                <p className="text-xl md:text-2xl text-white mb-6 font-body leading-relaxed">
                  <strong className="text-white font-bold">RideShare SA</strong> is an innovative peer-to-peer vehicle rental platform 
                  designed specifically for the South African market. We connect vehicle owners (hosts) with people who need 
                  to rent vehicles (renters), creating a trusted community marketplace for vehicle sharing.
                </p>
                <p className="text-lg md:text-xl text-white/80 mb-6 font-body leading-relaxed">
                  Whether you're a tourist exploring the Garden Route, a business professional needing a reliable vehicle, 
                  or a local looking for a bakkie to move furniture, RideShare SA makes it easy to find and rent the perfect 
                  vehicle from trusted hosts in your area.
                </p>
                <p className="text-lg md:text-xl text-white/80 font-body leading-relaxed">
                  For vehicle owners, RideShare SA provides an opportunity to earn extra income by renting out your vehicle 
                  when you're not using it. Our platform handles bookings, payments, and provides insurance coverage, making 
                  it safe and easy to become a host.
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          className="py-20 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading text-shadow-md">
                Why Choose RideShare SA?
              </h2>
              <p className="text-xl text-white/80 font-body text-shadow-sm max-w-2xl mx-auto">
                Experience the future of vehicle rental in South Africa
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div key={feature.title} variants={itemVariants}>
                  <GlassCard
                    level={3}
                    hover
                    animated
                    className="h-full p-6"
                    icon={
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon name={feature.icon} size="lg" className="text-white" />
                      </div>
                    }
                    title={feature.title}
                  >
                    <p className="text-white/80 font-body">{feature.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section 
          className="py-20 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading text-shadow-md">
                Benefits for Everyone
              </h2>
              <p className="text-xl text-white/80 font-body text-shadow-sm">
                Whether you're renting or hosting, we've got you covered
              </p>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {benefits.map((benefit) => (
                <motion.div key={benefit.title} variants={itemVariants}>
                  <GlassCard
                    level={3}
                    hover
                    animated
                    className="p-8 h-full"
                    title={benefit.title}
                  >
                    <ul className="space-y-3 mt-6">
                      {benefit.items.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon name="CheckCircle" size="sm" className="text-white" />
                          </div>
                          <span className="text-white/80 font-body">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Vehicle Types Section */}
        <motion.section 
          className="py-20 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading text-shadow-md">
                Explore Vehicle Types
              </h2>
              <p className="text-xl text-white/80 font-body text-shadow-sm">
                Choose from our diverse range of vehicles - from city cars to bush bakkies
              </p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {vehicleTypes.map((vehicle) => (
                <motion.div key={vehicle.type} variants={itemVariants}>
                  <GlassCard
                    level={2}
                    hover
                    animated
                    className="text-center p-6"
                    icon={<Icon name={vehicle.icon} size="xl" className="text-white/70 mx-auto mb-3" />}
                    title={vehicle.label}
                  >
                    <p className="text-white/60 text-sm font-body">{vehicle.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* South African Context Section */}
        <motion.section 
          className="py-20 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading text-shadow-md">
                Built for South Africa 🇿🇦
              </h2>
              <p className="text-xl text-white/80 font-body text-shadow-sm">
                Designed with South African needs in mind
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  className="p-6"
                  icon={<Icon name="MapPin" size="lg" className="text-white/70 mb-4" />}
                  title="Nationwide Coverage"
                >
                  <p className="text-white/80 font-body">
                    Available across all 9 provinces: Western Cape, Eastern Cape, KwaZulu-Natal, 
                    Gauteng, Mpumalanga, Limpopo, North West, Free State, and Northern Cape.
                    Major cities including Cape Town, Johannesburg, Durban, Pretoria, and Port Elizabeth.
                  </p>
                </GlassCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  className="p-6"
                  icon={<Icon name="CreditCard" size="lg" className="text-white/70 mb-4" />}
                  title="Local Payment Methods"
                >
                  <p className="text-white/80 font-body">
                    EFT transfers, PayFast, SnapScan, Zapper, and international credit cards supported.
                    Transparent pricing in ZAR with no hidden fees. Competitive rates for all vehicle types.
                  </p>
                </GlassCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  className="p-6"
                  icon={<Icon name="Globe" size="lg" className="text-white/70 mb-4" />}
                  title="Local Support"
                >
                  <p className="text-white/80 font-body">
                    Support for all 11 official languages. Cultural sensitivity and local business 
                    etiquette built into the platform. Loadshedding awareness, local events integration, 
                    and South African regulations compliance.
                  </p>
                </GlassCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  className="p-6"
                  icon={<Icon name="Car" size="lg" className="text-white/70 mb-4" />}
                  title="South African Vehicles"
                >
                  <p className="text-white/80 font-body">
                    Popular vehicles including Toyota Hilux, Ford Ranger, Toyota Fortuner, and more.
                    From economy cars to luxury vehicles, bakkies to SUVs - find what South Africans drive.
                  </p>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section 
          className="py-20 px-4"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto">
            <GlassCard
              level={4}
              glow
              animated
              className="text-center p-12"
            >
              <motion.h2 
                className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading text-shadow-md"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Ready to Experience RideShare SA?
              </motion.h2>
              <motion.p 
                className="text-xl text-white/80 mb-8 font-body text-shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Join thousands of satisfied customers across South Africa - from the Cape to the Kruger!
                Enter the platform to start browsing vehicles or list your own.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <GlassButton
                  onClick={handleEnterPlatform}
                  variant="primary"
                  size="lg"
                  icon={<Icon name="Car" size="md" />}
                  glow
                  className="w-full sm:w-auto text-lg px-8 py-6"
                >
                  Enter Platform →
                </GlassButton>
              </motion.div>
            </GlassCard>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default LandingPage;
