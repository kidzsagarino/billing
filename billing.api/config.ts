export default {
  schema: {
    type: 'object',
    required: ['PORT', 'DB_NAME', 'JWT_SECRET'],
    properties: {
      PORT: { type: 'number' },
      DB_NAME: { type: 'string' },
      JWT_SECRET: { type: 'string' }
    }
  },
  dotenv: true
}