import * as React from "react"

const TOAST_LIMIT = 1

type ToasterToast = any

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

type ActionType = {
    type: "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST"
    toast?: ToasterToast
    toastId?: string
}

let memoryState: any = { toasts: [] }
const listeners: Array<(state: any) => void> = []

function dispatch(action: ActionType) {
    switch (action.type) {
        case "ADD_TOAST":
            memoryState = {
                ...memoryState,
                toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
            }
            break
        case "UPDATE_TOAST":
            memoryState = {
                ...memoryState,
                toasts: memoryState.toasts.map((t: any) =>
                    t.id === action.toastId ? { ...t, ...action.toast } : t
                ),
            }
            break
        case "DISMISS_TOAST":
            memoryState = {
                ...memoryState,
                toasts: memoryState.toasts.map((t: any) =>
                    t.id === action.toastId || action.toastId === undefined
                        ? { ...t, open: false }
                        : t
                ),
            }
            break
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                memoryState = { ...memoryState, toasts: [] }
            } else {
                memoryState = {
                    ...memoryState,
                    toasts: memoryState.toasts.filter((t: any) => t.id !== action.toastId),
                }
            }
            break
    }

    // Notify all listeners
    listeners.forEach((listener) => {
        listener(memoryState)
    })
}

export function useToast() {
    const [state, setState] = React.useState<any>(memoryState)

    React.useEffect(() => {
        listeners.push(setState)
        return () => {
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [])

    return {
        toast: (props: any) => {
            const id = genId()
            const update = (props: any) =>
                dispatch({
                    type: "UPDATE_TOAST",
                    toastId: id,
                    toast: props,
                })
            const dismiss = () => dispatch({ type: "REMOVE_TOAST", toastId: id })

            dispatch({
                type: "ADD_TOAST",
                toast: {
                    ...props,
                    id,
                    open: true,
                    onOpenChange: (open: boolean) => {
                        if (!open) dismiss()
                    },
                },
            })

            return {
                id: id,
                dismiss,
                update,
            }
        },
        dismiss: (toastId?: string) => dispatch({ type: "REMOVE_TOAST", toastId }),
        toasts: state.toasts.filter((t: any) => t.open !== false),
    }
}

