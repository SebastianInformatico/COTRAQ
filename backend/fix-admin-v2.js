const { User } = require('./src/models');
// No importamos bcrypt, dejamos que el hook haga su trabajo.

async function fixAdmin() {
  try {
    const user = await User.findOne({ where: { username: 'admin' } });
    if (!user) {
      console.log('User admin NOT FOUND. Creating with PLAIN TEXT password...');
      // Le pasamos la password en plano. El hook beforeCreate en User.js la hasheará.
      await User.create({
        username: 'admin',
        password: 'admin123', 
        email: 'admin@cotraq.com',
        first_name: 'Administrador',
        last_name: 'Sistema',
        role: 'admin',
        employee_id: 'ADM001',
        phone: '+56912345678',
        is_active: true
      });
      console.log('Admin user created successfully!');
    } else {
        console.log('Resetting password for admin with PLAIN TEXT update...');
        // Actualizamos la propiedad y guardamos. El hook beforeUpdate la hasheará.
        user.password = 'admin123';
        await user.save();
        console.log('Admin password updated successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAdmin();