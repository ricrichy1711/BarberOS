import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'recovery'>('loading');
    const [message, setMessage] = useState('Confirmando tu email...');
    const [newPassword, setNewPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // 1. Intentar obtener parámetros de URL (Hash para implícito, Search para PKCE)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const searchParams = new URLSearchParams(window.location.search);

                let accessToken = hashParams.get('access_token');
                let refreshToken = hashParams.get('refresh_token');
                let code = searchParams.get('code');
                let type = hashParams.get('type') || searchParams.get('type');

                console.log('🔵 AuthCallback - Iniciando procesamiento...');
                console.log('Parámetros encontrados:', {
                    hasHashToken: !!accessToken,
                    hasCode: !!code,
                    type
                });

                // 2. Si hay un código (PKCE), intercambiarlo por una sesión
                if (code) {
                    console.log('🔵 Intercambiando código por sesión...');
                    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (exchangeError) {
                        console.error('❌ Error exchanging code:', exchangeError);
                        // No retornamos aquí, intentamos seguir si ya hay una sesión
                    }
                }

                // 3. Si hay tokens en el hash, establecer la sesión manualmente
                if (accessToken && refreshToken) {
                    console.log('🔵 Estableciendo sesión desde hash...');
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    if (sessionError) {
                        console.error('❌ Error setting session:', sessionError);
                    }
                }

                // 4. Verificar si ya tenemos una sesión (ya sea por lo anterior o por el listener automático)
                const { data: { session }, error: sessionCheckError } = await supabase.auth.getSession();

                if (sessionCheckError) {
                    console.error('❌ Error checking session:', sessionCheckError);
                }

                if (session) {
                    const user = session.user;
                    console.log('✅ Sesión activa detectada:', user.id, user.email);

                    // 5. Verificar/Crear perfil en tabla public.users
                    console.log('🔵 Verificando perfil en tabla users...');
                    const { data: existingUser, error: checkError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (!existingUser && (checkError?.code === 'PGRST116' || !checkError)) {
                        console.log('🔵 El perfil no existe, creándolo...');
                        setMessage('Creando tu perfil...');

                        const newUser = {
                            id: user.id,
                            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
                            email: user.email!,
                            phone: user.phone || '',
                            role: user.user_metadata?.role || 'client',
                            created_at: new Date().toISOString()
                        };

                        const { error: insertError } = await supabase
                            .from('users')
                            .insert([newUser]);

                        if (insertError) {
                            console.error('❌ Error al insertar en tabla users:', insertError);
                            // No bloqueamos el flujo por esto, el usuario ya está autenticado en Supabase Auth
                        } else {
                            console.log('✅ Perfil creado exitosamente');
                        }
                    } else {
                        console.log('✅ El perfil ya existe o hubo un error manejable');
                    }

                    if (type === 'recovery') {
                        setStatus('recovery');
                        setMessage('Por favor, ingresa tu nueva contraseña.');
                        return; // Stop here, wait for user input
                    }

                    setStatus('success');
                    setMessage('¡Sesión confirmada! Redirigiendo...');

                    // 6. Redirigir
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 1500);
                    return;
                }

                // 7. Si llegamos aquí y no hay sesión, algo falló o el link no tenía nada
                console.error('❌ No se encontró sesión ni tokens válidos');
                setStatus('error');
                setMessage('No se pudo establecer la sesión. El link puede haber expirado o ya fue utilizado.');

            } catch (err: any) {
                console.error('❌ Fatal Callback error:', err);
                setStatus('error');
                setMessage('Error crítico al procesar la confirmación: ' + err.message);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                {status === 'loading' && (
                    <>
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                        <h2 className="text-xl font-bold text-white mb-2">Procesando...</h2>
                        <p className="text-zinc-400">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">¡Éxito!</h2>
                        <p className="text-zinc-400">{message}</p>
                    </>
                )}

                {status === 'recovery' && (
                    <div className="text-left py-4">
                        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                            <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 text-center">Nueva Contraseña</h2>
                        <p className="text-zinc-400 text-sm mb-6 text-center">{message}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 px-4 text-sm text-white outline-none focus:border-amber-500/50"
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    if (newPassword.length < 6) {
                                        alert('La contraseña debe tener al menos 6 caracteres');
                                        return;
                                    }
                                    setIsUpdating(true);
                                    const { error } = await supabase.auth.updateUser({ password: newPassword });
                                    if (error) {
                                        alert('Error al actualizar contraseña: ' + error.message);
                                        setIsUpdating(false);
                                    } else {
                                        setStatus('success');
                                        setMessage('Contraseña actualizada correctamente. Redirigiendo...');
                                        setTimeout(() => navigate('/'), 1500);
                                    }
                                }}
                                disabled={isUpdating}
                                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-bold text-zinc-900 transition hover:shadow-lg hover:shadow-amber-400/20 disabled:opacity-50"
                            >
                                {isUpdating ? 'Actualizando...' : 'Guardar y Continuar'}
                            </button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                        <p className="text-zinc-400 mb-4">{message}</p>
                        <button
                            onClick={() => navigate('/auth?mode=login')}
                            className="rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2 text-sm font-bold text-zinc-900"
                        >
                            Ir a Iniciar Sesión
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
