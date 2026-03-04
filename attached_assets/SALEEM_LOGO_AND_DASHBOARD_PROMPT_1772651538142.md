# SALEEM - LOGO & ADMIN DASHBOARD
## Complete Replit Development Prompt

**Status:** Ready for Implementation
**Timeline:** 2-3 days
**Priority:** High
**Scope:** Logo fix + Admin Dashboard

---

## 🎨 PART 1: FIX SALEEM LOGO TEXT CROPPING

### **Problem:**
The word "Saleem" (English) and "سليم" (Arabic) text is cropped at the top on the Welcome/Onboarding screen.

### **Location:**
- File: `client/screens/RoleSelectScreen.tsx` or similar welcome/onboarding screen
- Look for the title section with "Saleem" and "سليم"

### **Solution:**

**Find this code:**
```javascript
<View style={styles.titleContainer}>
  <Text style={styles.title}>Saleem</Text>
  <Text style={styles.subtitle}>سليم</Text>
</View>
```

**Update the styles to add padding:**
```javascript
const styles = StyleSheet.create({
  titleContainer: {
    paddingTop: 30,           // ← ADD THIS
    paddingBottom: 20,        // ← ADD THIS
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
    lineHeight: 40,           // ← ADD THIS
  },
  subtitle: {
    fontSize: 24,
    color: '#7EC972',
    fontWeight: '600',
    lineHeight: 32,           // ← ADD THIS
  },
});
```

**OR if using inline styles:**
```javascript
<View style={{
  paddingTop: 30,
  paddingBottom: 20,
  alignItems: 'center',
  justifyContent: 'center',
}}>
  <Text style={{
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
    lineHeight: 40,
  }}>
    Saleem
  </Text>
  <Text style={{
    fontSize: 24,
    color: '#7EC972',
    fontWeight: '600',
    lineHeight: 32,
  }}>
    سليم
  </Text>
</View>
```

**Key changes:**
- ✅ `paddingTop: 30` - Add space above
- ✅ `lineHeight: 40` / `lineHeight: 32` - Prevent text clipping
- ✅ Proper vertical spacing

---

## 📊 PART 2: ADMIN DASHBOARD

### **Dashboard Type:** Web-based React dashboard
### **Access:** `/admin` route (protected)
### **Authentication:** Admin login only

---

## 🔐 STEP 1: CREATE ADMIN AUTHENTICATION

### **File:** `server/routes/admin.ts` (NEW)

```typescript
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// Hardcoded admin credentials (update with your own)
const ADMIN_EMAIL = 'admin@saleem.app';
const ADMIN_PASSWORD_HASH = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'changeme123', 12);

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!passwordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { admin: true, email },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token,
    message: 'Admin logged in successfully'
  });
});

// Middleware to verify admin
export const verifyAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded.admin) {
      return res.status(401).json({ error: 'Not an admin' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default router;
```

---

## 📈 STEP 2: CREATE ADMIN API ENDPOINTS

### **File:** `server/routes/adminAnalytics.ts` (NEW)

```typescript
import express from 'express';
import { verifyAdmin } from './admin';
import db from '../db';

const router = express.Router();

// Dashboard Stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    // Total users
    const totalUsers = await db.query('SELECT COUNT(*) FROM users');
    
    // Active users today
    const activeToday = await db.query(
      `SELECT COUNT(DISTINCT user_id) FROM messages 
       WHERE created_at >= NOW() - INTERVAL 1 DAY`
    );

    // New signups today
    const newToday = await db.query(
      `SELECT COUNT(*) FROM users 
       WHERE created_at >= NOW() - INTERVAL 1 DAY`
    );

    // Professionals count
    const professionals = await db.query(
      `SELECT COUNT(*) FROM users WHERE user_type = 'professional'`
    );

    // Clients count
    const clients = await db.query(
      `SELECT COUNT(*) FROM users WHERE user_type = 'client'`
    );

    // Messages today
    const messagesToday = await db.query(
      `SELECT COUNT(*) FROM messages 
       WHERE created_at >= NOW() - INTERVAL 1 DAY`
    );

    res.json({
      totalUsers: totalUsers.rows[0].count,
      activeToday: activeToday.rows[0].count,
      newToday: newToday.rows[0].count,
      professionals: professionals.rows[0].count,
      clients: clients.rows[0].count,
      messagesToday: messagesToday.rows[0].count,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// User Growth Chart (last 30 days)
router.get('/user-growth', verifyAdmin, async (req, res) => {
  try {
    const growth = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users
       WHERE created_at >= NOW() - INTERVAL 30 DAY
       GROUP BY DATE(created_at)
       ORDER BY date`
    );

    res.json(growth.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch growth data' });
  }
});

// All Users List
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await db.query(
      `SELECT id, name, email, user_type, created_at, 
              (SELECT COUNT(*) FROM connections WHERE professional_id = users.id) as client_count
       FROM users
       ORDER BY created_at DESC
       LIMIT 100`
    );

    res.json(users.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Block User
router.post('/users/:userId/block', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    await db.query(
      'UPDATE users SET is_blocked = true WHERE id = $1',
      [userId]
    );

    res.json({ success: true, message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock User
router.post('/users/:userId/unblock', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    await db.query(
      'UPDATE users SET is_blocked = false WHERE id = $1',
      [userId]
    );

    res.json({ success: true, message: 'User unblocked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Professional Stats
router.get('/professional-analytics', verifyAdmin, async (req, res) => {
  try {
    const pros = await db.query(
      `SELECT 
        u.id,
        u.name,
        COUNT(DISTINCT c.client_id) as active_clients,
        COUNT(m.id) as total_messages,
        AVG(EXTRACT(EPOCH FROM (m.created_at - m.created_at))) as avg_response_time
       FROM users u
       LEFT JOIN connections c ON u.id = c.professional_id
       LEFT JOIN messages m ON u.id = m.sender_id
       WHERE u.user_type = 'professional'
       GROUP BY u.id, u.name
       ORDER BY active_clients DESC`
    );

    res.json(pros.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Support Tickets
router.get('/support-tickets', verifyAdmin, async (req, res) => {
  try {
    const tickets = await db.query(
      `SELECT id, user_id, subject, message, status, created_at
       FROM support_tickets
       ORDER BY created_at DESC`
    );

    res.json(tickets.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

export default router;
```

---

## 🎨 STEP 3: CREATE ADMIN DASHBOARD FRONTEND

### **File:** `client/screens/AdminDashboard.tsx` (NEW)

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { apiRequest } from '../lib/query-client';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, growthRes] = await Promise.all([
        apiRequest('GET', '/admin/stats'),
        apiRequest('GET', '/admin/users'),
        apiRequest('GET', '/admin/user-growth'),
      ]);

      setStats(statsRes);
      setUsers(usersRes);
      setGrowth(growthRes);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saleem Admin Dashboard</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'dashboard' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('dashboard')}
        >
          <Text style={styles.tabText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'users' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('users')}
        >
          <Text style={styles.tabText}>Users</Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard Tab */}
      {selectedTab === 'dashboard' && (
        <View style={styles.content}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              color="#003366"
            />
            <StatCard
              title="Active Today"
              value={stats?.activeToday || 0}
              color="#7EC972"
            />
            <StatCard
              title="New Today"
              value={stats?.newToday || 0}
              color="#FF6B9D"
            />
            <StatCard
              title="Professionals"
              value={stats?.professionals || 0}
              color="#FFA500"
            />
            <StatCard
              title="Clients"
              value={stats?.clients || 0}
              color="#87CEEB"
            />
            <StatCard
              title="Messages Today"
              value={stats?.messagesToday || 0}
              color="#00AA00"
            />
          </View>

          {/* Charts */}
          {growth.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>User Growth (30 Days)</Text>
              <LineChart
                data={{
                  labels: growth.map((g) => g.date.slice(5)),
                  datasets: [
                    {
                      data: growth.map((g) => g.count),
                    },
                  ],
                }}
                width={350}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: () => '#003366',
                  strokeWidth: 2,
                }}
              />
            </View>
          )}
        </View>
      )}

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <View style={styles.content}>
          <Text style={styles.usersTitle}>All Users</Text>
          {users.map((user) => (
            <UserCard key={user.id} user={user} onRefresh={fetchData} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// Stat Card Component
function StatCard({ title, value, color }: any) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

// User Card Component
function UserCard({ user, onRefresh }: any) {
  const [blocked, setBlocked] = useState(false);

  const handleBlock = async () => {
    try {
      await apiRequest('POST', `/admin/users/${user.id}/block`);
      setBlocked(true);
      Alert.alert('Success', 'User blocked');
      onRefresh();
    } catch (error) {
      Alert.alert('Error', 'Failed to block user');
    }
  };

  return (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userType}>
          {user.user_type === 'professional' ? '👨‍⚕️ Professional' : '👥 Client'}
        </Text>
        {user.user_type === 'professional' && (
          <Text style={styles.clientCount}>
            {user.client_count} active clients
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.blockBtn, blocked && styles.blockedBtn]}
        onPress={handleBlock}
      >
        <Text style={styles.blockBtnText}>
          {blocked ? 'Blocked' : 'Block'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#003366',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshBtn: {
    backgroundColor: '#7EC972',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#003366',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
  },
  content: {
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#003366',
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#003366',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  userType: {
    fontSize: 12,
    color: '#7EC972',
    marginTop: 5,
  },
  clientCount: {
    fontSize: 11,
    color: '#FF6B9D',
    marginTop: 5,
  },
  blockBtn: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  blockedBtn: {
    backgroundColor: '#999',
  },
  blockBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
```

---

## 🔗 STEP 4: ADD ROUTES TO SERVER

### **File:** `server/index.ts` (UPDATE)

Add these lines:

```typescript
import adminRoutes from './routes/admin';
import adminAnalyticsRoutes from './routes/adminAnalytics';

// Add these routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminAnalyticsRoutes);
```

---

## 🗄️ STEP 5: UPDATE DATABASE SCHEMA

### **Add columns to users table:**

```sql
ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT false;
```

### **Create support_tickets table (if not exists):**

```sql
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🛠️ BUILD CHECKLIST

Before building, verify:

- [ ] Logo padding fixed in RoleSelectScreen.tsx
- [ ] Admin routes added to server/index.ts
- [ ] Admin authentication configured
- [ ] AdminDashboard.tsx created in client/screens
- [ ] Database schema updated (is_blocked column)
- [ ] Support tickets table created
- [ ] All imports are correct
- [ ] No syntax errors

---

## 📦 IMPLEMENTATION STEPS

### **Step 1: Fix Logo**
1. Open `client/screens/RoleSelectScreen.tsx`
2. Add padding and lineHeight to title styles
3. Test on device

### **Step 2: Backend Setup**
1. Create `server/routes/admin.ts`
2. Create `server/routes/adminAnalytics.ts`
3. Update `server/index.ts` to include routes
4. Update database schema

### **Step 3: Frontend Dashboard**
1. Create `client/screens/AdminDashboard.tsx`
2. Add admin navigation/routing
3. Connect to backend APIs

### **Step 4: Test**
1. Test admin login
2. Verify stats loading
3. Test user blocking
4. Check charts rendering

### **Step 5: Deploy**
1. Commit all changes
2. Push to GitHub
3. Build with EAS: `eas build --platform ios --auto-submit`
4. Test in TestFlight

---

## 📝 ENVIRONMENT VARIABLES

Make sure `.env` has:

```
EXPO_PUBLIC_DOMAIN=saleemchat.replit.app
JWT_SECRET=your_secret_key
ADMIN_PASSWORD=secure_password_123
```

---

## 🔐 ADMIN ACCESS

**Login Endpoint:** `POST /api/admin/login`

```json
{
  "email": "admin@saleem.app",
  "password": "your_password"
}
```

**Returns:**
```json
{
  "success": true,
  "token": "jwt_token_here"
}
```

---

## 📊 ADMIN DASHBOARD FEATURES

✅ **Stats:**
- Total users
- Active users today
- New signups
- Professional count
- Client count
- Messages today

✅ **Charts:**
- User growth (30 days)
- Daily active users

✅ **User Management:**
- View all users
- Block/unblock users
- See professional client count
- Quick actions

✅ **Analytics:**
- Professional performance
- Message volume
- Activity tracking

---

## 🚀 NEXT STEPS

After this builds successfully:

1. Create invite code management
2. Add professional verification flow
3. Add support ticket system
4. Add more analytics

---

**You're ready to build!** 🎉

All code is provided. Just copy/paste into Replit and commit! 🚀

