const axios = require('axios');

async function testLogin() {
  try {
    console.log('Attempting login with conductor1/driver123...');
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      login: 'conductor1',
      password: 'driver123'
    });
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (error) {
    console.error('Login Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();