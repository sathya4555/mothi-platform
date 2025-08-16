<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# Mothi Platform Backend

A NestJS backend for the Mothi Platform, providing APIs for purchase management, party management, and product catalog.

## Database Setup

This application uses **Neon PostgreSQL** as the database. The connection is configured to use the following connection string:

```
postgresql://neondb_owner:npg_baGg0CBD9qJQ@ep-misty-bird-a1uftcid-pooler.ap-southeast-1.aws.neon.tech/mothi-dev?sslmode=require&channel_binding=require
```

### Environment Variables

Create a `.env` file in the `apps/backend` directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_baGg0CBD9qJQ@ep-misty-bird-a1uftcid-pooler.ap-southeast-1.aws.neon.tech/mothi-dev?sslmode=require&channel_binding=require

# Environment
NODE_ENV=development

# TypeORM Logging (optional)
TYPEORM_LOGGING=true

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Port
PORT=3001
```

## Installation

```bash
$ npm install
```

## Database Seeding

To populate the database with initial data:

```bash
# Basic seed - users only
$ npm run seed

# Comprehensive seed - all entities with realistic data
$ npm run seed:comprehensive

# Individual seed files (optional)
$ npx ts-node seed-purchases.ts
```

### Default Users

After comprehensive seeding, the following test users will be available:

- **Admin**: `rajesh.kumar@mothi.com` / `password123`
- **Coordinator**: `priya.sharma@mothi.com` / `password123`
- **Agent**: `amit.patel@mothi.com` / `password123`
- **Agent**: `sneha.reddy@mothi.com` / `password123`
- **Agent**: `vikram.singh@mothi.com` / `password123`

### Data Generated

The comprehensive seed creates:
- **5 Users** (1 Admin, 1 Coordinator, 3 Agents)
- **25 Parties** (realistic business names with GST numbers)
- **24 Products** (8 per category: Small, Big, King)
- **60+ Subcategories** (2-4 per product with realistic pricing)
- **50 Purchases** (with realistic dates, amounts, and statuses)
- **150+ Purchase Items** (realistic quantities and pricing)

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints

The application provides the following main API endpoints:

- **Auth**: `/auth/login` - User authentication
- **Users**: `/users` - User management
- **Parties**: `/parties` - Party/customer management
- **Products**: `/products` - Product catalog management
- **Purchases**: `/purchases` - Purchase order management

## Support

This is a custom application built with NestJS framework.

## License

This project is proprietary and confidential.
