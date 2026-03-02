
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, FileCheck, AlertCircle, Gavel, CreditCard, Scissors, Ban, RefreshCw, Globe } from 'lucide-react';

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

export default function TermsOfUse() {
    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-amber-500/30">
            <div className="mx-auto max-w-4xl px-6 py-20">
                <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Inicio
                </Link>

                <header className="mb-16">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                        <Scale className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-black text-white sm:text-5xl tracking-tight mb-3">
                        Términos y Condiciones de Uso
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Última actualización: <strong className="text-zinc-400">{LAST_UPDATED}</strong>
                    </p>
                    <div className="mt-6 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-300/80 leading-relaxed">
                        <strong className="text-amber-400 block mb-1">Importante:</strong>
                        Al registrarte y usar BarberOs LM aceptas estos términos. Si no estás de acuerdo,
                        por favor no utilices la plataforma. Estos términos aplican a todos los usuarios:
                        clientes, barberos y propietarios de barberías.
                    </div>
                </header>

                <div className="space-y-12">

                    {/* 1. Aceptación */}
                    <Section icon={FileCheck} title="1. Aceptación de los Términos">
                        <p>
                            Al acceder o usar <strong className="text-white">BarberOs LM</strong> (en adelante, "la Plataforma"),
                            ya sea como visitante, cliente, barbero o propietario de barbería, aceptas estar sujeto a estos
                            Términos y Condiciones, así como a nuestra{' '}
                            <Link to="/privacy" className="text-amber-400 hover:underline">Política de Privacidad</Link>.
                        </p>
                        <p>
                            Estos términos constituyen un acuerdo legal entre tú y BarberOs LM. Si actúas en nombre de una empresa
                            (por ejemplo, registras una barbería), aceptas estos términos tanto en tu nombre personal como en el de
                            la empresa.
                        </p>
                    </Section>

                    {/* 2. Descripción del servicio */}
                    <Section icon={Scissors} title="2. Descripción del Servicio">
                        <p>BarberOs LM es una plataforma de software como servicio (SaaS) que ofrece:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong className="text-white">Para Clientes:</strong> Buscar barberías, ver perfiles, agendar citas y gestionar su historial de visitas.</li>
                            <li><strong className="text-white">Para Barberos:</strong> Administrar su agenda personal, ver citas asignadas y gestionar su perfil profesional.</li>
                            <li><strong className="text-white">Para Propietarios:</strong> Administrar su barbería completa: barberos, servicios, citas, ingresos, campañas de marketing y comunicación con clientes.</li>
                            <li><strong className="text-white">Widget de Reservas:</strong> Los propietarios pueden integrar un widget público en sus sitios web para recibir reservas de clientes externos.</li>
                        </ul>
                        <p className="text-sm text-zinc-500">
                            BarberOs LM puede agregar, modificar o discontinuar funciones de la plataforma con previo aviso a los usuarios activos.
                        </p>
                    </Section>

                    {/* 3. Cuentas */}
                    <Section icon={Scale} title="3. Cuentas de Usuario">
                        <p>Para usar BarberOs LM debes:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Tener al menos <strong className="text-white">18 años de edad</strong> (o la mayoría de edad en tu país)</li>
                            <li>Proporcionar información veraz, precisa y actualizada al registrarte</li>
                            <li>Mantener la confidencialidad de tu contraseña y no compartirla con terceros</li>
                            <li>Notificarnos inmediatamente si detectas uso no autorizado de tu cuenta</li>
                        </ul>
                        <p>
                            Eres responsable de todas las actividades que ocurran bajo tu cuenta.
                            BarberOs LM no será responsable de pérdidas derivadas del uso no autorizado de tu cuenta
                            si no nos notificaste oportunamente.
                        </p>
                        <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 text-sm">
                            <strong className="text-white block mb-1">Un usuario por cuenta</strong>
                            <p className="text-zinc-500">
                                Cada cuenta de usuario es personal e intransferible. El uso compartido de cuentas entre múltiples
                                personas está prohibido, a menos que se trate de la cuenta de propietario para administrar una barbería.
                            </p>
                        </div>
                    </Section>

                    {/* 4. Planes y pagos */}
                    <Section icon={CreditCard} title="4. Planes de Suscripción y Pagos">
                        <p>BarberOs LM ofrece diferentes planes de acceso:</p>
                        <div className="space-y-3">
                            {[
                                { plan: 'Plan Gratuito (Free)', desc: 'Funciones básicas con anuncios de Google AdSense. Sin costo.' },
                                { plan: 'Plan Básico', desc: 'Funciones intermedias con publicidad reducida. Pago mensual.' },
                                { plan: 'Plan Pro', desc: 'Funciones avanzadas sin publicidad. Hasta 3 barberos. Pago mensual.' },
                                { plan: 'Plan Premium', desc: 'Acceso completo a todas las funciones. Hasta 6 barberos y soporte prioritario.' },
                            ].map((p) => (
                                <div key={p.plan} className="flex gap-3 p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-sm">
                                    <span className="text-amber-400 font-bold flex-shrink-0">✓</span>
                                    <div>
                                        <strong className="text-white">{p.plan}:</strong>
                                        <span className="text-zinc-400"> {p.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="font-semibold text-zinc-300 mt-2">Condiciones de pago:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Los pagos se procesan a través de <strong className="text-white">Mercado Pago</strong>. BarberOs LM no almacena datos de tarjetas.</li>
                            <li>Los precios están expresados en <strong className="text-white">Pesos Mexicanos (MXN)</strong> salvo indicación contraria.</li>
                            <li>La suscripción se renueva automáticamente cada mes, a menos que la canceles antes de la fecha de renovación.</li>
                            <li>Los precios pueden cambiar con previo aviso de 30 días. Los cambios aplican al siguiente ciclo de facturación.</li>
                            <li>Los tokens de activación son de uso único y no son reembolsables una vez activados en una cuenta.</li>
                        </ul>
                    </Section>

                    {/* 5. Política de reembolsos */}
                    <Section icon={RefreshCw} title="5. Política de Reembolsos">
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                            <p className="text-blue-200 text-sm leading-relaxed">
                                Entendemos que pueden surgir situaciones inesperadas. A continuación nuestra política:
                            </p>
                        </div>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>
                                <strong className="text-white">Primeros 7 días:</strong> Si experimentas un problema técnico grave que
                                imposibilite el uso de la plataforma y no podemos resolverlo en 72 horas hábiles, ofrecemos reembolso
                                completo del periodo no utilizado.
                            </li>
                            <li>
                                <strong className="text-white">Después de 7 días:</strong> No se ofrecen reembolsos por cancelaciones
                                de suscripción. Tu plan seguirá activo hasta el final del periodo pagado.
                            </li>
                            <li>
                                <strong className="text-white">Cargos duplicados o errores:</strong> Si detectas un cargo incorrecto,
                                contáctanos en un plazo de 15 días. Procesaremos el reembolso en 5–10 días hábiles.
                            </li>
                            <li>
                                <strong className="text-white">Tokens de activación:</strong> No son reembolsables una vez aplicados a una cuenta.
                            </li>
                        </ul>
                        <p className="text-sm">
                            Para solicitar un reembolso: <a href="mailto:barberosfive@gmail.com" className="text-amber-400 hover:underline">barberosfive@gmail.com</a>{' '}
                            con asunto "Solicitud de Reembolso".
                        </p>
                    </Section>

                    {/* 6. Conducta del usuario */}
                    <Section icon={Ban} title="6. Conducta Prohibida">
                        <p>Al usar BarberOs LM, te comprometes a NO:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Proporcionar información falsa al crear tu cuenta o tu barbería</li>
                            <li>Suplantar la identidad de otra persona o empresa</li>
                            <li>Compartir contenido ilegal, ofensivo, discriminatorio o de acoso</li>
                            <li>Intentar acceder a cuentas o datos de otros usuarios sin autorización</li>
                            <li>Usar la plataforma para actividades fraudulentas o engañosas con clientes</li>
                            <li>Realizar ingeniería inversa, descompilar o intentar obtener el código fuente de la plataforma</li>
                            <li>Usar scripts automatizados o bots para interactuar con la plataforma</li>
                            <li>Revender o sublicenciar el acceso a la plataforma a terceros sin autorización</li>
                            <li>Interferir con la operación normal de los servidores o la infraestructura de BarberOs LM</li>
                        </ul>
                        <p className="text-sm text-zinc-500">
                            El incumplimiento de estas reglas puede resultar en la suspensión o eliminación permanente de tu cuenta,
                            sin reembolso y sin previo aviso en casos graves.
                        </p>
                    </Section>

                    {/* 7. Contenido */}
                    <Section icon={FileCheck} title="7. Contenido y Propiedad Intelectual">
                        <p>
                            <strong className="text-white">Tu contenido:</strong> Cualquier información que subas a la plataforma (fotos de perfil, descripciones,
                            imágenes de la barbería) sigue siendo de tu propiedad. Al subirla, nos otorgas una licencia no exclusiva
                            para mostrarla en la plataforma con el propósito de prestar el servicio.
                        </p>
                        <p>
                            <strong className="text-white">Nuestro contenido:</strong> El diseño, código, marca, logotipos y funcionalidades de BarberOs LM
                            son propiedad exclusiva de BarberOs LM y están protegidos por derechos de autor y otras leyes de
                            propiedad intelectual.
                        </p>
                        <p>
                            <strong className="text-white">Contenido de campañas publicitarias:</strong> Los propietarios que creen campañas de marketing
                            dentro de la plataforma son responsables de que el contenido sea legal y no infrinja derechos de terceros.
                        </p>
                    </Section>

                    {/* 8. Publicidad */}
                    <Section icon={Globe} title="8. Publicidad (Google AdSense)">
                        <p>
                            Los usuarios con planes <strong className="text-white">gratuito o básico</strong> verán anuncios de
                            <strong className="text-white"> Google AdSense</strong> en ciertas secciones de la plataforma.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Los anuncios son gestionados por Google y siguen sus propias políticas de contenido</li>
                            <li>BarberOs LM no controla el contenido exacto de los anuncios de Google</li>
                            <li>No debes hacer clic en los anuncios de forma artificial ni incentivar a otros a hacerlo</li>
                            <li>Para eliminar los anuncios, actualiza tu plan a Pro o Premium</li>
                        </ul>
                    </Section>

                    {/* 9. Limitación de responsabilidad */}
                    <Section icon={AlertCircle} title="9. Limitación de Responsabilidad">
                        <p>
                            BarberOs LM es una plataforma tecnológica de intermediación. No somos responsables de:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>La calidad o ejecución de los servicios de barbería prestados a través de la plataforma</li>
                            <li>Disputas entre clientes y barberías respecto a servicios, citas o pagos directos</li>
                            <li>Daños causados por uso incorrecto de la plataforma por parte del usuario</li>
                            <li>Interrupciones del servicio causadas por mantenimiento, ataques o fallas de terceros</li>
                            <li>Pérdida de datos no respaldados por el usuario</li>
                        </ul>
                        <p>
                            En ningún caso la responsabilidad total de BarberOs LM hacia ti excederá el monto pagado
                            por tu suscripción en los últimos 3 meses.
                        </p>
                    </Section>

                    {/* 10. Terminación */}
                    <Section icon={Gavel} title="10. Terminación de la Cuenta">
                        <p>
                            <strong className="text-white">Por tu parte:</strong> Puedes eliminar tu cuenta en cualquier momento desde
                            la sección de Ajustes dentro de la plataforma o escribiéndonos al correo de soporte.
                        </p>
                        <p>
                            <strong className="text-white">Por nuestra parte:</strong> Podemos suspender o terminar tu cuenta si:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Violas estos Términos de Uso</li>
                            <li>Detectamos actividad fraudulenta o abusiva</li>
                            <li>Tu suscripción de pago está vencida y no se resuelve en 7 días</li>
                            <li>Así lo requiere la ley o una orden judicial</li>
                        </ul>
                        <p className="text-sm text-zinc-500">
                            Tras la eliminación de la cuenta, algunos datos pueden conservarse según lo indicado en nuestra Política de Privacidad.
                        </p>
                    </Section>

                    {/* 11. Jurisdicción */}
                    <Section icon={Scale} title="11. Ley Aplicable y Jurisdicción">
                        <p>
                            Estos Términos se rigen por las leyes de los <strong className="text-white">Estados Unidos Mexicanos</strong>.
                            Cualquier disputa que surja de estos términos será sometida a la jurisdicción de los tribunales competentes
                            de la Ciudad de México, México.
                        </p>
                        <p>
                            Si alguna cláusula de estos términos es declarada inválida, el resto de los términos seguirá vigente en su totalidad.
                        </p>
                    </Section>

                    {/* 12. Modificaciones */}
                    <Section icon={RefreshCw} title="12. Modificaciones a los Términos">
                        <p>
                            Podemos actualizar estos Términos y Condiciones en cualquier momento. Si los cambios son significativos,
                            te notificaremos con al menos <strong className="text-white">15 días de anticipación</strong> por correo
                            electrónico o mediante un aviso en la plataforma.
                        </p>
                        <p>
                            El uso continuado de BarberOs LM después de la fecha efectiva de los cambios constituyerá tu aceptación
                            de los nuevos términos. Si no estás de acuerdo, debes dejar de usar la plataforma antes de esa fecha.
                        </p>
                    </Section>

                    {/* Contacto */}
                    <section className="rounded-2xl bg-zinc-900/50 p-8 border border-white/5">
                        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <Scale className="h-5 w-5 text-amber-500" />
                            Contacto Legal
                        </h2>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Para cualquier duda, requerimiento legal o consulta sobre estos Términos y Condiciones:
                        </p>
                        <div className="space-y-2">
                            <a href="mailto:barberosfive@gmail.com" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold transition-colors">
                                📧 barberosfive@gmail.com
                            </a>
                            <Link to="/contact" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors">
                                📋 Formulario de contacto →
                            </Link>
                        </div>
                        <p className="text-xs text-zinc-600 mt-4">
                            Al usar BarberOs LM también declaras haber leído y aceptado nuestra{' '}
                            <Link to="/privacy" className="text-zinc-400 hover:text-white underline">Política de Privacidad</Link>.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
