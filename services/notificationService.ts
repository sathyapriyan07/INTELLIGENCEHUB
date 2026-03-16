
import emailjs from '@emailjs/browser';

/**
 * Email Notification Service
 * Integrated with EmailJS for production-ready frontend-only email delivery.
 */

export type NotificationType = 'LOGIN_SUCCESS' | 'PROFILE_UPDATE' | 'VERIFY_EMAIL';

interface EmailTemplate {
  subject: string;
  body: string;
}

const templates: Record<NotificationType, (data: any) => EmailTemplate> = {
  LOGIN_SUCCESS: (data) => ({
    subject: `Security Alert: New Login to NoteForge AI`,
    body: `Hello ${data.name},\n\nWe detected a successful login to your account.\n\nTime: ${new Date().toLocaleString()}\n\nIf this was not you, please reset your password immediately.`
  }),
  PROFILE_UPDATE: (data) => ({
    subject: `NoteForge Profile Updated`,
    body: `Hello ${data.name},\n\nYour profile information has been successfully updated.\n\nUpdated Fields: ${data.fields?.join(', ') || 'General Profile Data'}\n\nIf you did not authorize these changes, contact support.`
  }),
  VERIFY_EMAIL: (data) => ({
    subject: `Verify Your NoteForge AI Account`,
    body: `Hello ${data.name},\n\nWelcome to NoteForge AI! To access your academic suite, please verify your email using the link below:\n\nVerification Token: ${data.token}\n\nThis link expires in 30 minutes.\n\nNote: This is a secure automated message.`
  })
};

export const sendNotificationEmail = async (type: NotificationType, userData: any): Promise<boolean> => {
  const content = templates[type](userData);
  
  console.log(`%c[NOTIFICATION SYSTEM] Processing ${type} for ${userData.email}`, "color: #4f46e5; font-weight: bold;");

  const templateParams = {
    to_name: userData.name,
    to_email: userData.email,
    subject: content.subject,
    message: content.body,
    timestamp: new Date().toLocaleString()
  };

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = type === 'VERIFY_EMAIL' 
    ? process.env.EMAILJS_TEMPLATE_ID_VERIFY 
    : (type === 'LOGIN_SUCCESS' ? process.env.EMAILJS_TEMPLATE_ID_LOGIN : process.env.EMAILJS_TEMPLATE_ID_PROFILE);
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (serviceId && templateId && publicKey) {
    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      return true;
    } catch (error) {
      console.error("[EmailJS] Delivery Failed:", error);
      return false;
    }
  } else {
    // SIMULATION FALLBACK
    await new Promise(resolve => setTimeout(resolve, 800));
    console.warn("[MOCK SMTP] Simulating delivery for: " + type);
    console.log(`%cTo: ${userData.email}\nSubject: ${content.subject}`, "color: #64748b; font-style: italic;");
    console.log(content.body);
    return true;
  }
};
