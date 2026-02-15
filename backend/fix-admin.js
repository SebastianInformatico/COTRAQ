const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function fixAdmin() {
  try {
    const user = await User.findOne({ where: { username: 'admin' } });
    if (!user) {
      console.log('User admin NOT FOUND. Creating...');
      // Si no existe, lo creamos
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
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
        // Validación de contraseña vieja para debug
        const oldMatch = await bcrypt.compare('admin123', user.password);
        console.log('Password "admin123" match current hash?', oldMatch);

        // Actualizamos contraseña en texto plano para que el hook la encripte
        console.log('Resetting password for admin...');
        user.password = 'admin123';
        await user.save();
        console.log('Admin password updated successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAdmin();