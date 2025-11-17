# AutoHub — React Application

## Table Of Contents

1. [About the Project](#about-the-project)
2. [Built With](#built-with)
3. [Getting Started](#getting-started)
4. [Features and Usage](#features-and-usage)
5. [Screenshots & Explanations](#screenshots--explanations)
6. [Demonstration Video](#demonstration-video)
7. [Architecture / System Design](#architecture--system-design)
8. [Testing](#testing)
9. [Highlights and Challenges](#highlights-and-challenges)
10. [Roadmap](#roadmap--future-improvements)
11. [Contributing and License](#contributing-and-license)
12. [Authors and Contact Info](#authors-and-contact-info)
13. [Acknowledgements](#acknowledgements)

## About the Project

AutoHub is a marketplace web application for buying and selling vehicles. The frontend is decoupled from the backend and focused on modularity and scalability.

### Built With

Frontend:

- ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![React Bootstrap](https://img.shields.io/badge/ReactBootstrap-6F42C1?style=for-the-badge&logo=react-bootstrap&logoColor=white) ![React Router](https://img.shields.io/badge/ReactRouter-CA4245?style=for-the-badge) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge) ![MUI](https://img.shields.io/badge/Material_UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)

Backend:

- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

Database:

- ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

Authentication:

- ![bcrypt](https://img.shields.io/badge/bcrypt-4EAA25?style=for-the-badge) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge)

File Storage:

- ![Cloudinary](https://img.shields.io/badge/Cloudinary-2F5FFF?style=for-the-badge&logo=cloudinary&logoColor=white)

Middleware:

- ![Multer](https://img.shields.io/badge/Multer-0E76A8?style=for-the-badge) ![CORS](https://img.shields.io/badge/CORS-6C63FF?style=for-the-badge)

Config:

- ![Dotenv](https://img.shields.io/badge/Dotenv-000000?style=for-the-badge)

## Getting started (development)

From this directory (`autohub/frontend`) run the usual Create React App commands using PowerShell or another shell:

```pwsh
npm install
npm start
```

- `npm start` — Runs the app in development mode at `http://localhost:3000`.
- `npm test` — Runs the test watcher.
- `npm run build` — Builds the production bundle into the `build/` folder.

If you need to connect to the local backend during development, start the backend from `autohub/backend` (see that folder for run instructions).

## Mockups & Design

Design mockups and screenshots are stored in `documents/mock-ups` and have been copied into `autohub/frontend/public/images/` for quick preview below.

Screenshots / Mockups

![Mockup — MacBook 13](autohub/frontend/public/images/MacBook_13.jpg)

![Mockup — MacBook Air 15](autohub/frontend/public/images/MacBook_Air_15.jpg)

![Mockup — ZenBook Duo 14](autohub/frontend/public/images/ZenBook_Duo_14.jpg)

![Mockup — HP Elite Dragonfly](autohub/frontend/public/images/HP_Elite_Dragonfly.jpg)

## Acknowledgments

- **Project lead & repository owner:** 231256leRouxFNF
- **Contributed format & reference content:** Kai Barker – ReadyUP
- **Bootstrapped with:** [Create React App](https://github.com/facebook/create-react-app)
- **Icons & badges:** Shields.io, Simple Icons
- **Design & mockups:** Original mockups copied from `documents/mock-ups`
-- **Other acknowledgements:** [Tsungai Katsuro](https://github.com/TsungaiKats), StackOverflow, Google Analytics & Gemini, Cloudinary, React Bits, MDN Web Docs, Material UI, React-Bootstrap, Render, [...]

If you'd like specific contributor names or links added to this section, tell me which people/URLs to include and I will add them.




## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm
- MySQL (local instance like XAMPP, or hosted)
- Git

### How to Install

This project is divided into a `frontend` and `backend` directory. Open two terminals to run them.

Clone the repository:

```pwsh
git clone <your-repo-url>
cd autohub/frontend
npm install
npm start
```

Open a second terminal for the backend:

```pwsh
cd autohub/backend
npm install
npm start
```

Example environment variables (frontend):

```
# This tells your React app where to send API requests
REACT_APP_API_URL=http://localhost:5000
```

Example backend `.env` values:

```
DB_HOST=your_db_host
DB_USER=your_db_username
DB_PASS=your_db_password
DB_NAME=your_database_name

JWT_SECRET=your_super_secret_key_for_jwt

CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

## Features and Usage

- User authentication (bcrypt + JWT)
- Browse listings, filter, search, and paginate
- Create, edit, and delete vehicle listings (images via Cloudinary)
- User profiles with social/contact links
- Add / remove followers or friends
- Admin panel for categories and post moderation
- Responsive UI with Bootstrap and custom CSS

## Architecture / System Design

- Frontend: Renders UI, manages client state, and communicates with backend APIs. (Deployed on Vercel in previous setups)
- Backend: Authenticates users, processes business logic, and interacts with MySQL DB. (Can be deployed on Render)
- Database: MySQL storing users, listings, categories, friendships and joins.
- External services: Cloudinary for media storage.


### Database ER Diagram

The project's database design is captured in the ER diagram below — open the linked PDF to view the full-size diagram and table relationships.

![ER diagram](documents/ER-diagrams/ER_Diagram.svg)


## Highlights and Challenges

### Highlights
- Implemented JWT-based auth and role-based admin controls
- Implemented Cloudinary uploads

### Challenges
- Deploying and configuring environment variables
- Handling media uploads and deleting orphaned Cloudinary images
- Synchronizing React state across components
- Implementing all the pages for such app (W.I.P.)

## Contributing and License

To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

### License

Distributed under the MIT License.

## Authors and Contact Info

- 231256leRouxFNF — repository owner
- 231256@virtualwindow.co.za


## Useful links
- Create React App docs: https://facebook.github.io/create-react-app/docs/getting-started
- React docs: https://reactjs.org/
- Backend API (local): `http://localhost:5000` (or whichever port your backend uses)


##Future plans
- Implement all pages
- Implement following, unfollowing, liking, sharing, and commenting
- Implementing messaging system
  
## Contributing

If you'd like to contribute, please:

1. Fork the repo and create a feature branch.
2. Run `npm install` and start the app locally.
3. Open a pull request describing your changes.

### Acknowledgements

Special thanks to the following projects and contributors:

- [Tsungai Katsuro](https://github.com/TsungaiKats) 
- [dbdiagram.io](https://dbdiagram.io) for the ER Diagram 
- Google Analytics & Gemini
- React Bits (for the awesome cursor)
- Material UI
- React-Bootstrap
- Render for hosting the backend
- Vercel for hosting the frontend
- Google Cloud for hosting the Autohub_db
- Cloudinary for hosting the presets of the posts, garage images, etc
