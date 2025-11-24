import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { apiClient } from '../api/client';

interface PlatformStats {
  totalVehicles: number;
  totalRenters: number;
  totalEarnings: number;
  activeHosts: number;
  completedBookings: number;
  averageRating: number;
}

const About: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalVehicles: 0,
    totalRenters: 0,
    totalEarnings: 0,
    activeHosts: 0,
    completedBookings: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        // Keep stats at zero if API fails - no fallback values
        setStats({
          totalVehicles: 0,
          totalRenters: 0,
          totalEarnings: 0,
          activeHosts: 0,
          completedBookings: 0,
          averageRating: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K+`;
    }
    return num.toString();
  };

  return (
    <div className="page-background">
      {/* Main Content Container */}
      <div className="min-h-screen flex flex-col">
          {/* Hero Section */}
          <div className="flex-1 flex flex-col items-center justify-center text-center text-white px-4 py-20">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
              About RideShare SA
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl drop-shadow-md">
              South Africa's premier peer-to-peer vehicle rental platform, connecting locals and travelers across the Rainbow Nation.
            </p>
          </div>

          {/* Mission & Vision Section */}
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              {/* Mission Statement */}
              <div className="mb-20">
                <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-white/20">
                  <div className="text-center mb-8">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">Our Mission</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-green-500 mx-auto rounded-full"></div>
                  </div>
                  <div className="max-w-4xl mx-auto">
                    <blockquote className="text-2xl md:text-3xl font-medium text-white text-center leading-relaxed mb-8 italic">
                      "To democratize vehicle access across South Africa by connecting vehicle owners with renters through a trusted, secure, and user-friendly platform that creates economic opportunities for hosts while providing affordable, convenient transportation solutions for all South Africans."
                    </blockquote>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                        <h3 className="text-xl font-bold text-white mb-4">🎯 Mission Focus Areas</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start space-x-3">
                            <span className="text-green-400 mt-1">✓</span>
                            <span className="text-white text-opacity-90">Democratize vehicle access for all South Africans</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-green-400 mt-1">✓</span>
                            <span className="text-white text-opacity-90">Create economic opportunities for vehicle owners</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-green-400 mt-1">✓</span>
                            <span className="text-white text-opacity-90">Build trust through security and verification</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-green-400 mt-1">✓</span>
                            <span className="text-white text-opacity-90">Provide affordable transportation solutions</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                        <h3 className="text-xl font-bold text-white mb-4">🇿🇦 South African Focus</h3>
                        <ul className="space-y-3">
                          <li className="flex items-center space-x-3">
                            <span className="text-green-400">✓</span>
                            <span className="text-white text-opacity-90">Local payment methods (EFT, SnapScan)</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <span className="text-green-400">✓</span>
                            <span className="text-white text-opacity-90">South African insurance coverage</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <span className="text-green-400">✓</span>
                            <span className="text-white text-opacity-90">24/7 support in English & Afrikaans</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <span className="text-green-400">✓</span>
                            <span className="text-white text-opacity-90">Coverage across all 9 provinces</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision Statement */}
              <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-white/20">
                <div className="text-center mb-8">
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">Our Vision</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-green-500 mx-auto rounded-full"></div>
                </div>
                <div className="max-w-4xl mx-auto">
                  <blockquote className="text-2xl md:text-3xl font-medium text-white text-center leading-relaxed mb-8 italic">
                    "To become South Africa's leading peer-to-peer vehicle sharing platform, transforming how South Africans access transportation while building a sustainable sharing economy that empowers communities, reduces vehicle underutilization, and creates a more connected, mobile society."
                  </blockquote>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                      <div className="text-4xl mb-4">🏆</div>
                      <h3 className="text-xl font-bold text-white mb-2">Market Leadership</h3>
                      <p className="text-white text-opacity-80 text-sm">Leading platform in South African peer-to-peer vehicle sharing</p>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                      <div className="text-4xl mb-4">🌱</div>
                      <h3 className="text-xl font-bold text-white mb-2">Sustainable Future</h3>
                      <p className="text-white text-opacity-80 text-sm">Building a sustainable sharing economy for South Africa</p>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                      <div className="text-4xl mb-4">🤝</div>
                      <h3 className="text-xl font-bold text-white mb-2">Community Impact</h3>
                      <p className="text-white text-opacity-80 text-sm">Empowering communities and reducing vehicle underutilization</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CEO Message Section */}
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-white/20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                  <div className="lg:col-span-1 text-center lg:text-left">
                    <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                      <span className="text-4xl">👨‍💼</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Piwe Toni</h3>
                    <p className="text-white/80 mb-4">Founder & CEO</p>
                    <div className="flex justify-center lg:justify-start space-x-4">
                      <a href="https://linkedin.com/in/piwe-toni" className="text-white/60 hover:text-white transition-colors">
                        <Icon name="Linkedin" size="sm" />
                      </a>
                      <a href="https://twitter.com/piwetoniceo" className="text-white/60 hover:text-white transition-colors">
                        <Icon name="Twitter" size="sm" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <div className="absolute -top-4 -left-4 text-6xl text-white/20">"</div>
                      <blockquote className="text-xl text-white leading-relaxed mb-6 italic">
                        "Growing up in Cape Town, I witnessed firsthand how transportation challenges limited opportunities for my community. 
                        The idea for RideShare SA came from a simple belief: every South African deserves access to reliable, affordable transportation, 
                        and every vehicle owner should have the opportunity to generate income from their assets."
                      </blockquote>
                      <blockquote className="text-lg text-white/90 leading-relaxed mb-6">
                        "We're not just building a platform – we're creating economic opportunities, connecting communities, and making South Africa 
                        more accessible for everyone. From the bustling streets of Cape Town to the scenic routes of KwaZulu-Natal, 
                        RideShare SA is about empowering South Africans to share, connect, and thrive together."
                      </blockquote>
                      <blockquote className="text-lg text-white/90 leading-relaxed">
                        "Our vision extends beyond just car sharing. We're building a sustainable future where shared mobility reduces our carbon footprint, 
                        creates jobs, and strengthens local economies. Every booking on our platform represents a step toward a more connected, 
                        prosperous South Africa."
                      </blockquote>
                      <div className="absolute -bottom-4 -right-4 text-6xl text-white/20">"</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Stats Section */}
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">Our Impact</h2>
                <p className="text-xl text-white text-opacity-90 max-w-3xl mx-auto drop-shadow-md">Building a connected South Africa, one ride at a time</p>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center">
                      <div className="h-12 bg-white/20 rounded animate-pulse mb-2"></div>
                      <div className="h-6 bg-white/20 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
                    <div className="text-4xl font-bold text-white mb-2">
                      {formatNumber(stats.totalVehicles)}
                    </div>
                    <div className="text-white text-opacity-80">Vehicles Listed</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
                    <div className="text-4xl font-bold text-white mb-2">
                      {formatNumber(stats.totalRenters)}
                    </div>
                    <div className="text-white text-opacity-80">Happy Renters</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
                    <div className="text-4xl font-bold text-white mb-2">
                      R {formatNumber(stats.totalEarnings)}
                    </div>
                    <div className="text-white text-opacity-80">Earned by Hosts</div>
                  </div>
                </div>
              )}
              
              {/* Additional Stats Row */}
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                  <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
                    <div className="text-4xl font-bold text-white mb-2">
                      {formatNumber(stats.activeHosts)}
                    </div>
                    <div className="text-white text-opacity-80">Active Hosts</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
                    <div className="text-4xl font-bold text-white mb-2">
                      {formatNumber(stats.completedBookings)}
                    </div>
                    <div className="text-white text-opacity-80">Completed Bookings</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
                    <div className="text-4xl font-bold text-white mb-2">
                      {(stats.averageRating || 0).toFixed(1)}★
                    </div>
                    <div className="text-white text-opacity-80">Average Rating</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Section */}
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">Meet Our Team</h2>
                <p className="text-xl text-white text-opacity-90 max-w-3xl mx-auto drop-shadow-md">The passionate South Africans behind RideShare SA</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">👨‍💼</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Leadership Team</h3>
                  <p className="text-white text-opacity-80">Experienced entrepreneurs with deep roots in South African business</p>
                </div>
                
                <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">👩‍💻</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tech Team</h3>
                  <p className="text-white text-opacity-80">Innovative developers building the future of mobility in South Africa</p>
                </div>
                
                <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Community Team</h3>
                  <p className="text-white text-opacity-80">Dedicated to supporting our hosts and renters across all 9 provinces</p>
                </div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">Our Core Values</h2>
                <p className="text-xl text-white text-opacity-90 max-w-3xl mx-auto drop-shadow-md">The principles that guide everything we do at RideShare SA</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold text-white mb-2">Trust & Safety</h3>
                  <p className="text-white text-opacity-80 text-sm">Every interaction built on trust with comprehensive verification and insurance</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-4xl mb-4">♿</div>
                  <h3 className="text-xl font-bold text-white mb-2">Accessibility</h3>
                  <p className="text-white text-opacity-80 text-sm">Transportation available to everyone, regardless of income level</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-4xl mb-4">🏘️</div>
                  <h3 className="text-xl font-bold text-white mb-2">Community</h3>
                  <p className="text-white text-opacity-80 text-sm">Fostering connections between South Africans through shared mobility</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="mb-4">
                    <Icon name="Zap" size="lg" className="text-white/50 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Innovation</h3>
                  <p className="text-white text-opacity-80 text-sm">Leveraging technology to solve real transportation challenges</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-4xl mb-4">🌱</div>
                  <h3 className="text-xl font-bold text-white mb-2">Sustainability</h3>
                  <p className="text-white text-opacity-80 text-sm">Promoting efficient use of existing vehicles rather than increasing ownership</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-4xl mb-4">🇿🇦</div>
                  <h3 className="text-xl font-bold text-white mb-2">Local Focus</h3>
                  <p className="text-white text-opacity-80 text-sm">Understanding and serving the unique needs of South African communities</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-white mb-2">Transparency</h3>
                  <p className="text-white text-opacity-80 text-sm">Clear pricing, honest communication, and fair practices</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-4xl mb-4">💪</div>
                  <h3 className="text-xl font-bold text-white mb-2">Empowerment</h3>
                  <p className="text-white text-opacity-80 text-sm">Enabling both hosts and renters to achieve their goals</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">Join the RideShare SA Community</h2>
              <p className="text-xl text-white text-opacity-90 mb-12 max-w-3xl mx-auto drop-shadow-md">
                Be part of South Africa's growing sharing economy. Whether you're looking to rent or list your vehicle, we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/search" 
                  className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transform hover:scale-105 transition-all duration-300 border border-white/20"
                >
                  Browse Vehicles
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Become a Host
                </Link>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default About;