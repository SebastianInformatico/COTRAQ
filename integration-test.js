// Script de prueba de integración frontend-backend
// Este script verifica la conectividad y funcionalidad básica

const API_BASE = 'http://localhost:3001/api';

// Función para hacer petitions con manejo de errores
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`${response.status}: ${data.error || data.message}`);
        }
        
        return data;
    } catch (error) {
        console.error(`❌ Error en ${endpoint}:`, error.message);
        throw error;
    }
}

// Test de conectividad básica
async function testHealthCheck() {
    console.log('🔍 Probando health check...');
    try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        console.log('✅ Health check OK:', data);
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error);
        return false;
    }
}

// Test de autenticación
async function testAuthentication() {
    console.log('🔍 Probando autenticación...');
    try {
        // Intentar login con credenciales de admin
        const loginData = {
            login: 'admin@cotraq.com',
            password: 'admin123'
        };
        
        const result = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        console.log('✅ Login exitoso:', {
            user: result.user?.first_name + ' ' + result.user?.last_name,
            role: result.user?.role,
            tokenLength: result.token?.length
        });
        
        return result.token;
    } catch (error) {
        console.error('❌ Login failed:', error);
        return null;
    }
}

// Test de endpoint protegido
async function testProtectedEndpoint(token) {
    console.log('🔍 Probando endpoints protegidos...');
    try {
        // Probar obtener checklists
        const checklists = await apiRequest('/checklists', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Checklists obtenidos:', {
            count: checklists.checklists?.length,
            examples: checklists.checklists?.slice(0, 2).map(c => c.name)
        });
        
        // Probar obtener usuarios
        const users = await apiRequest('/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Usuarios obtenidos:', {
            count: users.users?.length,
            examples: users.users?.slice(0, 2).map(u => `${u.first_name} ${u.last_name}`)
        });
        
        return true;
    } catch (error) {
        console.error('❌ Protected endpoints failed:', error);
        return false;
    }
}

// Test de CORS
async function testCORS() {
    console.log('🔍 Probando configuración de CORS...');
    try {
        const response = await fetch('http://localhost:3001/health', {
            mode: 'cors'
        });
        console.log('✅ CORS configurado correctamente');
        return true;
    } catch (error) {
        console.error('❌ CORS error:', error);
        return false;
    }
}

// Ejecutar todas las pruebas
async function runIntegrationTests() {
    console.log('🚀 Iniciando pruebas de integración frontend-backend...\n');
    
    const results = {
        health: false,
        cors: false,
        auth: false,
        protected: false
    };
    
    // Test 1: Health check
    results.health = await testHealthCheck();
    console.log('');
    
    // Test 2: CORS
    results.cors = await testCORS();
    console.log('');
    
    // Test 3: Autenticación
    const token = await testAuthentication();
    results.auth = !!token;
    console.log('');
    
    // Test 4: Endpoints protegidos
    if (token) {
        results.protected = await testProtectedEndpoint(token);
    }
    console.log('');
    
    // Resumen
    console.log('📊 RESUMEN DE PRUEBAS:');
    console.log('='.repeat(50));
    console.log(`Health Check:        ${results.health ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`CORS Config:         ${results.cors ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Autenticación:       ${results.auth ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Endpoints Protegidos: ${results.protected ? '✅ PASS' : '❌ FAIL'}`);
    console.log('='.repeat(50));
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 RESULTADO GENERAL: ${allPassed ? '🟢 TODOS LOS TESTS PASARON' : '🔴 ALGUNOS TESTS FALLARON'}`);
    
    if (allPassed) {
        console.log('\n🎉 ¡Integración frontend-backend funcionando correctamente!');
        console.log('   - Backend API operativo en puerto 3001');
        console.log('   - Frontend web operativo en puerto 3000');
        console.log('   - Autenticación JWT funcionando');
        console.log('   - Endpoints protegidos accesibles');
        console.log('   - CORS configurado correctamente');
    }
    
    return allPassed;
}

// Ejecutar las pruebas cuando se carga la página
if (typeof window !== 'undefined') {
    console.log('Sistema S.C.O.T.A. - Test de Integración');
    runIntegrationTests();
} else {
    module.exports = { runIntegrationTests };
}