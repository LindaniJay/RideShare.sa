import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import GlassCard from '../components/GlassCard';
import SEO from '../components/SEO';
import { usePageTracking } from '../hooks/useAnalytics';
import { 
  VEHICLE_CATEGORIES, 
  CHARTER_OPTIONS, 
  // formatPrice, 
  getPriceRange,
  getPopularCategories 
} from '../data/pricing';

const Pricing: React.FC = () => {
  usePageTracking();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const tabs = [
    { id: 'daily', label: 'Daily Rates', icon: 'Calendar' },
    { id: 'weekly', label: 'Weekly Rates', icon: 'Calendar' },
    { id: 'monthly', label: 'Monthly Rates', icon: 'Calendar' }
  ];

  const popularCategories = getPopularCategories();

  return (
    <div className="page-background">
      <SEO 
        title="Free Vehicle Rental - RideShare SA"
        description="Completely free vehicle rentals in South Africa. From economy cars to luxury coaches, all vehicles available at zero cost."
        keywords="free vehicle rental South Africa, free car rental Cape Town, free bakkie rental Johannesburg, free SUV rental Durban, zero cost rental"
        url="https://rideshare-sa.co.za/pricing"
      />
      
      <div className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              Free Vehicle Rental
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              All vehicle rentals are completely free! No hidden fees, no surprises. Experience our full range of vehicles at zero cost.
            </p>
          </div>

          {/* Pricing Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Icon name={tab.icon} size="sm" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Categories */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Popular Vehicle Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCategories.map((category) => (
                <GlassCard key={category.id} className="p-6 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                      <Icon name={category.icon} size="lg" className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{category.name}</h3>
                      <p className="text-white/70 text-sm">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white mb-2">
                      {getPriceRange(
                        category.pricing[activeTab].min,
                        category.pricing[activeTab].max
                      )}
                    </div>
                    <div className="text-white/60 text-sm">
                      per {activeTab === 'daily' ? 'day' : activeTab === 'weekly' ? 'week' : 'month'}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {category.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-white/80 text-sm">
                        <Icon name="Check" size="sm" className="text-green-400 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Link
                    to={`/search?category=${category.id}`}
                    className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Browse {category.name}
                  </Link>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* All Categories */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              All Vehicle Categories
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {VEHICLE_CATEGORIES.map((category) => (
                <GlassCard key={category.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                        <Icon name={category.icon} size="sm" className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{category.name}</h3>
                        <p className="text-white/70 text-sm">{category.description}</p>
                      </div>
                    </div>
                    {category.popular && (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {getPriceRange(category.pricing.daily.min, category.pricing.daily.max)}
                      </div>
                      <div className="text-white/60 text-xs">Daily</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {getPriceRange(category.pricing.weekly.min, category.pricing.weekly.max)}
                      </div>
                      <div className="text-white/60 text-xs">Weekly</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {getPriceRange(category.pricing.monthly.min, category.pricing.monthly.max)}
                      </div>
                      <div className="text-white/60 text-xs">Monthly</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {category.features.map((feature, index) => (
                      <span key={index} className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/search?category=${category.id}`}
                    className="block w-full bg-white/10 text-white text-center py-2 rounded-lg font-medium hover:bg-white/20 transition-all duration-300"
                  >
                    View {category.name}
                  </Link>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Charter Options */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Short-term Charter Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CHARTER_OPTIONS.map((option) => (
                <GlassCard key={option.id} className="p-6 text-center">
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white mb-2">
                      {getPriceRange(option.pricing.min, option.pricing.max)}
                    </div>
                    <div className="text-white/60 text-sm">{option.duration}</div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{option.name}</h3>
                  <p className="text-white/70 text-sm mb-4">{option.description}</p>
                  
                  <div className="bg-white/10 rounded-lg p-3 mb-4">
                    <div className="text-white font-semibold">{option.seats} Seats</div>
                  </div>

                  <Link
                    to="/contact"
                    className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Book Charter
                  </Link>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Get Your Free Vehicle?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Browse our extensive selection of vehicles and get your perfect match completely free of charge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Browse All Vehicles
              </Link>
              <Link
                to="/contact"
                className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transform hover:scale-105 transition-all duration-300 border border-white/20"
              >
                Get Custom Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
