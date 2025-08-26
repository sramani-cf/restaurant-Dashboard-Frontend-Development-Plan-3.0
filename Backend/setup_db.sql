-- Create user and database for restaurant dashboard
CREATE USER restaurant_user WITH PASSWORD 'Avalon@1001';
CREATE DATABASE restaurant_dashboard_db OWNER restaurant_user;
CREATE DATABASE restaurant_dashboard_test_db OWNER restaurant_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_db TO restaurant_user;
GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_test_db TO restaurant_user;