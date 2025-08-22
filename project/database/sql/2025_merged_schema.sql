-- LunchBox Express - Unified PostgreSQL Schema (2025)
-- Run with: psql -U postgres -d lunchbox_db -f database/sql/2025_merged_schema.sql

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	username VARCHAR(50) UNIQUE NOT NULL,
	email VARCHAR(120) UNIQUE NOT NULL,
	phone VARCHAR(20) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin','parent','delivery','school','caterer')),
	door_no VARCHAR(10) NOT NULL,
	address TEXT,
	latitude DECIMAL(10,8),
	longitude DECIMAL(11,8),
	last_login TIMESTAMP,
	is_first_login BOOLEAN DEFAULT true,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parents
CREATE TABLE IF NOT EXISTS parents (
	id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	house_no VARCHAR(10) NOT NULL,
	location_name VARCHAR(80) NOT NULL,
	city_name VARCHAR(80) NOT NULL,
	address TEXT,
	latitude DECIMAL(10,8),
	longitude DECIMAL(11,8),
	loyalty_points INTEGER DEFAULT 0,
	no_of_children INTEGER DEFAULT 0
);

-- Delivery Staff
CREATE TABLE IF NOT EXISTS delivery_staff (
	id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	name VARCHAR(120) NOT NULL,
	location_name VARCHAR(80),
	address TEXT,
	latitude DECIMAL(10,8),
	longitude DECIMAL(11,8),
	vehicle_type VARCHAR(30),
	vehicle_number VARCHAR(20),
	service_area TEXT[],
	current_status VARCHAR(20) DEFAULT 'available' CHECK (current_status IN ('available','busy','offline')),
	total_deliveries INTEGER DEFAULT 0,
	total_earnings DECIMAL(10,2) DEFAULT 0
);

-- Schools
CREATE TABLE IF NOT EXISTS schools (
	id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	school_name VARCHAR(150) NOT NULL,
	school_id VARCHAR(50) UNIQUE NOT NULL,
	location_name VARCHAR(80),
	address TEXT,
	latitude DECIMAL(10,8),
	longitude DECIMAL(11,8),
	contact_person VARCHAR(100) NOT NULL,
	established_year INTEGER,
	classes TEXT[]
);

-- Caterers
CREATE TABLE IF NOT EXISTS caterers (
	id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	business_name VARCHAR(150) NOT NULL,
	location_name VARCHAR(80),
	address TEXT,
	latitude DECIMAL(10,8),
	longitude DECIMAL(11,8),
	contact_person VARCHAR(100)
);

-- Children
CREATE TABLE IF NOT EXISTS children (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
	name VARCHAR(120) NOT NULL,
	school_name VARCHAR(150),
	school_id UUID REFERENCES schools(id),
	class VARCHAR(50),
	age INTEGER,
	allergies TEXT[],
	preferences TEXT[],
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	caterer_id UUID REFERENCES caterers(id) ON DELETE CASCADE,
	name VARCHAR(150) NOT NULL,
	description TEXT,
	price DECIMAL(10,2) NOT NULL,
	calories INTEGER DEFAULT 0,
	protein_grams INTEGER DEFAULT 0,
	category VARCHAR(30) CHECK (category IN ('lunchbox','fruit_bowl','other')),
	allergens TEXT[],
	image_url TEXT,
	is_available BOOLEAN DEFAULT true,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
	child_id UUID REFERENCES children(id) ON DELETE SET NULL,
	child_name VARCHAR(120) NOT NULL,
	school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
	school_name VARCHAR(150),
	pickup_address TEXT,
	delivery_address TEXT,
	pickup_door_no VARCHAR(10),
	delivery_door_no VARCHAR(10),
	order_date DATE NOT NULL DEFAULT CURRENT_DATE,
	delivery_time VARCHAR(20) NOT NULL,
	status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered','accepted','picked','in-progress','delivered','cancelled')),
	special_notes TEXT,
	is_recurring BOOLEAN DEFAULT false,
	recurring_days TEXT[],
	delivery_staff_id UUID REFERENCES delivery_staff(id),
	pickup_time TIMESTAMP,
	actual_delivery_time TIMESTAMP,
	amount DECIMAL(10,2) NOT NULL,
	delivery_charge DECIMAL(10,2) DEFAULT 15,
	distance_km DECIMAL(10,2),
	qr_code VARCHAR(80) UNIQUE,
	tracking_id VARCHAR(40) UNIQUE,
	estimated_time INTEGER,
	order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('home','caterer')),
	caterer_id UUID REFERENCES caterers(id),
	loyalty_points_earned INTEGER DEFAULT 0,
	loyalty_points_used INTEGER DEFAULT 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
	menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
	quantity INTEGER NOT NULL DEFAULT 1,
	price DECIMAL(10,2) NOT NULL,
	special_instructions TEXT
);

-- Payments (optional)
CREATE TABLE IF NOT EXISTS payments (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
	amount DECIMAL(10,2) NOT NULL,
	status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','success','failed','refunded')),
	transaction_id VARCHAR(100) UNIQUE,
	loyalty_points_used INTEGER DEFAULT 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID REFERENCES users(id) ON DELETE CASCADE,
	title VARCHAR(150) NOT NULL,
	message TEXT NOT NULL,
	type VARCHAR(40) DEFAULT 'info',
	order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
	is_read BOOLEAN DEFAULT false,
	action_required BOOLEAN DEFAULT false,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_parent ON orders(parent_id);
CREATE INDEX IF NOT EXISTS idx_orders_school ON orders(school_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_staff ON orders(delivery_staff_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_id);

-- Minimal seed (one entity per role for demo, real entries only)
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM users WHERE username='admin') THEN
		INSERT INTO users (username,email,phone,password_hash,user_type,door_no,address,latitude,longitude)
		VALUES ('admin','admin@example.com','9999999999', '$2a$10$8lPX6p6lZr6cTgL7uS9yXu1w8Q2l1Wf8Cj0qzj6r3DqkWv3eVxDgW','admin','A001','Admin Office',14.4426,79.9865);
	END IF;
END$$;

COMMIT;