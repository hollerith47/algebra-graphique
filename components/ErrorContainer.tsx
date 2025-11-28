type Props = {
    error: string | null
}

export default function ErrorContainer({error}:Props) {
    return (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <h3 className="text-sm font-semibold text-red-900">Ошибка</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
        </div>
    );
}