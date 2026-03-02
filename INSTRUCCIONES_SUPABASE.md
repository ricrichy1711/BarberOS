# 🚀 Instrucciones para Configurar Supabase

## Paso 1: Ejecutar el Script SQL

Ve a tu proyecto en Supabase → **SQL Editor** → **New Query** y pega este código:

```sql
-- 1. CREAR TABLAS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('admin', 'owner', 'barber', 'client')) NOT NULL,
  barbershop_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  image TEXT,
  owner_id UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT TRUE,
  plan TEXT DEFAULT 'basic',
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  bio TEXT,
  barbershop_id UUID REFERENCES barbershops(id),
  is_approved BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id),
  barber_id UUID REFERENCES barbers(id),
  barbershop_id UUID REFERENCES barbershops(id),
  service TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  price DECIMAL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  receiver_id UUID REFERENCES users(id),
  receiver_name TEXT NOT NULL,
  receiver_role TEXT NOT NULL,
  content TEXT NOT NULL,
  barbershop_id UUID REFERENCES barbershops(id),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HABILITAR ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE SEGURIDAD

-- USERS: Lectura pública, inserción solo del propio usuario
DROP POLICY IF EXISTS "Lectura pública de usuarios" ON users;
CREATE POLICY "Lectura pública de usuarios" 
ON users FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON users;
CREATE POLICY "Usuarios pueden insertar su propio perfil" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON users;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- BARBERSHOPS: Lectura pública, escritura para dueños
DROP POLICY IF EXISTS "Lectura pública de barberías" ON barbershops;
CREATE POLICY "Lectura pública de barberías" 
ON barbershops FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Inserción de barberías" ON barbershops;
CREATE POLICY "Inserción de barberías" 
ON barbershops FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Actualización de barberías" ON barbershops;
CREATE POLICY "Actualización de barberías" 
ON barbershops FOR UPDATE 
USING (owner_id = auth.uid());

-- BARBERS: Lectura pública, escritura controlada
DROP POLICY IF EXISTS "Lectura pública de barberos" ON barbers;
CREATE POLICY "Lectura pública de barberos" 
ON barbers FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Inserción de barberos" ON barbers;
CREATE POLICY "Inserción de barberos" 
ON barbers FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Actualización de barberos" ON barbers;
CREATE POLICY "Actualización de barberos" 
ON barbers FOR UPDATE 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Eliminación de barberos" ON barbers;
CREATE POLICY "Eliminación de barberos" 
ON barbers FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- APPOINTMENTS: Lectura pública, escritura para usuarios autenticados
DROP POLICY IF EXISTS "Lectura pública de citas" ON appointments;
CREATE POLICY "Lectura pública de citas" 
ON appointments FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Inserción de citas" ON appointments;
CREATE POLICY "Inserción de citas" 
ON appointments FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Actualización de citas" ON appointments;
CREATE POLICY "Actualización de citas" 
ON appointments FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- MESSAGES: Solo lectura y escritura para participantes
DROP POLICY IF EXISTS "Lectura de mensajes propios" ON messages;
CREATE POLICY "Lectura de mensajes propios" 
ON messages FOR SELECT 
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Inserción de mensajes" ON messages;
CREATE POLICY "Inserción de mensajes" 
ON messages FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Actualización de mensajes" ON messages;
CREATE POLICY "Actualización de mensajes" 
ON messages FOR UPDATE 
USING (receiver_id = auth.uid());
```

## Paso 2: Configurar Email Templates (Opcional pero Recomendado)

1. Ve a **Authentication** → **Email Templates**
2. Personaliza el template de "Confirm signup" con tu marca
3. Ejemplo de mensaje:

```
<h2>¡Bienvenido a BarberHub!</h2>
<p>Hola,</p>
<p>Gracias por registrarte. Por favor confirma tu email haciendo clic en el botón:</p>
<a href="{{ .ConfirmationURL }}">Confirmar Email</a>
```

## Paso 3: Verificar Configuración de Email

1. Ve a **Authentication** → **Providers** → **Email**
2. **MANTÉN ACTIVADO** "Confirm email" (esto es importante para seguridad)
3. Verifica que "Enable email confirmations" esté marcado

## Paso 4: Probar el Registro

1. Abre tu app en `http://localhost:5173`
2. Regístrate con un email REAL que puedas revisar
3. Revisa tu bandeja de entrada (y spam) para el email de confirmación
4. Haz clic en el link de confirmación
5. Ahora podrás iniciar sesión

## ⚠️ Notas Importantes

- **Emails de prueba**: Usa emails reales para testing (Gmail, Outlook, etc.)
- **Confirmación obligatoria**: Los usuarios NO podrán iniciar sesión hasta confirmar su email
- **Desarrollo local**: Supabase enviará emails reales incluso en desarrollo
- **Límite de emails**: El plan gratuito tiene límite de emails por hora

## 🔧 Si tienes problemas

### Error: "Usuario ya existe"
1. Ve a **Authentication** → **Users**
2. Busca el email y elimínalo
3. Intenta registrarte de nuevo

### No llega el email de confirmación
1. Revisa la carpeta de spam
2. Verifica que el email esté bien escrito
3. Espera 1-2 minutos (a veces tarda)
4. Ve a **Authentication** → **Users** y verifica que el usuario aparezca como "Waiting for verification"

### Error de permisos al insertar datos
- Asegúrate de haber ejecutado TODO el script SQL de arriba
- Las políticas RLS deben estar configuradas correctamente
