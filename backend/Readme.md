```backend/
├── .env
├── tsconfig.json
├── package.json
└── src/
    ├── config/
    │   ├── db.ts               # Database connection logic
    │   └── env.ts              # Typed environment variables
    ├── controllers/
    │   └── telemetry.controller.ts # Business logic for focus data
    ├── middlewares/
    │   └── error.middleware.ts # Global error handling
    ├── models/
    │   └── Session.ts          # MongoDB Schema for reading sessions
    ├── routes/
    │   └── telemetry.routes.ts # API endpoint definitions
    ├── utils/
    │   └── metrics.ts          # Helpers (e.g., Deep Work Minutes calculator)
    ├── app.ts                  # Express app configuration
    └── server.ts               # Entry point (Server listener)
    ```