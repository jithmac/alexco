"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <ToastProvider>
            {toasts.map(function (toastProps: any) {
                return <ToastWithTimer key={toastProps.id} {...toastProps} dismiss={dismiss} />
            })}
            <ToastViewport />
        </ToastProvider>
    )
}

function ToastWithTimer({ id, title, description, action, duration, dismiss, ...props }: any) {
    useEffect(() => {
        const d = duration || 3000; // Default 3 seconds
        if (d === Infinity) return;

        const timer = setTimeout(() => {
            dismiss(id);
        }, d);

        return () => clearTimeout(timer);
    }, [id, duration, dismiss]);

    return (
        <Toast {...props}>
            <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                    <ToastDescription>{description}</ToastDescription>
                )}
            </div>
            {action}
            <ToastClose onClick={() => dismiss(id)} />
        </Toast>
    )
}
