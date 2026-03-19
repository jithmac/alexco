import { useEffect, useRef } from 'react';

/**
 * Hook to detect barcode scanner input (HID Keyboard Emulation).
 * Scanners usually send characters rapidly followed by 'Enter'.
 */
export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
    const buffer = useRef<string>("");
    const lastKeyTime = useRef<number>(0);

    // configurable threshold for "rapid" input (ms)
    const TIMEOUT = 50;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();
            const isCharacter = e.key.length === 1;

            // If time between keystrokes is too long, reset buffer (it's likely manual typing)
            if (currentTime - lastKeyTime.current > TIMEOUT) {
                buffer.current = "";
            }

            lastKeyTime.current = currentTime;

            if (e.key === 'Enter') {
                if (buffer.current.length > 0) {
                    onScan(buffer.current);
                    buffer.current = "";
                    e.preventDefault(); // prevent form submission or newline
                }
            } else if (isCharacter) {
                buffer.current += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onScan]);
};
