exports.seed = function (knex) {
  return knex("members")
    .del()
    .then(function () {
      return knex("members").insert([
        { name: "test-1", email: "test1@gmail.com", password: "test1" },
        { name: "test-2", email: "test2@gmail.com", password: "test2" },
      ]);
    });
};
