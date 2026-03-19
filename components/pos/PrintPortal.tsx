"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function PrintPortal({ children }: { children: React.ReactNode }) {
    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const el = document.createElement("div");
        el.id = "print-root";
        document.body.appendChild(el);
        setMountNode(el);

        return () => {
            if (document.body.contains(el)) {
                document.body.removeChild(el);
            }
        };
    }, []);

    if (!mountNode) return null;

    return createPortal(children, mountNode);
}
