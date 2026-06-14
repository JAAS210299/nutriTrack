export declare class MailService {
    private transporter;
    sendVerification(email: string, token: string): Promise<void>;
    sendPasswordReset(email: string, token: string): Promise<void>;
}
