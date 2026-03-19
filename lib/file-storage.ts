import { unlink } from "fs/promises";
import path from "path";

/**
 * Safely deletes a file from the public/uploads directory.
 * @param url The relative URL of the file (e.g., /uploads/products/image.jpg)
 */
export async function deleteUploadedFile(url: string | null | undefined) {
    if (!url || !url.startsWith('/uploads')) {
        return;
    }

    try {
        const filePath = path.join(process.cwd(), 'public', url);
        await unlink(filePath);
        console.log(`Successfully deleted file: ${filePath}`);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn(`File not found for deletion: ${url}`);
        } else {
            console.error(`Failed to delete file ${url}:`, error.message);
        }
    }
}

/**
 * Deletes multiple files.
 * @param urls Array of relative URLs
 */
export async function deleteUploadedFiles(urls: string[]) {
    await Promise.all(urls.map(url => deleteUploadedFile(url)));
}
