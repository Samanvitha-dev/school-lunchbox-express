const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { getAvailableDoorNumbers, getCoordinatesFromDoorNumber } = require('../utils/locationHelper');

class User {
  static async create(userData) {
    const {
      username, email, phone, password, userType,
      // Parent specific
      houseNo, locationName, cityName, address,
      // Delivery specific
      name, vehicleType, vehicleNumber, serviceArea,
      // School specific
      schoolName, schoolId, contactPerson, establishedYear, classes,
      // Caterer specific
      businessName, contactPersonCaterer
    } = userData;

    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Get available door number based on user type and location
      let doorNo;
      let coordinates;
      
      if (userType === 'parent') {
        doorNo = houseNo || await getAvailableDoorNumbers(client, 'house', locationName);
        if (!doorNo) {
          throw new Error(`No available houses in ${locationName}`);
        }
      } else if (userType === 'delivery') {
        doorNo = await getAvailableDoorNumbers(client, 'delivery', locationName);
        if (!doorNo) {
          throw new Error(`No available delivery locations in ${locationName}`);
        }
      } else if (userType === 'school') {
        doorNo = await getAvailableDoorNumbers(client, 'school', locationName);
        if (!doorNo) {
          throw new Error(`School already exists in ${locationName}`);
        }
      } else if (userType === 'caterer') {
        doorNo = await getAvailableDoorNumbers(client, 'caterer', locationName);
        if (!doorNo) {
          throw new Error(`Caterer already exists in ${locationName}`);
        }
      } else {
        doorNo = 'A001'; // Admin
      }
      
      coordinates = getCoordinatesFromDoorNumber(doorNo);
      
      // Insert into users table
      const userResult = await client.query(
        `INSERT INTO users (username, email, phone, password_hash, user_type, door_no, address, latitude, longitude) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          username, email, phone, passwordHash, userType, doorNo,
          coordinates?.address || address || `${doorNo}, Nellore`,
          coordinates?.latitude || 14.4426,
          coordinates?.longitude || 79.9865
        ]
      );
      
      const userId = userResult.rows[0].id;
      
      // Insert role-specific data
      switch (userType) {
        case 'parent':
          await client.query(
            `INSERT INTO parents (id, house_no, location_name, city_name, address, latitude, longitude, loyalty_points) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, houseNo || doorNo, locationName, cityName || 'Nellore', coordinates?.address || address, coordinates?.latitude, coordinates?.longitude, 0]
          );
          break;
          
        case 'delivery':
          // Parse service areas (comma-separated string to array)
          const areas = (serviceArea && typeof serviceArea === 'string')
            ? serviceArea.split(',').map(s => s.trim()).filter(Boolean)
            : [locationName].filter(Boolean);
          await client.query(
            `INSERT INTO delivery_staff (id, name, address, latitude, longitude, vehicle_type, vehicle_number, service_area) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, name, coordinates?.address || address, coordinates?.latitude, coordinates?.longitude, vehicleType, vehicleNumber, areas]
          );
          break;
          
        case 'school':
          await client.query(
            `INSERT INTO schools (id, school_name, school_id, address, latitude, longitude, contact_person, established_year, classes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [userId, schoolName, schoolId, coordinates?.address || address, coordinates?.latitude, coordinates?.longitude, contactPerson, parseInt(establishedYear || 2000, 10), classes?.split(',') || ['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade']]
          );
          break;
          
        case 'caterer':
          await client.query(
            `INSERT INTO caterers (id, business_name, address, latitude, longitude, contact_person) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, businessName, coordinates?.address || address, coordinates?.latitude, coordinates?.longitude, contactPersonCaterer]
          );
          break;
      }
      
      await client.query('COMMIT');
      return userId;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByCredentials(username, password) {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return null;
    }
    
    // Get role-specific data
    let roleData = {};
    switch (user.user_type) {
      case 'parent':
        const parentResult = await db.query('SELECT * FROM parents WHERE id = $1', [user.id]);
        roleData = parentResult.rows[0] || {};
        break;
      case 'delivery':
        const deliveryResult = await db.query('SELECT * FROM delivery_staff WHERE id = $1', [user.id]);
        roleData = deliveryResult.rows[0] || {};
        break;
      case 'school':
        const schoolResult = await db.query('SELECT * FROM schools WHERE id = $1', [user.id]);
        roleData = schoolResult.rows[0] || {};
        break;
      case 'caterer':
        const catererResult = await db.query('SELECT * FROM caterers WHERE id = $1', [user.id]);
        roleData = catererResult.rows[0] || {};
        break;
    }
    
    return { ...user, ...roleData };
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async updateLastLogin(id) {
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, is_first_login = false WHERE id = $1',
      [id]
    );
  }

  static async updateLoyaltyPoints(parentId, points) {
    await db.query(
      'UPDATE parents SET loyalty_points = loyalty_points + $1 WHERE id = $2',
      [points, parentId]
    );
  }

  static async getAvailableDeliveryStaff() {
    const result = await db.query(`
      SELECT u.*, ds.* FROM users u 
      JOIN delivery_staff ds ON u.id = ds.id 
      WHERE u.user_type = 'delivery' AND ds.current_status = 'available'
    `);
    return result.rows;
  }
}

module.exports = User;