import fp from 'fastify-plugin'
import { Sequelize } from 'sequelize'

export default fp(async (fastify) => {
    const sequelize = new Sequelize(
    fastify.config.DB_NAME,
    fastify.config.DB_USER,
    fastify.config.DB_PASSWORD,
    {
      host: fastify.config.DB_HOST,
      port: fastify.config.DB_PORT,
      dialect: 'mysql',
      logging: false
    }
  )

    await sequelize.authenticate()
    fastify.log.info('✅ Database connected')

    fastify.decorate('sequelize', sequelize)

    fastify.addHook('onClose', async () => {
        await sequelize.close()
    })
})