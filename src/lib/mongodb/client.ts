import "server-only";

import { MongoClient, type Db } from "mongodb";

type MongoGlobal = typeof globalThis & {
  __shongjogMongoClientPromise?: Promise<MongoClient>;
};

function getMongoConfig() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (!dbName) {
    throw new Error("Missing MONGODB_DB environment variable.");
  }

  return { dbName, uri };
}

export async function getMongoClient() {
  const { uri } = getMongoConfig();
  const mongoGlobal = globalThis as MongoGlobal;

  if (!mongoGlobal.__shongjogMongoClientPromise) {
    const client = new MongoClient(uri, {
      appName: "shongjog",
      maxPoolSize: 10,
      minPoolSize: 0,
    });

    mongoGlobal.__shongjogMongoClientPromise = client.connect();
  }

  return mongoGlobal.__shongjogMongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const { dbName } = getMongoConfig();
  const client = await getMongoClient();

  return client.db(dbName);
}

export async function testMongoConnection() {
  const db = await getMongoDb();
  await db.command({ ping: 1 });

  return {
    database: db.databaseName,
    ok: true,
  };
}
