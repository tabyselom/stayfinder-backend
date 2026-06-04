CREATE DATABASE IF NOT EXISTS stayfindedb;

USE stayfindedb;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer','owner','admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,

    title VARCHAR(150) NOT NULL,
    description TEXT,

    price DECIMAL(10,2) NOT NULL,

    house_size DECIMAL(10,2),

    bedrooms INT DEFAULT 0,
    kitchens INT DEFAULT 0,
    bathrooms INT DEFAULT 0,

    has_parking BOOLEAN DEFAULT FALSE,

    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,

    display_location VARCHAR(255),

    image_url VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,
    property_id INT NOT NULL,

    check_in DATE,
    check_out DATE,

    status ENUM('pending','approved','cancelled') DEFAULT 'pending',

    total_price DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (property_id) REFERENCES properties(id)
        ON DELETE CASCADE
);