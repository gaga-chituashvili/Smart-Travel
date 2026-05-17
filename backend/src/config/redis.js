// Redis optional - disabled if not available
let redisClient = {
  connect: async () => console.log('⚠️  Redis skipped'),
  disconnect: async () => {},
  get: async () => null,
  set: async () => null,
};

export { redisClient };
