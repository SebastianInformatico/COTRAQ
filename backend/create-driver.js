const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function fixDriver() {
  try {
    const users = await User.findAll();
    console.log('Total users:', users.length);
    users.forEach(u => console.log(`User: ${u.username} (${u.role})`));

    const existing = await User.findOne({ where: { username: 'conductor1' } });
    if (!existing) {
      console.log('Creating conductor1...');
      const hashedPassword = await bcrypt.hash('driver123', 10);
      await User.create({
        username: 'conductor1',
        password: hashedPassword,
        email: 'conductor1@cotraq.com',
        first_name: 'Juan',
        last_name: 'Driver',
        role: 'driver',
        employee_id: 'DRV001',
        phone: '+56912345678',
        is_active: true
      });
      console.log('User created: conductor1 / driver123');
    } else {
      console.log('User conductor1 already exists. Resetting password...');
      existing.password = await bcrypt.hash('driver123', 10);
      await existing.save();
      console.log('Password updated for conductor1 to driver123');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

fixDriver();