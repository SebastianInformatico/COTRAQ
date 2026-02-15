const { User } = require('./src/models');

async function fixPassword() {
  try {
    const user = await User.findOne({ where: { username: 'conductor1' } });
    if (!user) {
      console.log('User not found!');
      return;
    }
    
    // Al asignar el password en texto plano y guardar, el hook beforeUpdate se encargará de hashearlo UNA VEZ.
    console.log('Updating password for conductor1...');
    user.password = 'driver123'; 
    await user.save();
    
    console.log('Password updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixPassword();