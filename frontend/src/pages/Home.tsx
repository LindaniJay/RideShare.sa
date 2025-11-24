import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';
import SEO from '../components/SEO';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { usePageTracking } from '../hooks/useAnalytics';
import { useAuth } from '../context/AuthContext';
import { heroVariants, containerVariants, itemVariants } from '../utils/motionVariants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Track page views
  usePageTracking();

  // Handle navigation to protected routes
  const handleProtectedNavigation = (path: string) => {
    if (!user) {
      // Store the intended destination and redirect to login
      sessionStorage.setItem('redirect', path);
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="page-background">
      <SEO 
        title="RideShare SA - South Africa's Leading Peer-to-Peer Vehicle Rental Platform"
        description="Rent vehicles from trusted hosts across South Africa. Find cars, bakkies, SUVs and more. Safe, secure, and insured rentals with local payment options including Payfast."
        keywords="vehicle rental South Africa, car rental Cape Town, bakkie rental Johannesburg, SUV rental Durban, peer-to-peer car sharing, Payfast payment, EFT car rental"
        url="https://rideshare-sa.co.za"
      />
      
      {/* Main Content Container */}
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center text-center text-white px-4 py-20"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-shadow-lg font-heading"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your Journey Starts Here
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-10 max-w-2xl text-shadow-md font-body"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover the perfect ride for your South African adventure. From Cape Town to Joburg, rent from trusted locals, or list your vehicle and earn extra income.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <GlassButton
              onClick={() => navigate('/search')}
              variant="primary"
              size="lg"
              icon={<Icon name="Search" size="md" />}
              glow
              className="w-full sm:w-auto"
            >
              Browse Rentals
            </GlassButton>
            <GlassButton
              onClick={() => navigate('/pricing')}
              variant="secondary"
              size="lg"
              icon={<Icon name="DollarSign" size="md" />}
              className="w-full sm:w-auto"
            >
              View Pricing
            </GlassButton>
            <GlassButton
              onClick={() => navigate('/register')}
              variant="accent"
              size="lg"
              icon={<Icon name="Plus" size="md" />}
              glow
              className="w-full sm:w-auto"
            >
              List Your Vehicle
            </GlassButton>
          </motion.div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div 
          className="py-20 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h2 className="text-4xl font-bold text-white mb-4 font-heading text-shadow-md">How It Works</h2>
              <p className="text-xl text-white/80 font-body text-shadow-sm">Simple steps to get started - it's lekker easy!</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  className="text-center p-8"
                  icon={
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl font-bold text-white">S</span>
                    </div>
                  }
                  title="Search & Browse"
                  subtitle="Find the perfect vehicle for your needs from our wide selection"
                >
                  <p className="text-white/80 font-body">Find the perfect vehicle for your needs from our wide selection</p>
                </GlassCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  className="text-center p-8"
                  icon={
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">📅</span>
                    </div>
                  }
                  title="Book & Pay"
                  subtitle="Secure booking with flexible payment options including Payfast, EFT, and SnapScan"
                >
                  <p className="text-white/80 font-body">Secure booking with flexible payment options including Payfast, EFT, and SnapScan</p>
                </GlassCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  className="text-center p-8"
                  icon={
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl font-bold text-white">D</span>
                    </div>
                  }
                  title="Drive & Enjoy"
                  subtitle="Pick up your vehicle and start your South African adventure - from the Cape to the Kruger!"
                >
                  <p className="text-white/80 font-body">Pick up your vehicle and start your South African adventure - from the Cape to the Kruger!</p>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Vehicle Types Section */}
        <motion.div 
          className="py-20 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h2 className="text-4xl font-bold text-white mb-4 font-heading text-shadow-md">Vehicle Types</h2>
              <p className="text-xl text-white/80 font-body text-shadow-sm">Choose from our diverse range of vehicles - from city cars to bush bakkies</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={2}
                  hover
                  animated
                  className="text-center p-6"
                  icon={<div className="text-4xl mb-4 font-bold text-white">C</div>}
                  title="Cars"
                  subtitle="Free"
                >
                  <p className="text-white font-semibold font-body">Free</p>
                </GlassCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={2}
                  hover
                  animated
                  className="text-center p-6"
                  icon={<Icon name="Truck" size="lg" className="text-white/50 mx-auto mb-4" />}
                  title="Bakkies"
                  subtitle="Free"
                >
                  <p className="text-white font-semibold font-body">Free</p>
                </GlassCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={2}
                  hover
                  animated
                  className="text-center p-6"
                  icon={<Icon name="Car" size="lg" className="text-white/50 mx-auto mb-4" />}
                  title="SUVs"
                  subtitle="Free"
                >
                  <p className="text-white font-semibold font-body">Free</p>
                </GlassCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={2}
                  hover
                  animated
                  className="text-center p-6"
                  icon={<Icon name="Car" size="lg" className="text-white/50 mx-auto mb-4" />}
                  title="Luxury"
                  subtitle="Free"
                >
                  <p className="text-white font-semibold font-body">Free</p>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Featured Vehicles Section */}
        <motion.div 
          className="py-20 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h2 className="text-4xl font-bold text-white mb-4 font-heading text-shadow-md">Featured Vehicles</h2>
              <p className="text-xl text-white/80 font-body text-shadow-sm">Diverse vehicles for every South African need - from city commutes to bush adventures</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Toyota Hilux - Popular SA Bakkie */}
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  className="p-6"
                  clickable
                  onClick={() => navigate('/search?type=bakkie')}
                >
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <div className="w-full h-48 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1558618047-7c0a4c4a3b4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                        alt="Toyota Hilux Bakkie" 
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
                      <div className="absolute bottom-4 left-4 text-center">
                        <Icon name="Truck" size="md" className="text-white/50 mx-auto mb-1" />
                        <p className="text-white text-sm font-medium">Toyota Hilux</p>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-heading">Toyota Hilux 4WD</h3>
                  <p className="text-white/80 mb-4 font-body">Legendary South African bakkie for farm work, construction, and outdoor adventures</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white font-heading">Free</span>
                    <GlassButton
                      onClick={() => navigate('/search?type=bakkie')}
                      variant="primary"
                      size="sm"
                      icon={<Icon name="Truck" size="sm" />}
                    >
                      View Bakkies
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Isuzu Truck - Commercial Vehicle */}
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  className="p-6"
                  clickable
                  onClick={() => navigate('/search?type=truck')}
                >
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <div className="w-full h-48 bg-gradient-to-br from-orange-600 to-red-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                        alt="Isuzu NPR 400 Truck" 
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
                      <div className="absolute bottom-4 left-4 text-center">
                        <Icon name="Truck" size="md" className="text-white/50 mx-auto mb-1" />
                        <p className="text-white text-sm font-medium">Isuzu NPR 400</p>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-heading">Isuzu NPR 400 Truck</h3>
                  <p className="text-white/80 mb-4 font-body">Reliable medium-duty truck for construction and delivery services across SA</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white font-heading">Free</span>
                    <GlassButton
                      onClick={() => navigate('/search?type=truck')}
                      variant="accent"
                      size="sm"
                      icon={<Icon name="Truck" size="sm" />}
                    >
                      View Trucks
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Toyota Quantum Minibus */}
              <motion.div variants={itemVariants}>
                <GlassCard
                  level={3}
                  hover
                  animated
                  className="p-6"
                  clickable
                  onClick={() => navigate('/search?type=minibus')}
                >
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <div className="w-full h-48 bg-gradient-to-br from-green-600 to-teal-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                        alt="Toyota Quantum Minibus" 
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
                      <div className="absolute bottom-4 left-4 text-center">
                        <Icon name="Bus" size="md" className="text-white/50 mx-auto mb-1" />
                        <p className="text-white text-sm font-medium">Toyota Quantum</p>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-heading">Toyota Quantum Minibus</h3>
                  <p className="text-white/80 mb-4 font-body">Popular South African minibus for group transport and airport shuttles</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white font-heading">Free</span>
                    <GlassButton
                      onClick={() => navigate('/search?type=minibus')}
                      variant="primary"
                      size="sm"
                      icon={<Icon name="Bus" size="sm" />}
                    >
                      View Minibuses
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </motion.div>
            
        {/* Vehicle Categories */}
        <motion.div 
          className="py-20 px-4"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="mt-16"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h3 
                className="text-2xl font-bold text-white text-center mb-8 font-heading text-shadow-md"
                variants={itemVariants}
              >
                Explore All Vehicle Types
              </motion.h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { type: 'car', icon: 'Car', label: 'Cars' },
                  { type: 'bakkie', icon: 'Truck', label: 'Bakkies' },
                  { type: 'truck', icon: 'Truck', label: 'Trucks' },
                  { type: 'van', icon: 'Van', label: 'Vans' },
                  { type: 'minibus', icon: 'Bus', label: 'Minibuses' },
                  { type: 'motorcycle', icon: 'Motorcycle', label: 'Motorcycles' }
                ].map((category) => (
                  <motion.div key={category.type} variants={itemVariants}>
                    <GlassCard
                      level={2}
                      hover
                      animated
                      className="p-4 text-center"
                      clickable
                      onClick={() => navigate(`/search?type=${category.type}`)}
                      icon={<Icon name={category.icon} size="lg" className="text-white/50 mx-auto mb-2" />}
                      title={category.label}
                    >
                      <p className="text-white font-medium font-body">{category.label}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GlassButton
                onClick={() => handleProtectedNavigation('/dashboard/host')}
                variant="primary"
                size="lg"
                icon={<Icon name="Plus" size="md" />}
                glow
              >
                Become a Host
              </GlassButton>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="py-20 px-4"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-4xl font-bold text-white mb-6 font-heading text-shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Ready to Start Your Journey?
            </motion.h2>
            <motion.p 
              className="text-xl text-white/80 mb-8 font-body text-shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Join thousands of satisfied customers across South Africa - from the Cape to the Kruger!
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <GlassButton
                onClick={() => navigate('/search')}
                variant="primary"
                size="lg"
                icon={<Icon name="Search" size="md" />}
                glow
                className="w-full sm:w-auto"
              >
                Start Your Journey
              </GlassButton>
              <GlassButton
                onClick={() => navigate('/search')}
                variant="accent"
                size="lg"
                icon={<Icon name="Car" size="md" />}
                glow
                className="w-full sm:w-auto"
              >
                Browse Vehicles
              </GlassButton>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;