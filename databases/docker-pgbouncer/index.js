const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')
dotenv.config({
  path: 'prisma/.env',
})

const client = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@127.0.0.1:6433/blog?schema=public',
    },
  },
})

const clientWithQueryStringParam = new PrismaClient({
  datasources: {
    db: {
      url:
        'postgresql://postgres:postgres@127.0.0.1:6433/blog?schema=public&pgbouncer=true',
    },
  },
})

async function clientWithoutQueryStringParamCall() {
  await client.$disconnect()
  await client.$connect()
  const data = await client.user.findMany()
  return data
}

async function clientWithQueryStringParamCall() {
  await clientWithQueryStringParam.$disconnect()
  await clientWithQueryStringParam.$connect()
  const data = await clientWithQueryStringParam.user.findMany()
  return data
}

async function main() {
  try {
    // try-catch because this is expected to fail
    const data1 = await client.user.findMany()
    console.log({ data1 })

    /*
    * Query engine instance names prepared statements serially s0, s1 and so on. Without the `pgbouncer=true` flag, 
    * prepared statements are not cleaned up in PgBouncer. By doing disconnect/reconnect, we get a 
    * new instance of query engine that starts again at s0. And we expect the next client call to throw
    * "prepared statement s0 already exists"
    */
    await client.$disconnect()
    await client.$connect()

    const data2 = await client.user.findMany()
    console.log({ data2 })
  } catch (e) {
    console.log(e)
  }

  const data3 = await clientWithQueryStringParam.user.findMany()
  console.log({ data3 })

  const data4 = await clientWithQueryStringParam.user.findMany()
  console.log({ data4 })
}

if (require.main === module) {
  main()
    .then((_) => { })
    .catch((e) => {
      console.log(e)
    })
    .finally(() => {
      client.$disconnect()
      clientWithQueryStringParam.$disconnect()
    })
}

module.exports = {
  clientWithoutQueryStringParamCall,
  clientWithQueryStringParamCall,
  client,
  clientWithQueryStringParam,
}
