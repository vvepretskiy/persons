# Star Wars Characters Directory

This project is a web application that retrieves and displays characters from the Star Wars universe. Users can view a table of characters and filter them based on various criteria. The application is built using NestJS for the backend and Angular for the frontend, both managed with Nx.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [License](#license)

## Features

- View a list of Star Wars characters in a table format (*name, birth_year, homeworld, the homeworld's terrain and aggregated value average_person_height*).
- Filter characters by name, homeworld, birth_year and terrain.
- Responsive design for optimal viewing on various devices.

## Technologies

- **Backend**: NestJS
- **Frontend**: Angular
- **Cache**: In-memory (Trie, indexed object)
- **Styling**: Tailwind
- **Testing**: Jest

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (version 18 or later)
- pnpm (Performant Node Package Manager)
- Nx CLI

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vvepretskyi/persons.git

2. Install dependencies:

   ```bash
   cd persons
   npm install -g pnpm
   pnpm i

### Running the Application

- **Run Docker Compose** (defualt url: http://localhost:4200/)

   ```bash
   docker-compose up --build

- **Run Backend** (defualt url: http://localhost:3001/api)

   ```bash
   nx serve server

- **Run Frontend** (defualt url: http://localhost:4200/)

   ```bash
   nx serve frontend

## API Endpoints

[swapi.dev](https://swapi.dev/api/)

## Configuration
The NestJS backend uses a .env file where users can configure cache settings and the environment for the frontend. Make sure to create a .env file in the root of the backend directory and set the necessary environment variables as needed.

.env file

    EXPIRE_TIME_HOMEWORLD_CACHE=36000
    MAX_AMOUNT_HOMEWORLD_CACHE=100
    CACHE_DURATION=240000
    CACHE_DURATION_HOMEWORLD=240000

## License
MIT
