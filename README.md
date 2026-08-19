<div align="center">

# 🎓 Campus Connect

### _AI-Powered Smart Campus Navigation & Information System_

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Poppins&weight=700&size=26&duration=3500&pause=1200&color=64B5F6&center=true&vCenter=true&width=780&lines=AI-Powered+Smart+Campus+Navigation+%26+Information+System;Find+Classrooms%2C+Faculty+%26+Facilities+in+Seconds;One+Map+for+the+Entire+Campus)](https://git.io/typing-svg)

<br/>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Google Maps](https://img.shields.io/badge/Google%20Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)
[![FastAPI](<https://img.shields.io/badge/Backend-FastAPI%20(planned)-009688?style=for-the-badge&logo=fastapi&logoColor=white>)](#-tech-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)](./LICENSE)
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)](#-development-status)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)](#-contributing)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Project Preview](#-project-preview)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [Target Users](#-target-users)
- [Development Status](#-development-status)
- [Contributing](#-contributing)
- [License](#-license)
- [Team](#-team)
- [Support](#-support)

---

## 📖 About the Project

**Campus Connect** (powered by the _IntelliCampus_ navigation engine) is an AI-powered Smart Campus Navigation and Information System built to simplify campus life for **students, faculty, visitors, and staff**.

Instead of wandering around asking for directions or digging through a static college website, users can instantly **search, locate, and navigate** to classrooms, faculty cabins, laboratories, departments, libraries, and other campus facilities — all from one responsive web app.

> 🎯 The goal: make campus navigation **smarter, faster, and more accessible**, while removing the confusion that new students and visitors face on day one.

---

## ❗ The Problem

Large educational campuses come with a familiar set of navigation headaches:

- 😕 **Students** struggle to locate classrooms, especially in the first weeks of term.
- 🧭 **Visitors and parents** find it hard to navigate an unfamiliar campus.
- 👨‍🏫 **Faculty cabin locations** are scattered and rarely published centrally.
- 🌐 **College websites** are usually static and offer no interactive navigation.
- 🗺 **Google Maps** handles outdoor streets well but offers **limited indoor support** for buildings, floors, and rooms.
- 🏥 **Important facilities** (labs, libraries, emergency rooms, restrooms) are hard to find quickly.

---

## 💡 Our Solution

Campus Connect brings everything together in a **single, centralized smart-navigation platform**:

🔎 Instantly **search** for faculty, classrooms, labs, and facilities
📍 **Navigate** to any destination with an interactive campus map
🗂 Browse a **faculty directory** with cabin numbers and departments
🚑 Access **emergency contacts** in one tap
🔔 Stay updated with campus **notifications & announcements**
🌙 Enjoy a modern, responsive interface with **dark mode**

---

## ✨ Key Features

| #   | Feature                    | Description                                     |
| --- | -------------------------- | ----------------------------------------------- |
| 🏫  | **Campus Navigation**      | Turn-by-turn guidance across the campus         |
| 👨‍🏫  | **Faculty Directory**      | Search faculty by name or department            |
| 👤  | **Faculty Profiles**       | View cabin number, department, and contact info |
| 📍  | **Classroom Finder**       | Locate any classroom instantly                  |
| 🔬  | **Lab & Facility Finder**  | Find laboratories, libraries, and amenities     |
| 🗺  | **Interactive Campus Map** | Digital map with indoor/outdoor support         |
| 🚨  | **Emergency Information**  | Quick access to emergency contacts and services |
| 🔔  | **Notifications**          | Real-time campus announcements                  |
| ⚙️  | **Settings**               | Personalize the experience to your role         |
| 🌙  | **Dark Mode**              | Easy on the eyes, day or night                  |
| 📱  | **Responsive Design**      | Works smoothly on mobile, tablet, and desktop   |

---

## 🔄 How It Works

1. **🔍 Search** — Type a faculty name, classroom code, department, or facility.
2. **📋 Select** — Pick the matching result from the smart, filtered list.
3. **🗺 View on Map** — See the destination pinned on the interactive campus map.
4. **🧭 Navigate** — Follow the suggested route to reach your destination.
5. **🔔 Stay Informed** — Receive notifications and emergency alerts along the way.

---

## 🖼 Project Preview

> 📸 _Screenshots of the live application coming soon._

<div align="center">

<img src="https://raw.githubusercontent.com/YRMESHRAM/Campus_Connect/main/public/images/logo.png" alt="Campus Connect Logo" width="180">

**Campus Connect — Making Campus Navigation Smarter, Faster & Simpler**

</div>

<!--
Replace the block above with actual UI screenshots once available, e.g.:
<p align="center">
  <img src="public/images/home.png" alt="Home Page" width="45%"/>
  <img src="public/images/map.png" alt="Campus Map" width="45%"/>
</p>
-->

---

## 🏗 System Architecture

The system is designed as a layered, component-based architecture. The **frontend** is live today; the **backend, database, and authentication layers** are planned and shown with dashed lines below.

```mermaid
flowchart TD
    U([User<br/>Student · Faculty · Visitor · Staff])

    subgraph Client["🖥️ Frontend (Live)"]
        UI["React + TypeScript UI<br/>(Vite)"]
        NAV["Campus Navigation Engine<br/>(Search · Routing · State)"]
    end

    subgraph Services["⚙️ Application Services"]
        FD["Faculty Directory"]
        CF["Classroom Finder"]
        MP["Campus Map Service"]
        NT["Notifications"]
        EM["Emergency Info"]
    end

    subgraph External["🌍 External & Future Layers"]
        GM["Google Maps API"]
        BE["FastAPI Backend"]:::future
        DB[("PostgreSQL")]:::future
        AU["Firebase Auth"]:::future
    end

    U --> UI
    UI --> NAV
    NAV --> FD & CF & MP & NT & EM
    MP --> GM
    NAV -.-> BE
    BE -.-> DB
    BE -.-> AU

    classDef future fill:#1e293b,stroke:#94a3b8,stroke-dasharray:5 5,color:#cbd5e1;
```

---

## 🛠 Tech Stack

### 🎨 Frontend _(Current)_

- **[React](https://react.dev/)** — Component-based UI library
- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** — Lightning-fast build tool & dev server
- **CSS** — Responsive styling with dark-mode support

### 🧠 Backend _(Planned)_

- **[FastAPI](https://fastapi.tiangolo.com/)** (Python) — High-performance REST API

### 🗄️ Database _(Planned)_

- **[PostgreSQL](https://www.postgresql.org/)** — Relational storage for faculty, rooms, and facilities

### 🔐 Authentication _(Planned)_

- **[Firebase Authentication](https://firebase.google.com/products/auth)** — Secure sign-in and role-based access

### 🗺 Maps

- **[Google Maps API](https://developers.google.com/maps)** — Outdoor mapping
- **Custom Indoor Campus Map** — Building- and floor-level navigation

### 🔧 Tools & Version Control

- **Git** & **GitHub** — Source control and collaboration
- **npm** — Package management

---

## 📂 Project Structure

```text
Campus_Connect/
│
├── public/                  # Static assets (images, favicon, etc.)
│   └── images/
│
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page-level components
│   ├── assets/              # Fonts, icons, and bundled assets
│   ├── data/                # Static/mock data (faculty, rooms, etc.)
│   └── styles/              # Global and component CSS
│
├── .env.example             # Example environment variables
├── index.html               # Vite entry HTML
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # You are here 📍
```

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### ✅ Prerequisites

Make sure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v18 or higher recommended)
- **[npm](https://www.npmjs.com/)** (comes with Node.js)
- A **Google Maps API key** (for the map feature) — [get one here](https://developers.google.com/maps/documentation/javascript/get-api-key)

### 📥 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YRMESHRAM/Campus_Connect.git
   ```

2. **Navigate into the project directory**

   ```bash
   cd Campus_Connect
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Visit the local URL printed in your terminal (typically `http://localhost:5173`).

### 🏗 Build for Production

```bash
npm run build      # Type-check and bundle the app into dist/
npm run preview    # Preview the production build locally
```

---

## 🎮 Usage

| I want to…                | How to do it                                                          |
| ------------------------- | --------------------------------------------------------------------- |
| 🔎 Find a faculty member  | Use the **search bar** on the home page and type a name or department |
| 📍 Locate a classroom     | Enter the room number (e.g. `C-204`) in the search bar                |
| 🗺 View the campus map    | Open the **Map** section from the navigation menu                     |
| 🚨 See emergency contacts | Visit the **Emergency** section for one-tap contacts                  |
| 🔔 Read announcements     | Check the **Notifications** bell icon                                 |
| 🌙 Toggle dark mode       | Use the theme switch in **Settings** or the header                    |

---

## 📈 Roadmap

The project is under active development. Upcoming enhancements include:

- 🤖 **AI Chatbot** — Conversational campus assistant
- 🧭 **Indoor Navigation** — Floor-level routing inside buildings
- 📱 **Mobile Application** — Native iOS & Android apps
- 🎤 **Voice Search** — Hands-free destination lookup
- 📷 **QR Code Navigation** — Scan a code to get instant directions
- 🛰 **Live Faculty Availability** — Real-time cabin/office status
- 📍 **Real-time Location Tracking** — Live position on the map
- 🥽 **AR Campus Navigation** — Augmented-reality wayfinding

> Have a feature idea? Feel free to [open an issue](https://github.com/YRMESHRAM/Campus_Connect/issues) or submit a pull request!

---

## 🎯 Target Users

- 🎓 **Students** — Find classrooms, labs, and faculty
- 👨‍🏫 **Faculty** — Locate colleagues and meeting rooms
- 👨‍💼 **Staff** — Navigate offices and facilities
- 🧑‍🤝‍🧑 **Visitors & Parents** — Explore the campus without confusion
- 🆕 **New Students** — Get oriented from day one

---

## 🚧 Development Status

This project is currently **frontend-only and in active development**. The React + TypeScript interface is functional, while the following components are on the roadmap:

- ⚙️ FastAPI backend
- 🗄 PostgreSQL database
- 🔐 Firebase authentication
- 🤖 AI-powered features (chatbot, recommendations)

See the [Roadmap](#-roadmap) for details.

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. **Fork** the repository
2. Create your **feature branch**
   ```bash
   git checkout -b feature/YourAmazingFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m "Add some amazing feature"
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/YourAmazingFeature
   ```
5. Open a **Pull Request**

For major changes, please open an issue first to discuss what you'd like to change. Don't forget to update tests and documentation as appropriate.

---

## 📄 License

Distributed under the **MIT License**. See the [`LICENSE`](./LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Campus Connect Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 👥 Team

This project is a **Group Major Project** developed by B.Tech students of **Artificial Intelligence & Machine Learning** at **S.B. Jain Institute of Technology, Management & Research**.

<div align="center">

| <img src="https://github.com/YRMESHRAM.png" width="120" height="120" alt="Yash Meshram" style="border-radius:50%"><br/><b>Yash Meshram</b><br/>[@YRMESHRAM](https://github.com/YRMESHRAM) | <img src="https://github.com/ArpitRangari13.png" width="120" height="120" alt="Arpit Rangari" style="border-radius:50%"><br/><b>Arpit Rangari</b><br/>[@ArpitRangari13](https://github.com/ArpitRangari13) | <img src="https://github.com/Prathampimpalikar.png" width="120" height="120" alt="Pratham Pimpalikar" style="border-radius:50%"><br/><b>Pratham Pimpalikar</b><br/>[@Prathampimpalikar](https://github.com/Prathampimpalikar) | <img src="https://github.com/TejasKayarkar03.png" width="120" height="120" alt="Tejas Kayarkar" style="border-radius:50%"><br/><b>Tejas Kayarkar</b><br/>[@TejasKayarkar03](https://github.com/TejasKayarkar03) |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |

<br/>

[![GitHub Repository](https://img.shields.io/badge/Repository-Campus__Connect-181717?style=for-the-badge&logo=github)](https://github.com/YRMESHRAM/Campus_Connect)

</div>

---

## ⭐ Support

If you found this project useful, please consider giving it a **⭐ Star on GitHub** — it motivates further development and improvement!

<div align="center">

### 🚀 Campus Connect

### _Making Campus Navigation Smarter, Faster & Simpler_

⭐ Star this repository if you like the project ⭐

</div>
