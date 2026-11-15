import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import mongodb from 'mongodb'
import { EJSON } from 'bson'

const { MongoClient } = mongodb

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const databaseName = process.env.MONGODB_DB || 'greennova'
const client = new MongoClient(uri)
const backupDirectory = fileURLToPath(new URL('./.mongodb-backups/', import.meta.url))
const createdAt = new Date()
const timestamp = createdAt.toISOString().replaceAll(':', '-')
const outputPath = join(backupDirectory, `${databaseName}-${timestamp}.ejson`)

try {
  await client.connect()
  const database = client.db(databaseName)
  const infos = await database.listCollections({}, { nameOnly: false }).toArray()
  const collections = []

  for (const info of infos) {
    if (info.type !== 'collection') continue
    const collection = database.collection(info.name)
    const [documents, indexes] = await Promise.all([
      collection.find({}).toArray(),
      collection.indexes(),
    ])
    collections.push({
      name: info.name,
      options: info.options || {},
      indexes,
      documents,
    })
  }

  await mkdir(backupDirectory, { recursive: true })
  await writeFile(outputPath, EJSON.stringify({
    database: databaseName,
    createdAt,
    collections,
  }, null, 2), 'utf8')
  console.log(`Đã sao lưu ${collections.length} collection của database ${databaseName}.`)
  console.log(outputPath)
} finally {
  await client.close()
}
