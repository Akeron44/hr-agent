"use strict";
// import { PrismaClient } from '@prisma/client'
// import dotenv from 'dotenv'
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
import client from '@prisma/client'
// dotenv.config({ path: '.env.local' })
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }
// export const prisma = globalForPrisma.prisma ?? new PrismaClient()
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
// import { PrismaClient } from '@prisma/client'
// import dotenv from 'dotenv'
// dotenv.config({ path: '.env.local' })
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }
// export const prisma = globalForPrisma.prisma ?? new PrismaClient({
//   log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
// })
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
// var client_1 = require("@prisma/client");
var globalForPrisma = globalThis;
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new client.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
