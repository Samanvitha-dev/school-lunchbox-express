import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../services/authService';
import { ArrowLeft, Users, Truck, School as SchoolIcon, ChefHat, MapPin, Phone, Mail, User as UserIcon, Building, Calendar } from 'lucide-react';

interface SignUpPageProps {
  onBackToLogin: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'parent' | 'delivery' | 'school' | 'caterer'>('parent');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Parent specific
    houseNo: '',
    locationName: '',
    cityName: '',
    address: '',
    // Delivery specific
    name: '',
    vehicleType: '',
    vehicleNumber: '',
    serviceArea: '',
    // School specific
    schoolName: '',
    schoolId: '',
    contactPerson: '',
    establishedYear: '',
    classes: '',
    // Caterer specific
    businessName: '',
    contactPersonCaterer: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const userTypes = [
    {
      type: 'parent' as const,
      title: 'Parent',
      description: 'Book and track lunch deliveries for your children',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      type: 'delivery' as const,
      title: 'Delivery Partner',
      description: 'Join our delivery network and earn money',
      icon: Truck,
      color: 'bg-green-500'
    },
    {
      type: 'school' as const,
      title: 'School Admin',
      description: 'Manage lunch deliveries for your school',
      icon: SchoolIcon,
      color: 'bg-purple-500'
    },
    {
      type: 'caterer' as const,
      title: 'Caterer',
      description: 'Provide healthy meals for school children',
      icon: ChefHat,
      color: 'bg-orange-500'
    }
  ];

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.username.trim()) newErrors.push('Username is required');
    if (!formData.email.trim()) newErrors.push('Email is required');
    if (!formData.phone.trim()) newErrors.push('Phone number is required');
    if (!formData.password) newErrors.push('Password is required');
    if (formData.password !== formData.confirmPassword) newErrors.push('Passwords do not match');
    if (formData.password.length < 6) newErrors.push('Password must be at least 6 characters');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.push('Please enter a valid email address');
    }

    // Phone validation
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.push('Please enter a valid phone number');
    }

    // Type-specific validations
    if (userType === 'parent') {
      if (!formData.locationName.trim()) newErrors.push('Location name is required');
      if (!formData.cityName.trim()) newErrors.push('City name is required');
      if (!formData.address.trim()) newErrors.push('Full address is required');
    } else if (userType === 'delivery') {
      if (!formData.name.trim()) newErrors.push('Full name is required');
      if (!formData.vehicleType.trim()) newErrors.push('Vehicle type is required');
      if (!formData.vehicleNumber.trim()) newErrors.push('Vehicle number is required');
      if (!formData.locationName.trim()) newErrors.push('Location is required');
      if (!formData.serviceArea.trim()) newErrors.push('Service area is required');
    } else if (userType === 'school') {
      if (!formData.schoolName.trim()) newErrors.push('School name is required');
      if (!formData.schoolId.trim()) newErrors.push('School ID is required');
      if (!formData.contactPerson.trim()) newErrors.push('Contact person is required');
      if (!formData.locationName.trim()) newErrors.push('Location is required');
    } else if (userType === 'caterer') {
      if (!formData.businessName.trim()) newErrors.push('Business name is required');
      if (!formData.contactPersonCaterer.trim()) newErrors.push('Contact person is required');
      if (!formData.locationName.trim()) newErrors.push('Location is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const userData: RegisterData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone.replace(/[-\s]/g, ''),
        password: formData.password,
        userType
      };

      switch (userType) {
        case 'parent':
          userData.houseNo = formData.houseNo;
          userData.locationName = formData.locationName;
          userData.cityName = formData.cityName;
          userData.address = formData.address;
          break;

        case 'delivery':
          userData.name = formData.name;
          userData.vehicleType = formData.vehicleType;
          userData.vehicleNumber = formData.vehicleNumber;
          userData.locationName = formData.locationName;
          userData.serviceArea = formData.serviceArea || formData.locationName || 'Balaji Nagar';
          userData.address = formData.address;
          break;

        case 'school':
          userData.schoolName = formData.schoolName;
          userData.schoolId = formData.schoolId;
          userData.contactPerson = formData.contactPerson;
          userData.establishedYear = String(parseInt(formData.establishedYear || '2000', 10));
          userData.classes = formData.classes;
          userData.locationName = formData.locationName;
          userData.address = formData.address;
          break;

        case 'caterer':
          userData.businessName = formData.businessName;
          userData.contactPersonCaterer = formData.contactPersonCaterer;
          userData.locationName = formData.locationName;
          userData.address = formData.address;
          break;
      }

      const success = await register(userData);
      if (success) {
        // Registration successful, user will be redirected
      } else {
        setErrors(['Registration failed. Please try again.']);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(['Registration failed. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const renderUserTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Role</h2>
        <p className="text-gray-600">Select how you'll be using LunchBox Express</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.type}
              onClick={() => {
                setUserType(type.type);
                setStep(2);
              }}
              className={`p-6 border-2 rounded-xl text-left transition-all duration-200 hover:shadow-lg ${
                userType === type.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`${type.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{type.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Create {userTypes.find(t => t.type === userType)?.title} Account
        </h2>
        <p className="text-gray-600">Fill in your details to get started</p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul className="text-red-600 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
          <UserIcon className="w-4 h-4" />
          <span>Basic Information</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91-9876543210"
              />
            </div>
          </div>

          {userType === 'delivery' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm password"
            />
          </div>
        </div>
      </div>

      {/* Role-specific fields */}
      {userType === 'parent' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Address Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location Name *</label>
              <select
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Location</option>
                <option value="Balaji Nagar">Balaji Nagar</option>
                <option value="AC Nagar">AC Nagar</option>
                <option value="Stonehousepeta">Stonehousepeta</option>
                <option value="Harinathpuram">Harinathpuram</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City Name *</label>
              <input
                type="text"
                value={formData.cityName}
                onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nellore"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Complete address with pincode"
            />
          </div>
        </div>
      )}

      {userType === 'delivery' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
            <Truck className="w-4 h-4" />
            <span>Delivery Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <select
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Location</option>
                <option value="Balaji Nagar">Balaji Nagar</option>
                <option value="AC Nagar">AC Nagar</option>
                <option value="Stonehousepeta">Stonehousepeta</option>
                <option value="Harinathpuram">Harinathpuram</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select vehicle type</option>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Car">Car</option>
              </select>
            </div>

          </div>
          
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number *</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="KA-05-MN-1234"
              />
            </div>
        </div>
      )}

      {userType === 'school' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>School Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <select
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Location</option>
                <option value="Balaji Nagar">Balaji Nagar</option>
                <option value="AC Nagar">AC Nagar</option>
                <option value="Stonehousepeta">Stonehousepeta</option>
                <option value="Harinathpuram">Harinathpuram</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Name *</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Delhi Public School"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School ID *</label>
              <input
                type="text"
                value={formData.schoolId}
                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="DPS001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mrs. Sunita Rao"
              />
            </div>

          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Established Year *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1995"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classes Offered *</label>
            <input
              type="text"
              value={formData.classes}
              onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1st Grade, 2nd Grade, 3rd Grade (comma separated)"
            />
          </div>
          </div>
        </div>
      )}

      {userType === 'caterer' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
            <ChefHat className="w-4 h-4" />
            <span>Business Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <select
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Location</option>
                <option value="Balaji Nagar">Balaji Nagar</option>
                <option value="AC Nagar">AC Nagar</option>
                <option value="Stonehousepeta">Stonehousepeta</option>
                <option value="Harinathpuram">Harinathpuram</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Healthy Bites Kitchen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
              <input
                type="text"
                value={formData.contactPersonCaterer}
                onChange={(e) => setFormData({ ...formData, contactPersonCaterer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Chef Priya Nair"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <>
              <UserIcon className="w-4 h-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={onBackToLogin}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
            
            <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join LunchBox Express</h1>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Content */}
          {step === 1 ? renderUserTypeSelection() : renderForm()}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;