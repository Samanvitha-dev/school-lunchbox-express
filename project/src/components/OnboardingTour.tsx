import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers } from '../data/mockDatabase';
import { CheckCircle, ArrowRight, Users, Package, Truck, School, ChefHat, Star } from 'lucide-react';

const OnboardingTour: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const getOnboardingSteps = () => {
    switch (user?.userType) {
      case 'parent':
        return [
          {
            title: 'Welcome to LunchBox Express!',
            description: 'Your one-stop solution for school lunch deliveries',
            icon: Users,
            tips: [
              'Add your children\'s details and school information',
              'Set dietary preferences and allergies',
              'Book lunch deliveries from home or caterers'
            ]
          },
          {
            title: 'Add Your Children',
            description: 'Start by adding your children\'s information',
            icon: Users,
            tips: [
              'Click on "My Children" section',
              'Add each child with their school details',
              'Set allergies and food preferences'
            ]
          },
          {
            title: 'Book Your First Order',
            description: 'Choose between home-cooked meals or caterer options',
            icon: Package,
            tips: [
              'Select "Home" for traditional dabbawala service',
              'Choose "Caterers" for variety of healthy meal options',
              'Track your order in real-time'
            ]
          },
          {
            title: 'Earn Loyalty Points',
            description: 'Get rewarded for every order you place',
            icon: Star,
            tips: [
              'Earn points with each successful delivery',
              'Redeem points for discounts',
              'Check your points balance in the dashboard'
            ]
          }
        ];

      case 'delivery':
        return [
          {
            title: 'Welcome, Delivery Partner!',
            description: 'Start earning by delivering lunch boxes',
            icon: Truck,
            tips: [
              'Accept delivery requests in your area',
              'Follow optimized routes for efficiency',
              'Confirm pickups and deliveries'
            ]
          },
          {
            title: 'Accept Orders',
            description: 'New orders will appear in your dashboard',
            icon: Package,
            tips: [
              'Tap "Accept Delivery" to take an order',
              'View pickup and delivery addresses',
              'Contact parents if needed'
            ]
          },
          {
            title: 'Track Your Progress',
            description: 'Update order status as you complete deliveries',
            icon: CheckCircle,
            tips: [
              'Mark orders as "Picked" after collection',
              'Update to "In Progress" when traveling',
              'Confirm "Delivered" at the school'
            ]
          }
        ];

      case 'school':
        return [
          {
            title: 'Welcome, School Admin!',
            description: 'Manage lunch deliveries for your school',
            icon: School,
            tips: [
              'View expected deliveries for each day',
              'Track which students have received their meals',
              'Report missing deliveries to parents'
            ]
          },
          {
            title: 'Daily Delivery Tracking',
            description: 'Monitor all incoming lunch deliveries',
            icon: Package,
            tips: [
              'Check the dashboard for today\'s expected deliveries',
              'Verify QR codes when meals arrive',
              'Contact parents about missing deliveries'
            ]
          }
        ];

      case 'caterer':
        return [
          {
            title: 'Welcome to Your Kitchen!',
            description: 'Provide healthy meals for school children',
            icon: ChefHat,
            tips: [
              'Create and manage your daily menu',
              'Set prices and nutritional information',
              'Track orders and customer feedback'
            ]
          },
          {
            title: 'Manage Your Menu',
            description: 'Add delicious and nutritious meal options',
            icon: Package,
            tips: [
              'Click "Add New Item" to create menu items',
              'Include nutritional information and allergen details',
              'Upload appetizing photos of your meals'
            ]
          },
          {
            title: 'Track Your Business',
            description: 'Monitor orders, revenue, and customer satisfaction',
            icon: Star,
            tips: [
              'View daily orders and revenue in the dashboard',
              'Check customer ratings and feedback',
              'Analyze popular menu items'
            ]
          }
        ];

      default:
        return [];
    }
  };

  const steps = getOnboardingSteps();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete
      const allUsers = getAllUsers();
      const currentUser = allUsers.find(u => u.id === user?.id);
      if (currentUser) {
        currentUser.isFirstLogin = false;
      }
      window.location.reload();
    }
  };

  const handleSkip = () => {
    const allUsers = getAllUsers();
    const currentUser = allUsers.find(u => u.id === user?.id);
    if (currentUser) {
      currentUser.isFirstLogin = false;
    }
    window.location.reload();
  };

  if (steps.length === 0) {
    handleSkip();
    return null;
  }

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Skip tour
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <StepIcon className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {currentStepData.title}
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              {currentStepData.description}
            </p>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Tips:</h3>
              <ul className="space-y-3 text-left">
                {currentStepData.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;