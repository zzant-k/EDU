# FINAL MASTER PROMPT — EDUFAIR DIGITAL PASSPORT

You are a Senior Full Stack Software Engineer, Senior UI/UX Designer, and Software Architect with over 15 years of experience.

Your task is to build a complete, production-ready web application called **EduFair Digital Passport**.

The application must be designed with enterprise-level code quality, scalable architecture, modern UI/UX, and clean development practices.

---

# PROJECT OVERVIEW

EduFair Digital Passport is a digital stamp collection system used during an Education Fair event.

The purpose of this system is to replace the traditional paper stamp card with a completely digital experience.

Students visit university booths during the event.

Each university booth provides a unique QR Code.

Students scan the QR Code using their smartphone.

Every successful scan becomes a digital university stamp.

Students must collect every university stamp before becoming eligible to join the Lucky Draw.

The application must prioritize:

* User Experience
* Performance
* Security
* Scalability
* Maintainability
* Accessibility
* Responsive Design

---

# TECHNOLOGY STACK

## Frontend

* React 19
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* React Hook Form
* Zod
* Framer Motion
* Lucide React Icons

## Backend

* Laravel 12
* Laravel Sanctum
* REST API

## Database

* MySQL

---

# PROJECT STRUCTURE

The project MUST be separated into two independent applications.

Never mix React and Laravel into a single project.

```
EduFair-Digital-Passport/

│
├── frontend/
│   ├── React 19
│   ├── Vite
│   ├── Tailwind CSS
│   ├── React Router
│   ├── Axios
│   ├── React Hook Form
│   ├── Framer Motion
│   ├── Lucide React
│   └── src/
│       ├── api/
│       ├── assets/
│       ├── components/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── store/
│       ├── utils/
│       └── App.jsx
│
└── backend/
    ├── Laravel 12
    ├── app/
    ├── routes/
    ├── database/
    ├── storage/
    ├── config/
    └── public/
```

---

# DEVELOPMENT RULES

Frontend only handles:

* UI
* UX
* Routing
* API Requests
* Authentication Pages
* QR Scanner
* State Management
* Responsive Layout
* Animations

Backend only handles:

* Authentication
* Business Logic
* Validation
* Database
* REST API
* QR Validation
* Lucky Draw Logic

Frontend must NEVER access the database directly.

Frontend communicates with backend ONLY using Axios through REST API.

Example:

```
React

↓

Axios

↓

Laravel REST API

↓

Business Logic

↓

MySQL
```

---

# DESIGN SYSTEM

The design is one of the highest priorities of this project.

The application MUST look like a premium Apple product instead of a typical school website.

Inspired by:

* Apple Human Interface Guidelines
* Apple Wallet
* Apple Fitness
* Apple Health
* Apple Store
* Linear
* Vercel
* Stripe
* Notion

---

# DESIGN PHILOSOPHY

The interface must feel:

* Elegant
* Minimalist
* Premium
* Luxury
* Professional
* Modern
* Calm
* Timeless

Less is more.

Every component must have a purpose.

Avoid visual clutter.

Avoid unnecessary decorations.

Prioritize whitespace over decoration.

---

# COLOR SYSTEM

Theme:

Ocean Blue

Primary

#2563EB

Primary Hover

#1D4ED8

Secondary

#38BDF8

Accent

#06B6D4

Background

#F8FAFC

Surface

#FFFFFF

Border

#E2E8F0

Primary Text

#0F172A

Secondary Text

#64748B

Success

#16A34A

Danger

#DC2626

The blue palette should resemble the ocean, creating a calm, modern, trustworthy, and premium atmosphere.

---

# TYPOGRAPHY

Primary Font

SF Pro Display

Fallback

Inter

Poppins

Large headings.

Comfortable spacing.

Readable hierarchy.

Apple-like typography.

---

# COMPONENT STYLE

* Large whitespace
* Rounded corners (20px)
* Thin borders
* Soft shadows
* Elegant cards
* Minimal forms
* Premium tables
* Modern badges
* Beautiful loading skeletons
* Clean progress bars
* Minimal buttons

Avoid excessive gradients.

Avoid glassmorphism overload.

---

# ICONS

Use ONLY Lucide React Icons.

Never use emojis.

Never use colorful icons.

Use outline icons only.

Maintain consistent stroke width.

---

# ANIMATION

Animations must feel like iOS.

Use:

* Fade
* Scale
* Slide
* Micro Interactions
* Smooth Progress Animation
* Loading Skeleton
* Page Transition

Avoid:

* Bounce animation
* Flashy transitions
* Over-animation

---

# RESPONSIVE DESIGN

The application is Mobile First.

Student pages must feel like a native mobile application.

Desktop must also be fully responsive.

Student

Bottom Navigation

Admin

Sidebar Navigation

Large touch targets.

Comfortable spacing.

---

# AUTHENTICATION

## Student

Register

Fields

* Name
* Password
* Confirm Password

Login

* Name
* Password

Logout

---

## Admin

Separate Login

Role Based Authentication

---

# STUDENT FEATURES

Dashboard

* Greeting
* Progress Card
* Circular Progress
* Completion Percentage
* Visited Universities
* Remaining Universities
* Search University
* Filter University
* Scan QR Button

University List

Each Card

* Logo
* University Name
* Description
* Visited Status

University Detail

* Logo
* Description
* Website
* Location
* Visit Status

QR Scanner

* Open Camera
* Scan QR
* Validate QR
* Save Visit
* Prevent Duplicate Scan

Scan Success

* Success Page
* University Information
* Continue Button

Profile

* Student Information
* Progress
* Logout

Lucky Draw

Locked until all universities have been visited.

Automatically unlock after completion.

Join Lucky Draw.

Generate participant number.

Display participant number.

---

# ADMIN FEATURES

Dashboard

* Total Students
* Completed Students
* Remaining Students
* Universities
* Lucky Draw Participants
* Analytics
* Charts

University Management

* Create
* Edit
* Delete
* Upload Logo
* Generate QR Code

Student Management

* Search
* Filter
* View Progress
* Visit History

Lucky Draw

* Participant List
* Spin Wheel Animation
* Random Winner
* Winner History

Export

* Export Student Data

---

# QR CODE SYSTEM

Each university has one unique QR Code.

When a student scans:

Validate

* Student is authenticated
* QR exists
* University exists
* Student has never scanned this university before

Store

* student_id
* university_id
* visited_at

If duplicate

Return validation error.

---

# DATABASE

users

* id
* name
* password
* role
* created_at

universities

* id
* name
* description
* logo
* website
* location
* qr_token
* created_at

student_visits

* id
* student_id
* university_id
* visited_at

lucky_draw_participants

* id
* student_id
* participant_number
* joined_at

winners

* id
* student_id
* prize
* created_at

---

# REST API

Authentication

POST /register

POST /login

POST /logout

Student

GET /dashboard

GET /universities

GET /universities/{id}

POST /scan

GET /progress

GET /profile

POST /join-lucky-draw

GET /participant

Admin

CRUD Universities

CRUD Students

GET Dashboard Statistics

GET Student Progress

GET Visit History

Generate QR

Spin Winner

Winner History

---

# CODE QUALITY

* Reusable Components
* Reusable Layouts
* Reusable Hooks
* API Service Layer
* Feature-based Folder Structure
* Clean Code
* SOLID Principles
* Scalable Architecture
* Maintainable Code
* Proper Error Handling
* Input Validation
* Secure Authentication

---

# DESIGN CONSISTENCY

Before writing any code:

Create a complete Design System first.

Include:

* Color Palette
* Typography
* Spacing System
* Grid System
* Border Radius
* Shadow System
* Buttons
* Inputs
* Cards
* Tables
* Badges
* Progress Components
* Navigation
* Icons
* Empty States
* Loading Skeleton
* Animation Rules

After the Design System is finalized, implement every page using the same visual language to ensure complete design consistency across the entire application.

---

# FINAL GOAL

The final application must not look like a typical school website.

It must resemble a premium SaaS product inspired by Apple.

The experience should feel calm, elegant, intuitive, and modern.

Every page must be responsive, clean, and optimized for mobile devices while remaining fully functional on desktop.

Generate a complete production-ready application with clean architecture, modern UI/UX, best coding practices, and scalable source code.
