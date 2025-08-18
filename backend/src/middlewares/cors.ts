import cors from 'cors';
require("dotenv").config();

const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS!,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}

export const corsMiddleware = cors(corsOptions);
