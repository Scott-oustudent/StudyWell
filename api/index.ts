import { Router } from 'express';
import { Collection, Db } from 'mongodb';
import { connectToDatabase } from '../lib/mongodb';
import * as devData from '../data/userData';
import * as liveData from '../data/liveData';
import { User, UserRole } from '../types';

const router = Router();

let db: Db;

// Middleware to connect to DB
router.use(async (req, res, next) => {
    if (!db) {
        const { db: connectedDb } = await connectToDatabase();
        db = connectedDb;
    }
    next();
});

// Seed database if a collection is empty
const seedCollection = async (collection: Collection, data: any[]) => {
    const count = await collection.countDocuments();
    if (count === 0) {
        console.log(`Seeding ${collection.collectionName}...`);
        // We need to convert string IDs to a format Mongo might expect, or ensure they're just strings.
        // For this app, string IDs are fine.
        await collection.insertMany(data);
    }
};

// --- API ROUTES ---

// Bootstrap data route
router.get('/data', async (req, res) => {
    const isSandbox = req.query.sandbox === 'true';

    if (isSandbox) {
        // Return hardcoded sandbox data
        return res.json({
            users: liveData.initialUsers,
            staffMessages: liveData.initialStaffMessages,
            notifications: liveData.initialNotifications,
            auditLog: liveData.initialAuditLog,
            knowledgeBaseArticles: liveData.initialKnowledgeBaseArticles,
            forumCategories: liveData.initialForumCategories,
            forumPosts: liveData.initialForumPosts,
            schedulerEvents: liveData.initialSchedulerEvents,
            wellnessVideos: liveData.initialWellnessVideos,
            meditationTracks: liveData.initialMeditationTracks,
            wellnessArticles: liveData.initialWellnessArticles,
            savedCitations: [], // Sandbox has no saved citations
        });
    }

    // Return live data from DB, seeding if necessary
    try {
        // Seed dev data if collections are empty
        await seedCollection(db.collection('users'), devData.initialUsers);
        // ... seed other collections as needed ...

        const [
            users, staffMessages, notifications, auditLog, knowledgeBaseArticles,
            forumCategories, forumPosts, schedulerEvents, wellnessVideos,
            meditationTracks, wellnessArticles, savedCitations
        ] = await Promise.all([
            db.collection('users').find({}).toArray(),
            db.collection('staffMessages').find({}).toArray(),
            db.collection('notifications').find({}).toArray(),
            db.collection('auditLog').find({}).toArray(),
            db.collection('knowledgeBase').find({}).toArray(),
            db.collection('forumCategories').find({}).toArray(),
            db.collection('forumPosts').find({}).toArray(),
            db.collection('schedulerEvents').find({}).toArray(),
            db.collection('wellnessVideos').find({}).toArray(),
            db.collection('meditationTracks').find({}).toArray(),
            db.collection('wellnessArticles').find({}).toArray(),
            db.collection('savedCitations').find({}).toArray(),
        ]);
        
        res.json({
            users, staffMessages, notifications, auditLog, knowledgeBaseArticles,
            forumCategories, forumPosts, schedulerEvents, wellnessVideos,
            meditationTracks, wellnessArticles, savedCitations
        });
    } catch (error) {
        console.error("Failed to fetch data from DB", error);
        res.status(500).json({ message: "Failed to fetch data from database" });
    }
});

// Generic PUT endpoint to update a whole collection
const createCollectionUpdater = (collectionName: string) => {
    return async (req: any, res: any) => {
        if (req.query.sandbox === 'true') {
            return res.json(req.body.data); // In sandbox, just echo back
        }
        try {
            const collection = db.collection(collectionName);
            await collection.deleteMany({}); // Clear the collection
            if (req.body.data && req.body.data.length > 0) {
                 await collection.insertMany(req.body.data); // Insert new data
            }
            res.json(req.body.data);
        } catch (error) {
            res.status(500).json({ message: `Failed to update ${collectionName}` });
        }
    };
};

router.put('/users', createCollectionUpdater('users'));
router.put('/staff-messages', createCollectionUpdater('staffMessages'));
router.put('/notifications', createCollectionUpdater('notifications'));
router.put('/scheduler-events', createCollectionUpdater('schedulerEvents'));
router.put('/saved-citations', createCollectionUpdater('savedCitations'));
router.put('/forum-posts', createCollectionUpdater('forumPosts'));
router.put('/forum-categories', createCollectionUpdater('forumCategories'));
router.put('/wellness/videos', createCollectionUpdater('wellnessVideos'));
router.put('/wellness/tracks', createCollectionUpdater('meditationTracks'));
router.put('/wellness/articles', createCollectionUpdater('wellnessArticles'));

// Specific POST/PUT for individual items or complex actions
router.post('/auth/login', async (req, res) => {
    const { email, isSandboxMode } = req.body;
    
    let user;
    if (isSandboxMode) {
        user = liveData.initialUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    } else {
        user = await db.collection('users').findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    }
    
    if (user) {
        res.json({ message: 'Login successful', user });
    } else {
        res.status(404).json({ message: 'No user found with that email. Please sign up.' });
    }
});

router.post('/users', async (req, res) => {
    const { name, email, institution } = req.body;
    
    const existingUser = await db.collection('users').findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if(existingUser) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const newUser: Partial<User> = {
        id: String(Date.now()),
        name,
        email,
        institution,
        role: UserRole.STUDENT,
        // Add other default fields...
    };

    const result = await db.collection('users').insertOne(newUser);
    const user = await db.collection('users').findOne({_id: result.insertedId});
    
    res.status(201).json({ message: 'User created', user });
});

// Add other specific endpoints (e.g., for notifications, audit log) here as needed...

export default router;
