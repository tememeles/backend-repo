import { Request, Response } from 'express';
import Contact from "../models/Contact.js";
import { sendEmail } from "../utils/sendEmail.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface ContactRequestBody {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

export const createContact = async (req: Request<Record<string, never>, Record<string, never>, ContactRequestBody>, res: Response): Promise<void> => {
    try {
        const { name, email, phone, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            res.status(400).json({ message: "Name, email, and message are required." });
            return;
        }

        // Email format validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: "Please provide a valid email address." });
            return;
        }

        // Message length validation
        if (message.length < 10) {
            res.status(400).json({ message: "Message must be at least 10 characters long." });
            return;
        }

        if (message.length > 1000) {
            res.status(400).json({ message: "Message cannot exceed 1000 characters." });
            return;
        }

        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();

        // Send notification email to admin
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
            try {
                await sendEmail(
                    adminEmail,
                    "New Contact Message Received",
                    `
                    <h3>New Contact Message</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone || "N/A"}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                    <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
                    `
                );
            } catch (emailError) {
                console.error("Failed to send admin notification:", emailError);
                // Continue execution - don't fail the contact creation
            }
        }

        // Send auto-reply confirmation email to user
        try {
            await sendEmail(
                email,
                "Thank you for contacting Kapee Shop - We'll be in touch soon!",
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">Kapee Shop</h1>
                        <p style="color: #666; margin: 5px 0;">Premium E-commerce Experience</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
                        <h2 style="margin: 0 0 15px 0; font-size: 24px;">Thank You, ${name}!</h2>
                        <p style="margin: 0; font-size: 16px; opacity: 0.9;">We've received your message and appreciate you reaching out to us.</p>
                    </div>

                    <div style="background: #f9fafb; padding: 25px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
                        <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">📋 Your Message Summary:</h3>
                        <p style="margin: 5px 0; color: #6b7280;"><strong>Name:</strong> ${name}</p>
                        <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 5px 0; color: #6b7280;"><strong>Phone:</strong> ${phone || "Not provided"}</p>
                        <div style="margin: 15px 0 5px 0; color: #6b7280;"><strong>Message:</strong></div>
                        <div style="background: white; padding: 15px; border-radius: 5px; color: #374151; line-height: 1.6;">
                            ${message}
                        </div>
                    </div>

                    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border: 1px solid #d1fae5; margin-bottom: 25px;">
                        <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">✅ What happens next?</h3>
                        <ul style="color: #047857; margin: 0; padding-left: 20px; line-height: 1.8;">
                            <li>Our support team will review your message within 24 hours</li>
                            <li>We'll respond to your inquiry via email</li>
                            <li>For urgent matters, feel free to call us directly</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin-bottom: 25px;">
                        <p style="color: #6b7280; margin: 0 0 15px 0;">While you wait, explore our latest products:</p>
                        <a href="#" style="background: #f59e0b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Browse Products</a>
                    </div>

                    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                            Need immediate assistance? Contact us at:
                        </p>
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">
                            📧 ${adminEmail || "support@kapeeshop.com"} | 📞 0795469743
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
                            © 2025 Kapee Shop. All rights reserved.
                        </p>
                    </div>
                </div>
                `
            );
        } catch (emailError) {
            console.error("Failed to send user confirmation email:", emailError);
            // Continue execution - don't fail the contact creation
        }

        res.status(201).json({ 
            message: "Contact message sent successfully! Check your email for confirmation.", 
            contact: {
                id: newContact._id,
                name: newContact.name,
                email: newContact.email,
                phone: newContact.phone,
                message: newContact.message,
                createdAt: newContact.createdAt
            }
        });

    } catch (error) {
        console.error("Error creating contact:", error);
        res.status(500).json({ 
            message: "Failed to send contact message. Please try again later." 
        });
    }
};

// Get all contacts (admin only)
export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ message: "Failed to fetch contacts" });
    }
};

// Get contact by ID
export const getContactById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            res.status(404).json({ message: "Contact not found" });
            return;
        }
        res.json(contact);
    } catch (error) {
        console.error("Error fetching contact:", error);
        res.status(500).json({ message: "Failed to fetch contact" });
    }
};

// Delete contact
export const deleteContact = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            res.status(404).json({ message: "Contact not found" });
            return;
        }
        res.json({ message: "Contact deleted successfully" });
    } catch (error) {
        console.error("Error deleting contact:", error);
        res.status(500).json({ message: "Failed to delete contact" });
    }
};

// Search contacts
export const searchContacts = async (req: Request<Record<string, never>, Record<string, never>, Record<string, never>, { q: string }>, res: Response): Promise<void> => {
    try {
        const { q } = req.query;
        if (!q) {
            res.status(400).json({ message: "Search query is required" });
            return;
        }

        const contacts = await Contact.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { message: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        console.error("Error searching contacts:", error);
        res.status(500).json({ message: "Failed to search contacts" });
    }
};