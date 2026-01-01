# CourseVault

CourseVault is a full-stack web application for securely managing and delivering online course content using subscription-based access control and AI-powered learning features. The project is designed to reflect real-world backend and full-stack engineering practices rather than a tutorial or demo application.

## Overview

CourseVault enables users to access course materials through an authenticated dashboard while enforcing subscription and role-based restrictions. The system combines a Django (Python) backend API with a modern Next.js (TypeScript) frontend and integrates external AI services to enhance learning through automated content generation.

## Features

### Backend (Django / Python)
- User registration and authentication
- Email verification and account activation
- Secure access and refresh token handling
- Role-based and subscription-based authorization
- Folder and file management APIs
- AI-powered generation of quizzes, flashcards, and summaries from course content
- Environment-based configuration and error handling

### Frontend (Next.js + TypeScript)
- Authenticated user dashboard
- Subscription status awareness
- Folder and file management interface
- PDF upload support
- AI-generated learning content display
- Client-side route protection
- Clean, responsive UI with animation support

## Tech Stack

### Backend
- Python & Django
- RESTful API architecture (Django REST Framework)
- Token-based authentication
- Relational database
- External AI API integration

### Frontend
- Next.js (App Router)
- TypeScript
- React Context for authentication state
- Tailwind CSS
- Framer Motion

## Architecture

