# StudyNotion - An EdTech Platform

Welcome to **StudyNotion**, an educational platform designed to provide online courses for students. Built with the **MERN stack** (MongoDB, Express.js, React, Node.js), this project aims to deliver a comprehensive learning experience for students, instructors, and admins, with features like content management, role-based access, and user dashboards.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
5. [Folder Structure](#folder-structure)
6. [Usage](#usage)
7. [Screenshots](#screenshots)
8. [Contributing](#contributing)
9. [License](#license)

## Introduction

StudyNotion is a full-stack EdTech application that allows users to:
- Register and enroll in courses.
- Manage content based on roles (Student, Instructor, Admin).
- Access personalized dashboard.

The project is built with the **MERN stack**, with separate modules for students, instructors, and admins.

## Features

- **User Authentication**: Secure authentication using JWT (JSON Web Token).
- **Role-Based Access Control**: Separate views and features for students, instructors, and admins.
- **Course Management**: Instructors can create, edit, and delete courses.
- **Student Dashboard**: Track enrolled courses, progress, and certifications.
- **Admin Panel**: Manage users, courses, and the entire platform.

## Tech Stack

- **Frontend**: React, Redux, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Other**:
  - **Authentication**: JWT
  - **Deployment**: Soon!
  - **Styling**: Tailwind CSS

## Installation

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)

### Steps to Install

1. **Clone the Repository**:
    ```sh
    git clone https://github.com/ravi-kumar001/StudyNotion.git
    ```

2. **Install Dependencies**:
    Navigate to both the frontend and backend directories to install dependencies.

    **Backend**:
    ```sh
    cd backend
    npm install
    ```

    **Frontend**:
    ```sh
    cd frontend
    npm install
    ```

3. **Environment Variables**:
    Create a `.env` file in the backend directory with the following variables:

    ```env
    PORT = 3000

    MONGO_ATLAS_URL=

    JWT_SECRET=
    JWT_COOKIE_EXPIRE=

    NODE_ENV=

    AVATAR_MAX_SIZE=
    AVATAR_FOLDER_NAME=

    THUMBNAIL_MAX_SIZE=
    THUMBNAIL_FOLDER_NAME=

    LECTURES_MAX_SIZE=
    LECTURES_FOLDER_NAME=

    CLOUDINARY_FOLDER_NAME=
    CLOUDINARY_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=

    SMTP_HOST=
    SMTP_PORT=
    SMTP_USER=
    SMTP_MASTER_PASSWORD=
    SMTP_FROM=

    ROZORPAY_KEY_ID=
    ROZORPAY_KEY_SECRET=

    STUDY_NOTION_FRONTEND_SITE =

    SITE_OWNER_EMAIL=
    ```

4. **Run the Application**:
    Use `concurrently` to start both the frontend and backend servers together.

    ```sh
    npm start
    ```

    Or run separately:

    **Backend**:
    ```sh
    cd backend
    npm start
    npm run dev
    ```

    **Frontend**:
    ```sh
    cd frontend
    npm start
    npm run dev
    ```

5. **Access the Application**:
    Visit `http://localhost:5173` in your browser to access the platform.

## Folder Structure

```sh
studynotion/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│       ├── components/
│       ├── pages/
│       ├── redux/
│       └── App.js
│
└── README.md
