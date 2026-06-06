import { AuthService } from './auth.service';

class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async login(req: any, res: any) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const result = await this.authService.login(email, password);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async register(req: any, res: any) {
        try {
            const { email, password, name } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ error: 'Email, password, and name are required' });
            }

            const result = await this.authService.register(email, password, name);
            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async logout(req: any, res: any) {
        try {
            const result = await this.authService.logout(req.body);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new AuthController();