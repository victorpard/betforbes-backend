interface SendEmailOptions {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}
declare class EmailService {
    private transporter;
    private isConfigured;
    constructor();
    private setupTransporter;
    sendEmail(options: SendEmailOptions): Promise<boolean>;
    sendVerificationEmail(email: string, name: string, token: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=email.d.ts.map