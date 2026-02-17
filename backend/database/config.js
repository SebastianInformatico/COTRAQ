require("dotenv").config();

module.exports = {
  development: {
    dialect: "sqlite",
    storage: "./database/scota_development.sqlite",
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME_TEST || "scota_test",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl:
        process.env.DB_SSL === "true" ||
        process.env.DATABASE_URL?.includes("railway")
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  },
};
