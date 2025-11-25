import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express.js';

const prisma = new PrismaClient();

export const listUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                status: true,
                lastSignedIn: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const banUser = async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { status: 'BANNED' },
        });
        res.json({ message: 'User banned successfully', user });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ error: 'Failed to ban user' });
    }
};

export const unbanUser = async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' },
        });
        res.json({ message: 'User unbanned successfully', user });
    } catch (error) {
        console.error('Unban user error:', error);
        res.status(500).json({ error: 'Failed to unban user' });
    }
};

export const getSystemStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const activeRules = await prisma.rule.count();

        // Calculate daily API requests (GenerationLogs created today)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const dailyApiRequests = await prisma.generationLog.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                },
            },
        });

        res.json({
            totalUsers,
            activeRules,
            dailyApiRequests,
            serverStatus: '99.9%', // Hardcoded for now, or could be real health check
        });
    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({ error: 'Failed to fetch system stats' });
    }
};
