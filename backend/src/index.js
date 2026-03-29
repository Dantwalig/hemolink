require("dotenv").config();

const express     = require("express");
const cors        = require("cors");
const morgan      = require("morgan");
const swaggerUi   = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const routes      = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS — only allow the configured frontend origin ──────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Swagger UI, curl, mobile)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger docs ───────────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api", routes);

// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🩸 HemoLink API running on port ${PORT}`);
  console.log(`📖 Swagger docs → http://localhost:${PORT}/api-docs`);
  if (!process.env.AT_API_KEY) {
    console.log("⚠️  AT_API_KEY not set — SMS will be logged to console (mock mode)");
  }
  console.log();
});

// Graceful shutdown on Ctrl-C / SIGTERM (important for Prisma connection pool)
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function shutdown() {
  console.log("\nShutting down…");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}
process.on("SIGINT",  shutdown);
process.on("SIGTERM", shutdown);

module.exports = app;
