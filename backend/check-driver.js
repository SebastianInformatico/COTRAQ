const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function checkDriver() {
  try {
    const user = await User.findOne({ where: { username: 'conductor1' } });
    if (!user) {
      console.log('User conductor1 NOT FOUND');
      return;
    }
    console.log('User found:', user.username);
    console.log('Stored hash:', user.password);
    
    const isValid = await bcrypt.compare('driver123', user.password);
    console.log('Password "driver123" is valid:', isValid);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDriver();