1. bash
   git clone https://github.com/nesatkroper/express-thesis.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the application

1. Create .env at the root of the project:
    ```.env
        DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/thesis?schema=thesis"
        NODE_ENV="development"
        PORT=4200
2. Apply Prisma migrations:
   ```bash
   npm run prisma
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The API will be running at `http://localhost:34200/v1` (or the port specified in your environment).

## API Endpoints

*(Document your API endpoints here, e.g., using OpenAPI Specification or simply listing them)*

## Project Structure

* `src/`: Source code
  * `controllers/`: API controllers
  * `routes/`: API routes
  * `services/`: Business logic
  * `prisma/`: Prisma schema and migrations
  * `index.ts`: Application entry point
* `prisma/schema.prisma`: Prisma database schema

## Technologies Used

* Express.js
* Prisma

## Contributing

*(Instructions on how to contribute)*

## License

*(License information)*
```
