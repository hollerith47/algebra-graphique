import ErrorContainer from "@/components/ErrorContainer";

type Props = {
    error: string | null
}

export default function Header({error}:Props) {
    return (
        <header className="mb-8">
            <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Построение графиков функций</h1>
                    <p className="text-slate-600 mt-1">Визуализация математических функций y = f(x)</p>
                </div>
            </div>

            {error && (
                <ErrorContainer error={error} />
            )}
        </header>
    );
}