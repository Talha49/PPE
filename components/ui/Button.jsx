import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', isLoading, loadingText, children, ...props }, ref) => {
    const variants = {
        primary: "bg-zinc-900 hover:bg-black text-white shadow-xl shadow-zinc-200 border-0",
        secondary: "bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 shadow-sm",
        destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
        ghost: "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900",
        outline: "border border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-700",
        accent: "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-100 border-0",
        soft: "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-100"
    };

    const sizes = {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-lg font-black tracking-tight",
        icon: "h-10 w-10 p-0 flex items-center justify-center"
    };

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-500/10 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin stroke-[3]" />
                    <span>{loadingText || children}</span>
                </>
            ) : (
                children
            )}
        </button>
    );
});
Button.displayName = "Button";

export { Button };
