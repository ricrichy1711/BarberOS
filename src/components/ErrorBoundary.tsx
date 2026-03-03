import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
                    <div className="max-w-md bg-zinc-900 border border-red-500/30 p-6 rounded-2xl shadow-2xl">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-white mb-2 text-center">Algo salió mal en la aplicación</h1>
                        <p className="text-zinc-400 text-sm mb-4 text-center">
                            Hemos capturado un error crítico que impidió cargar la pantalla.
                        </p>
                        <div className="bg-black/50 p-4 rounded-xl mb-6 overflow-auto max-h-32 text-xs text-red-400 font-mono">
                            {this.state.error?.message || 'Error desconocido'}
                        </div>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                            className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition"
                        >
                            Borrar caché y recargar
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
