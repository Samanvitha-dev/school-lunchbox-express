-- Complete PostgreSQL Schema for Lunchbox Delivery System
-- Drop existing tables if they exist
DROP TABLE IF EXISTS route_stops CASCADE;
DROP TABLE IF EXISTS delivery_routes CASCADE;
DROP TABLE IF EXISTS poll_votes CASCADE;
DROP TABLE IF EXISTS poll_options CASCADE;
DROP TABLE IF EXISTS polls CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS caterers CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS delivery_staff CASCADE;
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table (main authentication table)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('parent', 'delivery', 'school', 'admin', 'caterer')),
    door_no VARCHAR(10),
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_active BOOLEAN DEFAULT true,
    is_first_login BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);

-- Parents table (extends users)
CREATE TABLE parents (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    house_no VARCHAR(20) NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    city_name VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    loyalty_points INTEGER DEFAULT 0,
    no_of_children INTEGER DEFAULT 0
);

-- Delivery staff table (extends users)
CREATE TABLE delivery_staff (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    service_area TEXT[],
    current_status VARCHAR(20) DEFAULT 'available' CHECK (current_status IN ('available', 'busy', 'offline')),
    rating DECIMAL(3,2) DEFAULT 5.0,
    total_deliveries INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    active_since DATE DEFAULT CURRENT_DATE
);

-- Schools table (extends users)
CREATE TABLE schools (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    school_name VARCHAR(200) NOT NULL,
    school_id VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    contact_person VARCHAR(100) NOT NULL,
    established_year INTEGER,
    classes TEXT[]
);

-- Caterers table (extends users)
CREATE TABLE caterers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    contact_person VARCHAR(100) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 5.0,
    is_active BOOLEAN DEFAULT true
);

-- Children table
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    school_id UUID REFERENCES schools(id),
    school_name VARCHAR(200) NOT NULL,
    class VARCHAR(50) NOT NULL,
    age INTEGER,
    allergies TEXT[],
    preferences TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for children table
CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_children_school ON children(school_id);

-- Menu items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caterer_id UUID NOT NULL REFERENCES caterers(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    items TEXT[],
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('lunchbox', 'fruit-bowl', 'snack')),
    is_available BOOLEAN DEFAULT true,
    image_url TEXT,
    allergens TEXT[],
    calories INTEGER,
    protein VARCHAR(20),
    carbs VARCHAR(20),
    fat VARCHAR(20),
    fiber VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for menu items
CREATE INDEX idx_menu_items_caterer ON menu_items(caterer_id);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES parents(id),
    child_id UUID NOT NULL REFERENCES children(id),
    child_name VARCHAR(100) NOT NULL,
    school_id UUID REFERENCES schools(id),
    school_name VARCHAR(200) NOT NULL,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    pickup_door_no VARCHAR(10),
    delivery_door_no VARCHAR(10),
    order_date DATE NOT NULL,
    delivery_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered', 'accepted', 'picked', 'in-progress', 'delivered', 'cancelled')),
    special_notes TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_days TEXT[],
    delivery_staff_id UUID REFERENCES delivery_staff(id),
    pickup_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    amount DECIMAL(10,2) NOT NULL,
    delivery_charge DECIMAL(10,2) DEFAULT 15.00,
    distance_km DECIMAL(5,2),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    qr_code VARCHAR(100) UNIQUE NOT NULL,
    estimated_time INTEGER,
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('home', 'caterer')),
    caterer_id UUID REFERENCES caterers(id),
    loyalty_points_earned INTEGER DEFAULT 0,
    loyalty_points_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for orders table
CREATE INDEX idx_orders_parent ON orders(parent_id);
CREATE INDEX idx_orders_child ON orders(child_id);
CREATE INDEX idx_orders_delivery_staff ON orders(delivery_staff_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);

-- Order items table (for caterer orders)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for order items
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    transaction_id VARCHAR(100) UNIQUE,
    loyalty_points_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for payments
CREATE INDEX idx_payments_order ON payments(order_id);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error', 'order-update')),
    is_read BOOLEAN DEFAULT false,
    order_id UUID REFERENCES orders(id),
    action_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Delivery routes table
CREATE TABLE delivery_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_staff_id UUID NOT NULL REFERENCES delivery_staff(id),
    date DATE NOT NULL,
    total_distance DECIMAL(10,2),
    estimated_duration INTEGER,
    actual_duration INTEGER,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Route stops table
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES delivery_routes(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id),
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    stop_type VARCHAR(20) NOT NULL CHECK (stop_type IN ('pickup', 'delivery')),
    estimated_time TIMESTAMP,
    actual_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    sequence_order INTEGER NOT NULL
);

-- Polls table
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poll options table
CREATE TABLE poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(200) NOT NULL,
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poll votes table
CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_id)
);

-- Feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    caterer_id UUID REFERENCES caterers(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('order', 'caterer', 'delivery', 'general')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_routes_updated_at BEFORE UPDATE ON delivery_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for Nellore locations
-- Admin user
INSERT INTO users (username, email, phone, password_hash, user_type, door_no, address, latitude, longitude, is_first_login) VALUES
('admin', 'admin@lunchbox.com', '+91-9999999999', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'A001', 'Admin Office, Nellore', 14.4426, 79.9865, false);

-- Sample schools (one in each location)
INSERT INTO users (username, email, phone, password_hash, user_type, door_no, address, latitude, longitude, is_first_login) VALUES
('dps_balaji', 'dps.balaji@school.com', '+91-9876543210', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'school', 'S101', 'DPS School, Balaji Nagar, Nellore', 14.4426, 79.9865, false),
('kv_acnagar', 'kv.acnagar@school.com', '+91-9876543211', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'school', 'S201', 'Kendriya Vidyalaya, AC Nagar, Nellore', 14.4500, 79.9900, false),
('zphs_stone', 'zphs.stone@school.com', '+91-9876543212', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'school', 'S301', 'ZPHS School, Stonehousepeta, Nellore', 14.4400, 79.9800, false),
('govt_hari', 'govt.hari@school.com', '+91-9876543213', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'school', 'S401', 'Govt School, Harinathpuram, Nellore', 14.4350, 79.9750, false);

-- Insert school details
INSERT INTO schools (id, school_name, school_id, address, latitude, longitude, contact_person, established_year, classes) 
SELECT id, 'DPS School', 'DPS001', 'DPS School, Balaji Nagar, Nellore', 14.4426, 79.9865, 'Mrs. Sunita Rao', 1995, ARRAY['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'] FROM users WHERE username = 'dps_balaji';

INSERT INTO schools (id, school_name, school_id, address, latitude, longitude, contact_person, established_year, classes) 
SELECT id, 'Kendriya Vidyalaya', 'KV002', 'Kendriya Vidyalaya, AC Nagar, Nellore', 14.4500, 79.9900, 'Mr. Rakesh Gupta', 1985, ARRAY['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'] FROM users WHERE username = 'kv_acnagar';

INSERT INTO schools (id, school_name, school_id, address, latitude, longitude, contact_person, established_year, classes) 
SELECT id, 'ZPHS School', 'ZPHS003', 'ZPHS School, Stonehousepeta, Nellore', 14.4400, 79.9800, 'Mrs. Lakshmi Devi', 1990, ARRAY['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'] FROM users WHERE username = 'zphs_stone';

INSERT INTO schools (id, school_name, school_id, address, latitude, longitude, contact_person, established_year, classes) 
SELECT id, 'Govt School', 'GOVT004', 'Govt School, Harinathpuram, Nellore', 14.4350, 79.9750, 'Mr. Venkat Rao', 1988, ARRAY['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'] FROM users WHERE username = 'govt_hari';

-- Sample caterers (one in each location)
INSERT INTO users (username, email, phone, password_hash, user_type, door_no, address, latitude, longitude, is_first_login) VALUES
('healthy_balaji', 'healthy.balaji@caterer.com', '+91-9876543220', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'caterer', 'C101', 'Healthy Bites Kitchen, Balaji Nagar, Nellore', 14.4428, 79.9867, false),
('moms_acnagar', 'moms.acnagar@caterer.com', '+91-9876543221', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'caterer', 'C201', 'Moms Kitchen, AC Nagar, Nellore', 14.4502, 79.9902, false),
('tasty_stone', 'tasty.stone@caterer.com', '+91-9876543222', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'caterer', 'C301', 'Tasty Treats, Stonehousepeta, Nellore', 14.4402, 79.9802, false),
('spice_hari', 'spice.hari@caterer.com', '+91-9876543223', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'caterer', 'C401', 'Spice Garden, Harinathpuram, Nellore', 14.4352, 79.9752, false);

-- Insert caterer details
INSERT INTO caterers (id, business_name, address, latitude, longitude, contact_person, rating) 
SELECT id, 'Healthy Bites Kitchen', 'Healthy Bites Kitchen, Balaji Nagar, Nellore', 14.4428, 79.9867, 'Chef Priya Nair', 4.7 FROM users WHERE username = 'healthy_balaji';

INSERT INTO caterers (id, business_name, address, latitude, longitude, contact_person, rating) 
SELECT id, 'Moms Kitchen', 'Moms Kitchen, AC Nagar, Nellore', 14.4502, 79.9902, 'Mrs. Lakshmi Devi', 4.9 FROM users WHERE username = 'moms_acnagar';

INSERT INTO caterers (id, business_name, address, latitude, longitude, contact_person, rating) 
SELECT id, 'Tasty Treats', 'Tasty Treats, Stonehousepeta, Nellore', 14.4402, 79.9802, 'Chef Ravi Kumar', 4.5 FROM users WHERE username = 'tasty_stone';

INSERT INTO caterers (id, business_name, address, latitude, longitude, contact_person, rating) 
SELECT id, 'Spice Garden', 'Spice Garden, Harinathpuram, Nellore', 14.4352, 79.9752, 'Mrs. Meera Reddy', 4.8 FROM users WHERE username = 'spice_hari';

-- Sample menu items for caterers
INSERT INTO menu_items (caterer_id, name, description, items, price, category, image_url, allergens, calories, protein, carbs, fat, fiber) 
SELECT id, 'Classic Vegetarian Thali', 'Traditional Indian vegetarian meal with rice, dal, vegetables, and roti', ARRAY['Basmati Rice', 'Dal Tadka', 'Mixed Vegetables', 'Roti (2 pcs)', 'Pickle', 'Curd'], 120.00, 'lunchbox', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', ARRAY['gluten'], 450, '15g', '65g', '12g', '8g' FROM caterers WHERE business_name = 'Healthy Bites Kitchen';

INSERT INTO menu_items (caterer_id, name, description, items, price, category, image_url, allergens, calories, protein, carbs, fat, fiber) 
SELECT id, 'South Indian Special', 'Authentic South Indian meal with sambar rice and accompaniments', ARRAY['Sambar Rice', 'Rasam', 'Poriyal', 'Papad', 'Pickle', 'Buttermilk'], 110.00, 'lunchbox', 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg', ARRAY[], 420, '12g', '70g', '10g', '6g' FROM caterers WHERE business_name = 'Moms Kitchen';

INSERT INTO menu_items (caterer_id, name, description, items, price, category, image_url, calories, protein, carbs, fat, fiber) 
SELECT id, 'Fresh Fruit Bowl', 'Seasonal fresh fruits with honey and nuts', ARRAY['Apple', 'Banana', 'Orange', 'Grapes', 'Honey', 'Almonds'], 80.00, 'fruit-bowl', 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg', ARRAY['nuts'], 180, '4g', '35g', '6g', '8g' FROM caterers WHERE business_name = 'Healthy Bites Kitchen';