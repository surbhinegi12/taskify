exports.seed = async function (knex) {
  await knex("tasks").del();
  await knex("todos").del();
  await knex("users").del();

  await knex("users").insert([
    { name: "test1", email: "test1@gmail.com", password: "test1" },
    { name: "test2", email: "test2@gmail.com", password: "test2" },
  ]);
  const users = await knex("users").select("id");
  await knex("todos").insert([
    { userId: users[0].id, title: "grocery" },
    { userId: users[1].id, title: "exams" },
  ]);
  const todos = await knex("todos").select("id");
  await knex("tasks").insert([
    { todoId: todos[0].id, priority: "low", deadline: "2023-05-30" },
    {
      todoId: todos[1].id,
      deadline: "2023-05-20",
      description: "complete unit 1 and 2 of cyber security",
    },
  ]);
};
