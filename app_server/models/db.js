const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost/Loc8r';

mongoose.set('useUnifiedTopology', true);

mongoose.connect(dbURI, {useNewUrlParser: true});

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on('error', err => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close( () => {
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  });

// For nodemon restarts
process.once('SIGUSR2', () => {
    console.log(`Mongoose, nodemon killed the app`);
    gracefulShutdown('nodemon restart', () => {
      process.kill(process.pid, 'SIGUSR2');
    });
});

// Listens for SIGINT to be emitted upon app termination
  process.on('SIGINT', () => {
    console.log(`Mongoose: SIGINT killed app`);
    gracefulShutdown('app termination', () => {
      process.exit(0);
    });
  });

// sends a message to gracefulShutdown and a callback to exit the Node process
  process.on('SIGTERM', () => {
    gracefulShutdonw('Heroku app shutdown', () => {
      process.exit(0);
    });
  });

  require('./locations');
}