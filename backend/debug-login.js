const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const db = require('./src/models');

async function debugLogin() {
  try {
    await db.sequelize.authenticate();
    console.log('DB Connected');

    const username = 'admin';
    const password = 'admin123';

    console.log(`Searching for user: ${username}`);
    const user = await db.User.findOne({ where: { username } });

    if (!user) {
      console.log('❌ User NOT found');
      return;
    }

    console.log('✅ User found:', user.email);
    console.log('Stored Hash:', user.password);

    console.log(`Attempting to compare password: '${password}'`);
    const isMatch = await bcrypt.compare(password, user.password);

    console.log(`Password Match Result: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);

    if (!isMatch) {
      console.log('Debugging manual hash...');
      const newHash = await bcrypt.hash(password, 10);
      console.log('New Hash for reference:', newHash);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.sequelize.close();
  }
}

debugLogin();
