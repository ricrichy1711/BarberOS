
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText, Cookie, Trash2, Users, Globe, Bell } from 'lucide-react';

const LAST_UPDATED = 'Febrero 2026';

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-4">
            <h2 className="flex items-center gap-3 text-xl font-bold text-white border-b border-white/5 pb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 flex-shrink-0">
                    <Icon className="h-4 w-4 text-amber-500" />
                </span>
                {title}
            </h2>
            <div className="text-zinc-400 leading-relaxed space-y-3 pl-11">
                {children}
            </div>
        </section>
    );
}

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-amber-500/30">
            <div className="mx-auto max-w-4xl px-6 py-20">
                <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Inicio
                </Link>

                <header className="mb-16">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                        <Shield className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-black text-white sm:text-5xl tracking-tight mb-3">
                        Política de Privacidad
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Última actualización: <strong className="text-zinc-400">{LAST_UPDATED}</strong>
                    </p>
                    <div className="mt-6 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-300/80 leading-relaxed">
                        <strong className="text-amber-400 block mb-1">Resumen rápido:</strong>
                        Recopilamos los datos necesarios para que la plataforma funcione correctamente. No vendemos tu información personal.
                        Usamos servicios de terceros (Supabase, Mercado Pago, Google AdSense) que tienen sus propias políticas.
                        Puedes solicitar eliminar tu cuenta y datos en cualquier momento.
                    </div>
                </header>

                <div className="space-y-12">

                    {/* 1. Quiénes somos */}
                    <Section icon={Globe} title="1. Quiénes Somos">
                        <p>
                            <strong className="text-white">BarberOs LM</strong> es una plataforma de gestión para barberías que permite agendar citas,
                            administrar personal, controlar ingresos y gestionar clientes. Operamos bajo la dirección de{' '}
                            <a href="mailto:barberosfive@gmail.com" className="text-amber-400 hover:underline">barberosfive@gmail.com</a>.
                        </p>
                        <p>
                            Al utilizar BarberOs LM, aceptas las prácticas descritas en esta Política de Privacidad.
                        </p>
                    </Section>

                    {/* 2. Información que recopilamos */}
                    <Section icon={Eye} title="2. Información que Recopilamos">
                        <p>Recopilamos información en las siguientes categorías:</p>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5">
                                <strong className="text-white block mb-2">📧 Información de Cuenta</strong>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>Nombre completo y correo electrónico (al registrarte con email/contraseña o con Google OAuth)</li>
                                    <li>Rol en la plataforma (cliente, barbero, propietario)</li>
                                    <li>Número de teléfono (opcional, si lo proporcionas)</li>
                                    <li>Foto de perfil (si la subes o viene de tu cuenta de Google)</li>
                                </ul>
                            </div>

                            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5">
                                <strong className="text-white block mb-2">💈 Información de Barbería (Propietarios)</strong>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>Nombre, dirección y descripción de la barbería</li>
                                    <li>Horarios de operación</li>
                                    <li>Información de barberos y servicios ofrecidos</li>
                                    <li>Datos de ingresos y citas gestionadas en la plataforma</li>
                                </ul>
                            </div>

                            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5">
                                <strong className="text-white block mb-2">📅 Datos de Uso</strong>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>Citas agendadas, canceladas o completadas</li>
                                    <li>Servicios seleccionados y barbero asignado</li>
                                    <li>Mensajes internos dentro de la plataforma</li>
                                    <li>Interacciones con funciones del dashboard</li>
                                </ul>
                            </div>

                            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5">
                                <strong className="text-white block mb-2">💻 Datos Técnicos</strong>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>Dirección IP y tipo de navegador</li>
                                    <li>Sistema operativo y tipo de dispositivo</li>
                                    <li>Páginas visitadas dentro de la app y tiempo de visita</li>
                                    <li>Registros de errores para diagnóstico técnico</li>
                                </ul>
                            </div>
                        </div>
                    </Section>

                    {/* 3. Uso de la información */}
                    <Section icon={FileText} title="3. Cómo Usamos tu Información">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Crear y administrar tu cuenta de usuario</li>
                            <li>Facilitar el agendamiento de citas entre clientes y barberías</li>
                            <li>Enviar notificaciones sobre citas, confirmaciones o cambios</li>
                            <li>Procesar pagos de suscripción a través de Mercado Pago</li>
                            <li>Mejorar la plataforma con base en el uso real</li>
                            <li>Mostrar publicidad contextual a usuarios de plan gratuito o básico mediante Google AdSense</li>
                            <li>Enviar comunicaciones importantes sobre cambios en los términos o servicios</li>
                            <li>Detectar y prevenir fraudes o actividades no autorizadas</li>
                        </ul>
                        <p className="text-sm italic text-zinc-500">
                            No usamos tu información para venderla a terceros ni para campañas de marketing de empresas externas sin tu consentimiento.
                        </p>
                    </Section>

                    {/* 4. Cookies y publicidad */}
                    <Section icon={Cookie} title="4. Cookies y Publicidad (Google AdSense)">
                        <p>
                            Utilizamos <strong className="text-white">Google AdSense</strong> para mostrar anuncios en nuestra plataforma
                            a usuarios con planes gratuitos o básicos. Google AdSense puede usar cookies para mostrar anuncios
                            personalizados basados en tus visitas previas a nuestro sitio y otros sitios web.
                        </p>
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm">
                            <strong className="text-blue-300 block mb-1">¿Cómo controlar las cookies de publicidad?</strong>
                            <p className="text-zinc-400">
                                Puedes inhabilitar la publicidad personalizada visitando{' '}
                                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    Configuración de anuncios de Google
                                </a>
                                . También puedes optar por no participar a través de{' '}
                                <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    aboutads.info
                                </a>.
                            </p>
                        </div>
                        <p className="text-sm">
                            Para más información sobre cómo Google usa los datos: {' '}
                            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                                Política de privacidad de Google
                            </a>.
                        </p>
                        <p>
                            También usamos cookies de sesión propias para mantener tu sesión activa mientras usas la plataforma.
                            Estas cookies son estrictamente necesarias y no recopilan datos de navegación externa.
                        </p>
                    </Section>

                    {/* 5. Terceros */}
                    <Section icon={Globe} title="5. Servicios de Terceros">
                        <p>BarberOs LM integra los siguientes servicios externos que tienen acceso a partes de tu información:</p>
                        <div className="space-y-3">
                            {[
                                {
                                    name: 'Supabase',
                                    desc: 'Base de datos y autenticación. Almacena tu información de cuenta, citas y datos de la barbería de forma segura con cifrado en tránsito (TLS) y en reposo.',
                                    link: 'https://supabase.com/privacy',
                                    color: 'border-emerald-500/20 bg-emerald-500/5',
                                },
                                {
                                    name: 'Mercado Pago',
                                    desc: 'Procesamiento de pagos de suscripciones. BarberOs LM no almacena datos de tarjetas bancarias. Toda transacción es procesada directamente por Mercado Pago en su entorno seguro.',
                                    link: 'https://www.mercadopago.com.mx/privacidad',
                                    color: 'border-blue-500/20 bg-blue-500/5',
                                },
                                {
                                    name: 'Google AdSense',
                                    desc: 'Red de publicidad para usuarios en planes gratuito y básico. Puede usar cookies para personalizar anuncios.',
                                    link: 'https://policies.google.com/privacy',
                                    color: 'border-amber-500/20 bg-amber-500/5',
                                },
                                {
                                    name: 'Google OAuth',
                                    desc: 'Inicio de sesión con cuenta de Google (inicio de sesión social). Solo accedemos al nombre, correo y foto de perfil de Google.',
                                    link: 'https://policies.google.com/privacy',
                                    color: 'border-red-500/20 bg-red-500/5',
                                },
                            ].map((s) => (
                                <div key={s.name} className={`p-4 rounded-xl border ${s.color} text-sm`}>
                                    <strong className="text-white">{s.name}</strong>
                                    <p className="text-zinc-400 mt-1">{s.desc}</p>
                                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline text-xs mt-1 inline-block">
                                        Ver política de {s.name} →
                                    </a>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* 6. Seguridad */}
                    <Section icon={Lock} title="6. Seguridad de la Información">
                        <p>Implementamos medidas técnicas y organizativas para proteger tu información:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Toda la comunicación entre tu dispositivo y nuestros servidores está cifrada con <strong className="text-white">TLS/SSL</strong></li>
                            <li>Las contraseñas son gestionadas por Supabase Auth con hashing seguro (bcrypt)</li>
                            <li>El acceso a los datos está restringido por roles (cliente, barbero, propietario, administrador)</li>
                            <li>No almacenamos información de tarjetas de crédito ni datos bancarios directamente</li>
                            <li>Monitoreamos el sistema para detectar accesos no autorizados</li>
                        </ul>
                        <p className="text-sm text-zinc-500 italic">
                            Aunque implementamos las mejores prácticas, ningún sistema en internet es 100% invulnerable.
                            En caso de brecha de seguridad que te afecte, te notificaremos de inmediato.
                        </p>
                    </Section>

                    {/* 7. Datos de menores */}
                    <Section icon={Users} title="7. Menores de Edad">
                        <p>
                            BarberOs LM <strong className="text-white">no está dirigido a personas menores de 13 años</strong> (o la edad mínima de consentimiento digital en tu país).
                            No recopilamos intencionalmente información personal de menores de esta edad.
                        </p>
                        <p>
                            Si eres padre o tutor y crees que tu hijo menor nos ha proporcionado información personal,
                            contáctanos en{' '}
                            <a href="mailto:barberosfive@gmail.com" className="text-amber-400 hover:underline">barberosfive@gmail.com</a>{' '}
                            para eliminar esa información.
                        </p>
                    </Section>

                    {/* 8. Retención */}
                    <Section icon={Bell} title="8. Retención de Datos">
                        <p>Conservamos tu información mientras tu cuenta esté activa o sea necesario para prestarte el servicio:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong className="text-white">Datos de cuenta:</strong> Hasta que solicites la eliminación de tu cuenta</li>
                            <li><strong className="text-white">Historial de citas:</strong> Hasta 2 años después de completadas, por razones de soporte</li>
                            <li><strong className="text-white">Datos de pago:</strong> Según lo requieran las regulaciones fiscales aplicables (generalmente 5 años)</li>
                            <li><strong className="text-white">Logs técnicos:</strong> Máximo 90 días para diagnóstico y seguridad</li>
                        </ul>
                    </Section>

                    {/* 9. Tus derechos */}
                    <Section icon={Trash2} title="9. Tus Derechos (Derechos ARCO)">
                        <p>
                            Tienes derecho a <strong className="text-white">Acceder, Rectificar, Cancelar y Oponerte (ARCO)</strong> al uso de tus datos personales.
                            En concreto, puedes:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong className="text-white">Acceso:</strong> Solicitar qué datos tenemos sobre ti</li>
                            <li><strong className="text-white">Rectificación:</strong> Corregir datos incorrectos (puedes hacerlo desde tu perfil)</li>
                            <li><strong className="text-white">Cancelación/Eliminación:</strong> Solicitar la eliminación completa de tu cuenta y datos. <br />
                                <span className="text-sm text-zinc-500">← Disponible desde Ajustes &gt; Eliminar Cuenta dentro de la app</span>
                            </li>
                            <li><strong className="text-white">Oposición:</strong> Oponerte al uso de tus datos para fines de publicidad personalizada</li>
                            <li><strong className="text-white">Portabilidad:</strong> Solicitar una copia de tus datos en formato legible</li>
                        </ul>
                        <p className="text-sm">
                            Para ejercer estos derechos, contáctanos en{' '}
                            <a href="mailto:barberosfive@gmail.com" className="text-amber-400 hover:underline">barberosfive@gmail.com</a>{' '}
                            con el asunto "Derechos ARCO". Responderemos en un plazo máximo de 20 días hábiles.
                        </p>
                    </Section>

                    {/* 10. Cambios */}
                    <Section icon={FileText} title="10. Cambios a esta Política">
                        <p>
                            Podemos actualizar esta Política de Privacidad periódicamente. Cuando hagamos cambios significativos,
                            te notificaremos por correo electrónico o mediante un aviso destacado en la plataforma.
                            Te recomendamos revisar esta página regularmente.
                        </p>
                        <p>
                            El uso continuado de BarberOs LM después de los cambios constituye tu aceptación de la nueva política.
                        </p>
                    </Section>

                    {/* Contacto */}
                    <section className="rounded-2xl bg-zinc-900/50 p-8 border border-white/5">
                        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-amber-500" />
                            Contacto de Privacidad
                        </h2>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Si tienes preguntas, inquietudes o deseas ejercer tus derechos sobre esta Política de Privacidad,
                            puedes contactarnos en cualquier momento:
                        </p>
                        <div className="space-y-2">
                            <a href="mailto:barberosfive@gmail.com" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold transition-colors">
                                📧 barberosfive@gmail.com
                            </a>
                            <Link to="/contact" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors">
                                📋 Formulario de contacto →
                            </Link>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
