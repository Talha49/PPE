import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

/**
 * Pro-Level Database Manager for PPE-Vision SaaS
 * Handles Multi-tenancy and Core Entity Management
 */
class DBManager {
    constructor(dbName = 'ppe_saas') {
        this.dbName = dbName;
    }

    async getDB() {
        const client = await clientPromise;
        return client.db(this.dbName);
    }

    // --- COMPANY / ORGANIZATION MANAGEMENT ---
    
    async createCompany(companyData) {
        const db = await this.getDB();
        const doc = {
            name: companyData.name,
            createdAt: new Date(),
            settings: {
                maxCameras: 5,
                retentionDays: 30
            },
            status: 'active'
        };
        return db.collection('companies').insertOne(doc);
    }

    async getCompany(companyId) {
        const db = await this.getDB();
        return db.collection('companies').findOne({ _id: new ObjectId(companyId) });
    }

    // --- USER MANAGEMENT ---
    
    async createUser(userData) {
        const db = await this.getDB();
        const doc = {
            email: userData.email,
            password: userData.password, // Should be hashed!
            name: userData.name,
            role: userData.role || 'viewer', // admin, safety_manager, viewer
            companyId: new ObjectId(userData.companyId),
            createdAt: new Date(),
            lastLogin: null
        };
        return db.collection('users').insertOne(doc);
    }

    async getUserByEmail(email) {
        const db = await this.getDB();
        return db.collection('users').findOne({ email });
    }

    // --- SITE MANAGEMENT ---
    
    async createSite(siteData) {
        const db = await this.getDB();
        const doc = {
            name: siteData.name,
            address: siteData.address || '',
            companyId: new ObjectId(siteData.companyId),
            createdAt: new Date()
        };
        return db.collection('sites').insertOne(doc);
    }

    async getSitesByCompany(companyId) {
        const db = await this.getDB();
        return db.collection('sites').find({ companyId: new ObjectId(companyId) }).toArray();
    }

    async updateSite(siteId, siteData) {
        const db = await this.getDB();
        const update = {
            $set: {
                name: siteData.name,
                address: siteData.address,
                updatedAt: new Date()
            }
        };
        return db.collection('sites').updateOne({ _id: new ObjectId(siteId) }, update);
    }

    async deleteSite(siteId) {
        const db = await this.getDB();
        const id = new ObjectId(siteId);
        // Clean up cameras first
        await db.collection('cameras').deleteMany({ siteId: id });
        return db.collection('sites').deleteOne({ _id: id });
    }

    // --- CAMERA MANAGEMENT ---
    
    async createCamera(cameraData) {
        const db = await this.getDB();
        const doc = {
            name: cameraData.name,
            sourceType: cameraData.sourceType || 'rtsp', // rtsp, client
            streamUrl: cameraData.streamUrl || '',
            siteId: new ObjectId(cameraData.siteId),
            companyId: new ObjectId(cameraData.companyId),
            roiConfig: cameraData.roiConfig || [], // Array of zones
            status: 'online',
            createdAt: new Date()
        };
        return db.collection('cameras').insertOne(doc);
    }

    async getCamerasBySite(siteId) {
        const db = await this.getDB();
        return db.collection('cameras').find({ siteId: new ObjectId(siteId) }).toArray();
    }

    async updateCameraROI(cameraId, roiConfig) {
        const db = await this.getDB();
        return db.collection('cameras').updateOne(
            { _id: new ObjectId(cameraId) },
            { $set: { roiConfig, updatedAt: new Date() } }
        );
    }

    async updateCamera(cameraId, cameraData) {
        const db = await this.getDB();
        const update = {
            $set: {
                name: cameraData.name,
                sourceType: cameraData.sourceType,
                streamUrl: cameraData.streamUrl,
                updatedAt: new Date()
            }
        };
        return db.collection('cameras').updateOne({ _id: new ObjectId(cameraId) }, update);
    }

    async deleteCamera(cameraId) {
        const db = await this.getDB();
        return db.collection('cameras').deleteOne({ _id: new ObjectId(cameraId) });
    }

    // --- DETECTION & ANALYTICS ---

    async logIncident(incidentData) {
        const db = await this.getDB();
        const doc = {
            companyId: new ObjectId(incidentData.companyId),
            siteId: new ObjectId(incidentData.siteId),
            cameraId: new ObjectId(incidentData.cameraId),
            personId: incidentData.personId || null, // Tracking ID for habitual analysis
            type: incidentData.type, // e.g., "PPE_VIOLATION"
            object: incidentData.object, // e.g., "Person"
            zone: incidentData.zone,
            status: incidentData.status, // e.g., "VIOLATION"
            snapshot: incidentData.snapshot, // Base64 string
            duration: incidentData.duration || 0,
            timestamp: new Date(),
            createdAt: new Date()
        };
        return db.collection('incidents').insertOne(doc);
    }

    async getAnalyticsSummary(companyId, siteId = null) {
        const db = await this.getDB();
        const match = { companyId: new ObjectId(companyId) };
        if (siteId) match.siteId = new ObjectId(siteId);

        // 1. Incident Aggregation
        const incidentStats = await db.collection('incidents').aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalIncidents: { $sum: 1 },
                    criticalZones: { $addToSet: "$zone" }
                }
            }
        ]).toArray();

        // 2. Incident Trend (Grouped by Day)
        const trend = await db.collection('incidents').aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            { $limit: 7 }
        ]).toArray();

        // 3. Zone Hazard Analysis
        const zoneStats = await db.collection('incidents').aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$zone",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();

        const stats = incidentStats[0] || { totalIncidents: 0 };
        
        // 4. Recent Visual Evidence
        const recentIncidents = await db.collection('incidents')
            .find(match)
            .sort({ timestamp: -1 })
            .limit(6)
            .toArray();
        
        // --- PREDICTIVE RISK INDEX (0-100) ---
        // Weights: Incident Frequency + Zone Cluster Density
        let riskIndex = Math.min(stats.totalIncidents * 10, 100);
        
        // --- SAFETY GRADE LOGIC ---
        let grade = 'A';
        if (riskIndex > 70) grade = 'F';
        else if (riskIndex > 50) grade = 'D';
        else if (riskIndex > 30) grade = 'C';
        else if (riskIndex > 15) grade = 'B';

        // --- AUTOMATED TOOLBOX TALK GENERATOR ---
        // Business Intelligence Briefing based on primary risks
        let toolboxTalk = "Site safety is currently optimal. Maintain standard vigilance.";
        if (stats.totalIncidents > 0) {
            const topZone = zoneStats[0]?._id || "Active areas";
            const topViolation = recentIncidents[0]?.object || "PPE violations";
            toolboxTalk = `Immediate Attention Needed: We identified a cluster of ${topViolation} events primarily in the ${topZone}. Focus your morning safety brief on zone-specific enforcement and mandatory equipment checks. Site Risk Index is currently ${riskIndex}%.`;
        }

        // 5. Habitual Violator Analysis (Top 5 IDs with most incidents)
        const habitualViolators = await db.collection('incidents').aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$personId", // Assuming personId is captured in detections
                    count: { $sum: 1 },
                    lastViolation: { $max: "$timestamp" },
                    primaryViolation: { $first: "$object" }
                }
            },
            { $match: { _id: { $ne: null } } }, // Filter out null IDs
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]).toArray();

        // 6. Site-wide Ranking (Competitive Compliance)
        const siteRanking = await db.collection('incidents').aggregate([
            { $match: { companyId: new ObjectId(companyId) } },
            {
                $group: {
                    _id: "$siteId",
                    score: { $sum: 1 }
                }
            },
            { $sort: { score: 1 } } // Lower is better
        ]).toArray();

        return {
            summary: {
                totalIncidents: stats.totalIncidents,
                safetyGrade: grade,
                riskIndex: riskIndex,
                toolboxTalk: toolboxTalk,
                compliant: stats.totalIncidents === 0
            },
            trend,
            zoneStats,
            habitualViolators,
            siteRanking,
            recentIncidents 
        };
    }
}

export const dbManager = new DBManager();
