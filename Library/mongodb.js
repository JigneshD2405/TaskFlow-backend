import Node from "#Node";

export const load = async () => {
  try {
    console.info('Loading... DB Connection');

    if (process.env.NODE_ENV === Node.DEVELOPMENT_ENV) {
      Node.DB_URI = process.env.MONGO_URL;
      console.info('MongoDB Uri: ' + Node.DB_URI)
    }

    if (process.env.NODE_ENV !== Node.DEVELOPMENT_ENV) {
      if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
        Node.DB_URI = 'mongodb://' + process.env.MONGODB_USER + ':' + process.env.MONGODB_PASSWORD + '@' + process.env.MONGODB_HOST + ':' + process.env.MONGODB_PORT + '/' + process.env.MONGODB_DATABASE + '?authSource=admin';
      } else {
        Node.DB_URI = 'mongodb://' + process.env.MONGODB_HOST + ':' + process.env.MONGODB_PORT + '/' + process.env.MONGODB_DATABASE + '?authSource=admin';
        console.info('MonogDB Uri: ' + Node.DB_URI)
      }
    }
    let opt = { minPoolSize: 50, maxPoolSize: 200, }
    await Node.Mongoose.set("strictPopulate", false)
    await Node.Mongoose.connect(Node.DB_URI, opt);
    return true;
  } catch (error) {
    console.log('Error... DB Connection', error);
    return false;
  };
};
