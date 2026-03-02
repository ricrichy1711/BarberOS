/**
 * Script para aplicar las migraciones de seguridad crítica
 * Ejecutar con: node database/scripts/apply-migrations.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'TU_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'TU_SERVICE_ROLE_KEY';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || SUPABASE_URL.includes('TU_')) {
    console.error('❌ ERROR: Configura las variables de entorno VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runSQL(sql, description) {
    console.log(`\n📝 Ejecutando: ${description}...`);
    try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error(`❌ Error: ${error.message}`);
            return false;
        }

        console.log(`✅ ${description} - Completado`);
        return true;
    } catch (err) {
        console.error(`❌ Excepción: ${err.message}`);
        return false;
    }
}

async function main() {
    console.log('════════════════════════════════════════════════════════════');
    console.log('🚨 APLICACIÓN DE MIGRACIONES CRÍTICAS');
    console.log('   Sistema Anti-Duplicación de Contrataciones');
    console.log('════════════════════════════════════════════════════════════\n');

    // Paso 1: Diagnóstico
    console.log('📊 PASO 1: Ejecutando diagnóstico...');
    const cleanupSQL = readFileSync(
        join(__dirname, 'cleanup_duplicates.sql'),
        'utf-8'
    );

    await runSQL(cleanupSQL, 'Script de diagnóstico');

    // Preguntar si continuar
    console.log('\n⚠️  Revisa el diagnóstico anterior.');
    console.log('Si hay problemas, resuélvelos manualmente antes de continuar.\n');

    const readline = await import('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const continuar = await new Promise((resolve) => {
        rl.question('¿Continuar con la aplicación de constraints? (s/n): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 's');
        });
    });

    if (!continuar) {
        console.log('\n🛑 Aplicación cancelada. Resuelve los problemas y vuelve a ejecutar.');
        return;
    }

    // Paso 2: Aplicar migraciones
    console.log('\n📝 PASO 2: Aplicando constraints y triggers...');
    const migrationSQL = readFileSync(
        join(__dirname, '../migrations/fix_barber_unique_employment.sql'),
        'utf-8'
    );

    const success = await runSQL(migrationSQL, 'Constraints de integridad');

    if (success) {
        console.log('\n════════════════════════════════════════════════════════════');
        console.log('✅ MIGRACIONES APLICADAS EXITOSAMENTE');
        console.log('════════════════════════════════════════════════════════════');
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('1. Verifica que la aplicación funcione correctamente');
        console.log('2. Prueba los escenarios descritos en README_CRITICAL_FIX.md');
        console.log('3. Monitorea los logs en busca de errores');
    } else {
        console.log('\n════════════════════════════════════════════════════════════');
        console.log('❌ ERROR AL APLICAR MIGRACIONES');
        console.log('════════════════════════════════════════════════════════════');
        console.log('\nRevisa los errores y aplica las migraciones manualmente.');
    }
}

main().catch(console.error);
