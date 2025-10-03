const mongoose = require('mongoose');
const ConnectDB = require('../../src/DataBase/db');

// Mock mongoose.connect for testing
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  set: jest.fn(),
  connection: {
    host: 'localhost'
  }
}));

describe('Database Connection', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original implementations
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('should connect to MongoDB successfully', async () => {
    // Mock successful connection
    mongoose.connect.mockResolvedValueOnce({
      connection: { host: 'localhost' }
    });

    // Set environment variable
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

    await ConnectDB();

    expect(mongoose.set).toHaveBeenCalledWith('strictQuery', false);
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
    expect(consoleLogSpy).toHaveBeenCalledWith('Connecting to MongoDB...');
    expect(consoleLogSpy).toHaveBeenCalledWith('Database connected: localhost');
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it('should handle missing MONGODB_URI environment variable', async () => {
    // Remove environment variable
    delete process.env.MONGODB_URI;

    await ConnectDB();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Database connection error:', 
      'MONGODB_URI environment variable is not defined'
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  it('should handle database connection errors', async () => {
    // Mock connection error
    const connectionError = new Error('Connection failed');
    mongoose.connect.mockRejectedValueOnce(connectionError);

    // Set environment variable
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

    await ConnectDB();

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Database connection error:', 'Connection failed');
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should set strictQuery to false', async () => {
    mongoose.connect.mockResolvedValueOnce({
      connection: { host: 'localhost' }
    });

    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

    await ConnectDB();

    expect(mongoose.set).toHaveBeenCalledWith('strictQuery', false);
  });
});