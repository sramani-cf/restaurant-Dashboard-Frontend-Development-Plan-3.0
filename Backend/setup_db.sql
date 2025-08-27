-- Create user and database for restaurant dashboard
CREATE USER root WITH PASSWORD 'Avalon@1001';
CREATE DATABASE restaurant_dashboard_db OWNER root;
CREATE DATABASE restaurant_dashboard_test_db OWNER root;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_db TO root;
GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_test_db TO root;