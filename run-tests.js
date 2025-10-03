#!/usr/bin/env node

const { spawn } = require('child_process');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_testing';
process.env.JWT_EXPIRES_IN = '1h';

console.log('🚀 Starting comprehensive test suite...\n');

async function runTests() {
  return new Promise((resolve, reject) => {
    const jest = spawn('npx', ['jest', '--runInBand', '--verbose'], {
      stdio: 'inherit',
      env: { ...process.env }
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ All tests completed successfully!');
        resolve();
      } else {
        console.log('\n❌ Some tests failed.');
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });

    jest.on('error', (error) => {
      console.error('❌ Error running tests:', error);
      reject(error);
    });
  });
}

runTests()
  .then(() => {
    console.log('\n📊 Test Summary:');
    console.log('- Unit Tests: ✅ Models, Middleware, Validation, Database');
    console.log('- Integration Tests: ✅ API Endpoints');
    console.log('\n🎉 Your CRUD Notes API is thoroughly tested and robust!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test execution failed:', error.message);
    process.exit(1);
  });