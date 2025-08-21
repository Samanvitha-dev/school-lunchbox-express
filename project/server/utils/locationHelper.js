// Location helper functions for Nellore city mapping

const locationCoordinates = {
  'Balaji Nagar': { lat: 14.4426, lng: 79.9865, code: '1' },
  'AC Nagar': { lat: 14.4500, lng: 79.9900, code: '2' },
  'Stonehousepeta': { lat: 14.4400, lng: 79.9800, code: '3' },
  'Harinathpuram': { lat: 14.4350, lng: 79.9750, code: '4' }
};

// Generate door number based on type and location
const generateDoorNumber = (type, locationName, number = 1) => {
  const typeCode = {
    'house': 'H',
    'school': 'S',
    'caterer': 'C',
    'delivery': 'D'
  };
  
  const locationCode = locationCoordinates[locationName]?.code || '1';
  const numberCode = number.toString().padStart(2, '0');
  
  return `${typeCode[type]}${locationCode}${numberCode}`;
};

// Get coordinates from door number
const getCoordinatesFromDoorNumber = (doorNo) => {
  const locationCode = doorNo.charAt(1);
  const locationName = Object.keys(locationCoordinates).find(
    key => locationCoordinates[key].code === locationCode
  );
  
  if (!locationName) return null;
  
  const baseCoords = locationCoordinates[locationName];
  const number = parseInt(doorNo.slice(2));
  
  // Add small offset for different houses/buildings
  const offset = (number - 1) * 0.0002;
  
  return {
    latitude: baseCoords.lat + offset,
    longitude: baseCoords.lng + offset,
    locationName,
    address: `${doorNo}, ${locationName}, Nellore`
  };
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate delivery charge based on distance
const calculateDeliveryCharge = (distance) => {
  const baseCharge = 15; // Base charge in rupees
  const perKmCharge = 5; // Additional charge per km
  return baseCharge + (distance * perKmCharge);
};

// Get available door numbers for a location and type
const getAvailableDoorNumbers = async (db, type, locationName) => {
  const locationCode = locationCoordinates[locationName]?.code || '1';
  const typeCode = {
    'house': 'H',
    'school': 'S',
    'caterer': 'C',
    'delivery': 'D'
  };
  
  const pattern = `${typeCode[type]}${locationCode}%`;
  
  const result = await db.query(
    'SELECT door_no FROM users WHERE door_no LIKE $1',
    [pattern]
  );
  
  const usedNumbers = result.rows.map(row => parseInt(row.door_no.slice(2)));
  
  // For houses, we have 4 available (01-04)
  // For schools/caterers, we have 1 available (01)
  const maxNumbers = type === 'house' ? 4 : 1;
  
  for (let i = 1; i <= maxNumbers; i++) {
    if (!usedNumbers.includes(i)) {
      return generateDoorNumber(type, locationName, i);
    }
  }
  
  return null; // No available door numbers
};

module.exports = {
  locationCoordinates,
  generateDoorNumber,
  getCoordinatesFromDoorNumber,
  calculateDistance,
  calculateDeliveryCharge,
  getAvailableDoorNumbers
};