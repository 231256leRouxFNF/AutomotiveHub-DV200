# AutoHub

AutoHub is a full-stack automotive community and marketplace web application. Users can buy, sell, and manage vehicles, join discussions, and participate in car-related events. The app is built with a Node.js/Express backend and a React frontend.

---
**Portfolio Note:**
This codebase has been cleaned and organized for portfolio presentation. Temporary files, debug logs, and dead code have been removed for clarity and professionalism. Please refer to the documentation and folder structure for a clear overview.
---

## Features
- User authentication and registration
- Vehicle marketplace: list, search, and manage vehicles
- Community feed: post updates, comment, and interact
- Admin panel for managing users and content
- Event management for car meets and activities
- SEO optimized for global discoverability
- Responsive design for desktop and mobile

## Technologies Used
- **Frontend:** React, react-router, react-helmet-async, CSS
- **Backend:** Node.js, Express, MySQL
- **Other:** Cloudinary (for images), Vercel Analytics, JWT authentication

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MySQL database

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/231256leRouxFNF/AutomotiveHub-DV200.git
   cd AutomotiveHub-DV200
   ```
2. Install backend dependencies:
   ```sh
   cd autohub/backend
   npm install
   ```
3. Install frontend dependencies:
   ```sh
   cd ../frontend
   npm install
   ```
4. Set up environment variables:
   - Create `.env` files in both `backend` and `frontend` folders as needed (see example `.env.example`).
5. Set up the database:
   - Run the SQL scripts in `autohub/backend/database_setup.sql` and `autohub/backend/migrations/`.

### Running the App
- Start the backend server:
  ```sh
  cd autohub/backend
  node server.js
  ```
- Start the frontend:
  ```sh
  cd autohub/frontend
  npm start
  ```
- The frontend runs on `http://localhost:3000` and the backend on `http://localhost:5000` by default.

## SEO & Discoverability
- Meta tags, Open Graph, Twitter Cards, and structured data are managed via `react-helmet-async` and custom components.
- Keywords cover all major countries and continents for global reach.
- See `SEO_GUIDE.md` for details.

## Folder Structure
```
AutoHub-DV200/
  autohub/
    backend/
      server.js
      ...
    frontend/
      src/
        components/
        pages/
        ...
      public/
        index.html
        robots.txt
        sitemap.xml
  README.md
  SEO_GUIDE.md
```

## Contributors
- Tsungaui Katsuro (Lecturer)
- Francois le Roux (Student, Developer)

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.

## Contact
For questions or support, contact the repository owner or open an issue on GitHub.

---
