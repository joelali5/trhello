const db = require("../connection");
const format = require("pg-format");

const seed = async ({
  workspaceData,
  membersData,
  membersWorkspaceData,
  boardsData,
  boardsMembersData,
  listsData,
  cardsData,
  cardMembersData,
  commentsData,
  imagesData,
}) => {
  await db.query(`DROP TABLE IF EXISTS images`);
  await db.query(`DROP TABLE IF EXISTS comments`);
  await db.query(`DROP TABLE IF EXISTS cardsMembers`);
  await db.query(`DROP TABLE IF EXISTS cards`);
  await db.query(`DROP TABLE IF EXISTS lists`);
  await db.query(`DROP TABLE IF EXISTS boardMembers`);
  await db.query(`DROP TABLE IF EXISTS boards`);
  await db.query(`DROP TABLE IF EXISTS membersWorkspace`);
  await db.query(`DROP TABLE IF EXISTS members`);
  await db.query(`DROP TABLE IF EXISTS workspaces`);

  const workspacesTablePromise = db.query(`
      CREATE TABLE workspaces(
          workspace_id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          description VARCHAR NOT NULL
      );
  `);

  const membersTablePromise = db.query(`
      CREATE TABLE members(
          member_id SERIAL PRIMARY KEY,
          email VARCHAR NOT NULL,
          password VARCHAR NOT NULL,
          firstname VARCHAR DEFAULT 'firstname',
          lastname VARCHAR DEFAULT 'lastname',
          UNIQUE (email)
      );
    `);

  await Promise.all([workspacesTablePromise, membersTablePromise]);

  await db.query(`
        CREATE TABLE membersWorkspace(
            id SERIAL PRIMARY KEY,
            member_id INT REFERENCES members(member_id),
            workspace_id INT REFERENCES workspaces(workspace_id)
        );
    `);

  await db.query(`
        CREATE TABLE boards(
            board_id SERIAL PRIMARY KEY,
            title VARCHAR NOT NULL,
            workspace_id INT REFERENCES workspaces(workspace_id)
        );
    `);

  await db.query(`
    CREATE TABLE boardMembers(
      id SERIAL PRIMARY KEY,
      board_id INT REFERENCES boards(board_id),
      member_id INT REFERENCES members(member_id)
    );
`);

  await db.query(`
    CREATE TABLE lists(
      list_id SERIAL PRIMARY KEY,
      title VARCHAR NOT NULL,
      board_id INT REFERENCES boards(board_id)
    );
    `);

  await db.query(`
      CREATE TABLE cards(
          card_id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          description VARCHAR NOT NULL,
          list_id INT REFERENCES lists(list_id)
      );
    `);

  await db.query(`
        CREATE TABLE cardsMembers(
            id SERIAL PRIMARY KEY,
            card_id INT REFERENCES cards(card_id),
            member_id INT REFERENCES members(member_id)
        );
    `);

  await db.query(`
        CREATE TABLE comments(
            comment_id SERIAL PRIMARY KEY,
            comment VARCHAR NOT NULL,
            member_id INT REFERENCES members(member_id),
            card_id INT REFERENCES cards(card_id)
        );
    `);

  await db.query(`
        CREATE TABLE images(
            img_id SERIAL PRIMARY KEY,
            name VARCHAR NOT NULL,
            data VARCHAR NOT NULL,
            member_id INT REFERENCES members(member_id),
            board_id INT REFERENCES boards(board_id),
            card_id INT REFERENCES cards(card_id)
        );
    `);

  //INSERTING DATA INTO THE TABLES
  const insertWorkspacesQuery = format(
    "INSERT INTO workspaces (name, description) VALUES %L RETURNING *;",
    workspaceData.map(({ name, description }) => [name, description])
  );
  const workspaceInsertPromise = db
    .query(insertWorkspacesQuery)
    .then((result) => result.rows);

  const insertMembersQuery = format(
    "INSERT INTO members (email, password, firstname, lastname) VALUES %L RETURNING *;",
    membersData.map(({ email, password, firstname, lastname }) => [
      email,
      password,
      firstname,
      lastname,
    ])
  );
  const membersInsertPromise = db
    .query(insertMembersQuery)
    .then((result) => result.rows);

  await Promise.all([workspaceInsertPromise, membersInsertPromise]);

  //
  const insertMembersWorkspaceQuery = format(
    "INSERT INTO membersWorkspace (member_id, workspace_id) VALUES %L RETURNING *;",
    membersWorkspaceData.map(({ member_id, workspace_id }) => [
      member_id,
      workspace_id,
    ])
  );
  await db.query(insertMembersWorkspaceQuery).then((result) => result.rows);

  //
  const insertBoardsQuery = format(
    "INSERT INTO boards (title, workspace_id) VALUES %L RETURNING *;",
    boardsData.map(({ title, workspace_id }) => [title, workspace_id])
  );

  await db.query(insertBoardsQuery).then((result) => result.rows);

  //
  const insertBoardMembersQuery = format(
    "INSERT INTO boardMembers (board_id, member_id) VALUES %L RETURNING *;",
    boardsMembersData.map(({ board_id, member_id }) => [board_id, member_id])
  );

  await db.query(insertBoardMembersQuery).then((result) => result.rows);

  //
  const insertListsQuery = format(
    "INSERT INTO lists (title, board_id) VALUES %L RETURNING *;",
    listsData.map(({ title, board_id }) => [title, board_id])
  );

  const listsInsert = db.query(insertListsQuery).then((result) => result.rows);

  //
  const insertCardsQuery = format(
    "INSERT INTO cards (name, description, list_id) VALUES %L RETURNING *;",
    cardsData.map(({ name, description, list_id }) => [
      name,
      description,
      list_id,
    ])
  );
  const cardsInsert = db.query(insertCardsQuery).then((result) => result.rows);

  await Promise.all([listsInsert, cardsInsert]);

  //
  const insertCardMembersQuery = format(
    "INSERT INTO cardsMembers (card_id, member_id) VALUES %L RETURNING *;",
    cardMembersData.map(({ card_id, member_id }) => [card_id, member_id])
  );

  await db.query(insertCardMembersQuery).then((result) => result.rows);

  //
  const insertCommentQuery = format(
    "INSERT INTO comments (comment, member_id, card_id) VALUES %L RETURNING *;",
    commentsData.map(({ comment, member_id, card_id }) => [
      comment,
      member_id,
      card_id,
    ])
  );

  const commentsInsert = db
    .query(insertCommentQuery)
    .then((result) => result.rows);

  //
  const insertImagesQuery = format(
    "INSERT INTO images(name, data, member_id, board_id, card_id) VALUES %L RETURNING *;",
    imagesData.map(({ name, data, member_id, board_id, card_id }) => [
      name,
      data,
      member_id,
      board_id,
      card_id,
    ])
  );

  const imagesInsert = db
    .query(insertImagesQuery)
    .then((result) => result.rows);

  return Promise.all([commentsInsert, imagesInsert]);
};

module.exports = seed;
