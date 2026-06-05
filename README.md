# GitHub Profile Analyzer API

## Tech Stack
- Node.js
- Express.js
- MySQL
- GitHub API

## Features
- Analyze GitHub user profiles
- Store profile insights in MySQL
- Calculate total stars
- Calculate total forks
- Detect most used language
- Fetch all analyzed profiles
- Fetch a single analyzed profile

## API Endpoints

### Analyze Profile
GET /analyze/:username

### Get All Profiles
GET /profiles

### Get Single Profile
GET /profiles/:id

## Run Locally

npm install

Create a .env file:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=github_analyzer
PORT=3000

npm run dev