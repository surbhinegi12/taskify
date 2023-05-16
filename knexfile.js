const PGDB_PASSWORD = process.env.PGDB_PASSWORD;

module.exports = {
  development: {
    client: "postgresql",
    connection: {
      host: "localhost",
      database: "taskify",
      user: "postgres",
      port: 5432,
      password: PGDB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds`,
    },
  },
};
