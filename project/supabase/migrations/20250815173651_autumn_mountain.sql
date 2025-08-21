-- Complete Database Schema for Lunchbox Delivery System
-- PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (unified for all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('parent', 'delivery', 'school', 'admin', 'caterer')),
    is_active BOOLEAN DEFAULT true,
    is_first_login BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Parent-specific details
CREATE TABLE parents (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    house_no VARCHAR(20) NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    city_name VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    loyalty_points INTEGER DEFAULT 0,
    no_of_children INTEGER DEFAULT 0
);

-- Delivery staff details
CREATE TABLE delivery_staff (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    service_area TEXT[], -- Array of service areas
    current_status VARCHAR(20) DEFAULT 'available' CHECK (current_status IN ('available', 'busy', 'offline')),
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_deliveries INTEGER DEFAULT 0,
    active_since DATE DEFAULT CURRENT_DATE
);

-- Schools table
CREATE TABLE schools (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    school_name VARCHAR(200) NOT NULL,
    school_id VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_person VARCHAR(100) NOT NULL,
    established_year INTEGER,
    classes TEXT[] -- Array of class names
);

-- Caterers table
CREATE TABLE caterers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_person VARCHAR(100) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    is_active BOOLEAN DEFAULT true
);

-- Children/Students table
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    school_id UUID REFERENCES schools(id),
    school_name VARCHAR(200) NOT NULL,
    class VARCHAR(50) NOT NULL,
    age INTEGER,
    allergies TEXT[], -- Array of allergies
    preferences TEXT[], -- Array of food preferences
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caterer_id UUID NOT NULL REFERENCES caterers(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    items TEXT[], -- Array of food items included
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('lunchbox', 'fruit-bowl', 'snack')),
    is_available BOOLEAN DEFAULT true,
    image_url TEXT,
    allergens TEXT[], -- Array of allergens
    -- Nutritional information
    calories INTEGER,
    protein VARCHAR(20),
    carbs VARCHAR(20),
    fat VARCHAR(20),
    fiber VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    order_date DATE NOT NULL,
    delivery_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered', 'accepted', 'picked', 'in-progress', 'delivered', 'cancelled')),
    special_notes TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_days TEXT[], -- Array of days for recurring orders
    delivery_staff_id UUID REFERENCES delivery_staff(id),
    pickup_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    qr_code VARCHAR(100) UNIQUE NOT NULL,
    estimated_time INTEGER, -- in minutes
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('home', 'caterer')),
    caterer_id UUID REFERENCES caterers(id),
    loyalty_points_earned INTEGER DEFAULT 0,
    loyalty_points_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table (for caterer orders)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    transaction_id VARCHAR(100) UNIQUE,
    loyalty_points_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Delivery routes table
CREATE TABLE delivery_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_staff_id UUID NOT NULL REFERENCES delivery_staff(id),
    date DATE NOT NULL,
    total_distance DECIMAL(10, 2),
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
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
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
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
    UNIQUE(poll_id, user_id) -- One vote per user per poll
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

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_children_school ON children(school_id);
CREATE INDEX idx_orders_parent ON orders(parent_id);
CREATE INDEX idx_orders_child ON orders(child_id);
CREATE INDEX idx_orders_delivery_staff ON orders(delivery_staff_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_menu_items_caterer ON menu_items(caterer_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_routes_updated_at BEFORE UPDATE ON delivery_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion
INSERT INTO users (username, email, phone, password_hash, user_type, is_first_login) VALUES
('admin', 'admin@lunchbox.com', '+91-9999999999', '$2b$10$example_hash', 'admin', false),
('rajesh_sharma', 'rajesh@gmail.com', '+91-9876543210', '$2b$10$example_hash', 'parent', false),
('ramesh_delivery', 'ramesh@dabbawala.com', '+91-9876543212', '$2b$10$example_hash', 'delivery', false),
('dps_koramangala', 'admin@dpskoramangala.com', '+91-9876543214', '$2b$10$example_hash', 'school', false),
('healthy_bites', 'contact@healthybites.com', '+91-9876543216', '$2b$10$example_hash', 'caterer', false);

-- Insert corresponding role-specific data
INSERT INTO parents (id, house_no, location_name, city_name, address, latitude, longitude, loyalty_points) 
SELECT id, '123A', 'Koramangala', 'Bangalore', '123A, 5th Block, Koramangala, Bangalore - 560095', 12.9352, 77.6245, 150 
FROM users WHERE username = 'rajesh_sharma';

INSERT INTO delivery_staff (id, name, address, latitude, longitude, vehicle_type, vehicle_number, service_area, rating, total_deliveries)
SELECT id, 'Ramesh Kumar', '789C, BTM Layout, Bangalore - 560076', 12.9166, 77.6101, 'Bike', 'KA-05-MN-1234', ARRAY['Koramangala', 'BTM', 'Jayanagar'], 4.8, 1250
FROM users WHERE username = 'ramesh_delivery';

INSERT INTO schools (id, school_name, school_id, address, latitude, longitude, contact_person, established_year, classes)
SELECT id, 'Delhi Public School', 'DPS001', 'Plot No. 50, Koramangala, Bangalore - 560095', 12.9279, 77.6271, 'Mrs. Sunita Rao', 1995, ARRAY['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade']
FROM users WHERE username = 'dps_koramangala';

INSERT INTO caterers (id, business_name, address, latitude, longitude, contact_person, rating)
SELECT id, 'Healthy Bites Kitchen', '45, Food Street, Koramangala, Bangalore - 560095', 12.9351, 77.6253, 'Chef Priya Nair', 4.7
FROM users WHERE username = 'healthy_bites';