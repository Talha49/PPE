import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', isLoading, children, ...props }, ref) => {
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 border-0",
        secondary: "bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 shadow-sm",
        destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
        ghost: "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900",
        outline: "border border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-700"
    };

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10 p-0 flex items-center justify-center"
    };

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});
Button.displayName = "Button";

export { Button };
