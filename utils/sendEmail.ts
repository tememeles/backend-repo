import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// Create a Nodemailer transporter
const transporter: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
// Function to send email
const mailerSender= async (
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> => {
  try {
    const mailOptions: SendMailOptions = {
      from: process.env.APP_USER,
      to,
      subject,
      html: htmlContent, // Use 'html' for HTML content
    };
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
    return true;
  } catch (error: unknown) {
    console.error("Error sending email: ", error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};
export default mailerSender;
export { mailerSender as sendEmail };









