import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        name: string;
        isVerified: boolean;
    };
}
declare class UserController {
    getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    changePassword(req: AuthenticatedRequest, res: Response): Promise<void>;
    getSessions(req: AuthenticatedRequest, res: Response): Promise<void>;
    revokeSession(req: AuthenticatedRequest, res: Response): Promise<void>;
    revokeAllSessions(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void>;
}
declare const _default: UserController;
export default _default;
//# sourceMappingURL=user.controller.d.ts.map