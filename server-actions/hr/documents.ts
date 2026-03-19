"use server";

import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Get employee documents
export async function getEmployeeDocuments(employeeId: string) {
    const rows = await query(
        `SELECT * FROM employee_documents WHERE employee_id = ? ORDER BY uploaded_at DESC`,
        [employeeId]
    );
    return rows as any[];
}

// Upload employee document
export async function uploadEmployeeDocument(formData: FormData) {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { error: 'Unauthorized' };

    const employeeId = formData.get('employee_id') as string;
    const file = formData.get('file') as File;
    const documentType = formData.get('document_type') as string;
    const notes = formData.get('notes') as string || '';

    if (!file || !employeeId) return { error: 'Missing file or employee ID' };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'hr', employeeId);
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if exists
    }

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadDir, fileName);
    const dbPath = `/uploads/hr/${employeeId}/${fileName}`;

    await writeFile(filePath, buffer);

    const id = crypto.randomUUID();
    await query(`
        INSERT INTO employee_documents(id, employee_id, document_type, document_name, file_path, file_size, uploaded_by, notes)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, employeeId, documentType, file.name, dbPath, file.size, currentUser.id, notes]);

    return { success: true };
}

// Delete employee document
export async function deleteEmployeeDocument(documentId: string) {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { error: 'Unauthorized' };

    try {
        // Fetch document to get file path
        const [doc] = await query(`SELECT file_path FROM employee_documents WHERE id = ?`, [documentId]) as any[];

        if (doc) {
            const { deleteUploadedFile } = await import('@/lib/file-storage');
            await deleteUploadedFile(doc.file_path);
        }

        await query(`DELETE FROM employee_documents WHERE id = ?`, [documentId]);
        return { success: true };
    } catch (e: any) {
        console.error("Delete Document Error:", e);
        return { error: 'Failed to delete document' };
    }
}
