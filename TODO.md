# Migration to Google Cloud SQL

## Step 1: Set up Google Cloud Project and Cloud SQL Instance
- [ ] Create a Google Cloud Project:
  - Go to https://console.cloud.google.com/
  - Click "Create Project" or select an existing one.
  - Note the Project ID (e.g., autohub-project-12345).
- [ ] Enable Cloud SQL API:
  - In the Google Cloud Console, go to "APIs & Services" > "Library".
  - Search for "Cloud SQL API" and enable it.
- [ ] Create a Cloud SQL Instance:
  - Go to "SQL" in the left menu.
  - Click "Create Instance" > "MySQL".
  - Choose "MySQL 8.0".
  - Instance ID: e.g., autohub-db-instance.
  - Password: Set a strong password.
  - Region: Choose one close to you (e.g., us-central1).
  - Machine type: f1-micro (free tier).
  - Storage: Default (10 GB).
  - Under "Connections", enable "Public IP" and add your IP address (or 0.0.0.0/0 for testing, but restrict later).
  - Click "Create".
- [ ] Create a Database and User:
  - Once the instance is ready, go to the instance details.
  - Under "Databases", create a new database named autohub_db.
  - Under "Users", create a new user (e.g., autohub_user) with a password.
- [ ] Note Connection Details:
  - Public IP: Found under "Connect to this instance" > "Public IP address".
  - Database: autohub_db
  - User: autohub_user
  - Password: The one you set.

## Step 2: Clean Database Schema
- [x] Remove any DEFINER lines from database_setup.sql (none found, but check for any)
- [x] Remove extraneous code at the end of database_setup.sql (app.get code)

## Step 3: Update Configuration
- [x] Update .env file with new Cloud SQL details:
  - DB_HOST=34.51.215.67
  - DB_PORT=3306
  - DB_USER=autohub-db
  - DB_PASSWORD=}HEq$AnO[3t,IsP*
  - DB_NAME=autohub-db

## Step 4: Migrate Schema
- [ ] Run setup script: node autohub/backend/scripts/setupDatabase.js

## Step 5: Test Connection
- [ ] Start the backend server and verify database connection
- [ ] If migrating data, export from AlwaysData and import to Cloud SQL
