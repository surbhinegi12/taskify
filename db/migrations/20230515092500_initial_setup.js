exports.up = async function (knex) {
  await knex.schema

    .createTable("users", function (table) {
      table.increments("id");
      table.string("name", 50).notNullable();
      table.string("email", 50).notNullable();
      table.text("password").notNullable();
      table.datetime("deletedAt").defaultTo(null);
      table.unique(["email"], {
        indexName: "unique_email_index",
        predicate: knex.where("deletedAt", null),
      });
    })
    .createTable("todos", function (table) {
      table.increments("id");
      table.integer("userId").notNullable().references("users.id");
      table.string("title", 250).notNullable();
    })
    .createTable("tasks", function (table) {
      table.increments("id");
      table.integer("todoId").notNullable().references("todos.id");
      table.datetime("createdAt").defaultTo(knex.fn.now());
      table.date("deadline").notNullable();
      table.text("description");
      table
        .string("status", 50)
        .defaultTo("pending", { constraintName: "df_table_value" });
      table.string("priority", 50);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tasks").dropTable("todos").dropTable("users");
};

exports.config = { transaction: false };
