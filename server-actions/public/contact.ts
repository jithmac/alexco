"use server";

import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

interface ContactFormData {
    firstName: string;
    lastName?: string;
    email: string;
    subject?: string;
    message: string;
}

export async function submitContactForm(data: ContactFormData) {
    try {
        if (!data.firstName || !data.email || !data.message) {
            return { success: false, error: "Please fill in all required fields." };
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return { success: false, error: "Please enter a valid email address." };
        }

        const id = uuidv4();

        await query(`
            INSERT INTO contact_messages (id, first_name, last_name, email, subject, message)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id, data.firstName, data.lastName || null, data.email, data.subject || null, data.message]);

        return { success: true };
    } catch (err: any) {
        console.error("Contact Form Submission Error:", err);
        return { success: false, error: "Failed to submit message. Please try again." };
    }
}
