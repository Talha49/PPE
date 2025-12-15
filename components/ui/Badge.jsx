import React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
    const variants = {
        default: "border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-800",
        success: "border-transparent bg-green-100 text-green-700 hover:bg-green-200",
        destructive: "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
        warning: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200",
        outline: "text-zinc-500 border-zinc-200"
    };

    return (
        <div
            ref={ref}
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    );
});
Badge.displayName = "Badge";

export { Badge };
