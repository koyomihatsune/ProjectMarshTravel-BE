# MarshTravel API Services
## Description

MarshTravel is a mobile application that supports discovery of attractions and creation of travel schedules for local travellers in Vietnam.

This is the monolithic repository of MarshTravel's Back-end API services, based on **[NestJS](https://nestjs.com/)** and **[microservices architecture](https://microservices.io/patterns/microservices.html)**.

## Installation

```bash
# macOS - Install MongoDB Community to run on local 
$ brew tap mongodb/brew

$ brew install mongodb-community

$ brew services start mongodb-community

# Install dependencies (requires Node.js 16.15.0, yarn and Docker)
$ cd /path/to/ProjectMarshTravel-BE

$ yarn install

```

## Initialisation

```bash
# Administrative Region Database Initialisation
$ npm run administrative-init

```

## Running the app


```bash

# Build and start the services with docker-compose in local
$ docker-compose up --build -V

# Start the services only
$ docker-compose up

# No production mode yet
```

## Test

```bash
# No test yet
```

## Repository Author
**Viet Anh, Nguyen**

University Of Engineering and Technology

With love to Hatsune Miku.


## Project Author

This codebase and repository serves the MarshTravel mobile application developed by **Van Dat, Do** as back-end API services.

This codebase and repository supports the Graduation Thesis on Bachelor of Computer Science, authored by **Viet Anh, Nguyen** and **Van Dat, Do** from June 2023 on equivalent topics.

## License

Unlicensed
