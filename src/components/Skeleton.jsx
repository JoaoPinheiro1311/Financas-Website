export function Skeleton({ className, ...props }) {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200 dark:bg-slate-800 ${className}`}
            {...props}
        />
    )
}

export function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-40" />
        </div>
    )
}

export function ListSkeleton({ count = 3 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-5 w-20" />
                </div>
            ))}
        </div>
    )
}

export function LoadingSpinner({ className = "h-12 w-12", containerClassName = "flex items-center justify-center h-64" }) {
    return (
        <div className={containerClassName}>
            <div className={`relative ${className}`}>
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        </div>
    )
}
