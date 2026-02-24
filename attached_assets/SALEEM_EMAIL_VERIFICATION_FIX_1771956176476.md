# SALEEM - EMAIL VERIFICATION FIX
## Registration Issue Resolution for TestFlight

**Problem:** Email registration not working properly in TestFlight (iOS)

**Status:** Critical Fix Needed
**Priority:** High
**Timeline:** 2-3 days

---

## ROOT CAUSES (TestFlight Issues)

1. ❌ Email validation too strict
2. ❌ Network requests timing out (TestFlight is slow)
3. ❌ Email verification codes not sending
4. ❌ Session management issues on TestFlight environment
5. ❌ Keychain/credential storage problems
6. ❌ SSL certificate issues in TestFlight

---

## SOLUTION: Implement Robust Email Verification System

### PART 1: EMAIL VALIDATION FIX

**Current Code (Too Strict):**
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**New Code (More Flexible & Better):**
```javascript
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Validation function with feedback
function validateEmail(email) {
    // Check if empty
    if (!email || email.trim() === '') {
        return { 
            valid: false, 
            error: 'البريد الإلكتروني مطلوب | Email is required' 
        };
    }
    
    // Check length
    if (email.length > 254) {
        return { 
            valid: false, 
            error: 'البريد طويل جداً | Email too long' 
        };
    }
    
    // Check format
    if (!emailRegex.test(email.trim())) {
        return { 
            valid: false, 
            error: 'البريد الإلكتروني غير صحيح | Invalid email format' 
        };
    }
    
    // Trim and normalize
    const normalizedEmail = email.trim().toLowerCase();
    
    return { valid: true, error: null, email: normalizedEmail };
}
```

---

### PART 2: NETWORK TIMEOUT FIX (TestFlight)

**Problem:** TestFlight has slower network, requests timeout

**Solution:**
```javascript
// Set different timeouts for different environments
const API_TIMEOUT = {
    development: 5000,      // 5 seconds (local)
    testflight: 20000,      // 20 seconds (IMPORTANT: TestFlight is slow)
    production: 10000       // 10 seconds (production)
};

// Determine environment
const getEnvironment = () => {
    if (__DEV__) return 'development';
    if (window.location.hostname === 'testflight') return 'testflight';
    return 'production';
};

// API call with timeout handling
async function apiCall(endpoint, options = {}) {
    const controller = new AbortController();
    const timeout = API_TIMEOUT[getEnvironment()];
    
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeout);
    
    try {
        const response = await fetch(endpoint, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - try again | انتهت انتظار الاتصال');
        }
        
        throw error;
    }
}

// Usage:
async function registerUser(userData) {
    try {
        return await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
}
```

---

### PART 3: EMAIL VERIFICATION FLOW

#### Step 1: User Registration
```
REQUEST:
POST /api/auth/register
{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "Ahmed Al-Mulhim",
    "phone": "966501234567",
    "user_type": "patient"
}

RESPONSE (Success):
{
    "success": true,
    "user_id": "user_abc123",
    "email": "user@example.com",
    "message": "تم التسجيل بنجاح، تحقق من بريدك | Registration successful, check your email",
    "verification_required": true
}

RESPONSE (Error):
{
    "success": false,
    "error": "هذا البريد مسجل بالفعل | This email is already registered"
}
```

#### Step 2: Send Verification Code
```
Backend automatically sends email with 6-digit code:

FROM: noreply@saleem.app
TO: user@example.com
SUBJECT: Saleem - Verification Code | كود التحقق

EMAIL CONTENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
أهلاً بك في Saleem
Welcome to Saleem

رمز التحقق الخاص بك:
Your verification code:
┌─────────┐
│ 123456  │
└─────────┘

ينتهي في: 15 دقيقة
Expires in: 15 minutes

لا تشارك هذا الرمز
Don't share this code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Step 3: User Verifies Code
```
REQUEST:
POST /api/auth/verify-email
{
    "email": "user@example.com",
    "code": "123456"
}

RESPONSE (Success):
{
    "success": true,
    "message": "تم التحقق من البريد بنجاح | Email verified successfully",
    "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email_verified": true
}

RESPONSE (Error - Wrong Code):
{
    "success": false,
    "error": "رمز غير صحيح | Invalid code",
    "attempts_remaining": 3
}

RESPONSE (Error - Too Many Attempts):
{
    "success": false,
    "error": "محاولات كثيرة، حاول لاحقاً | Too many attempts, try later"
}
```

---

### PART 4: DATABASE SCHEMA

```sql
-- Users table (updated)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(50) NOT NULL, -- 'patient', 'doctor', 'teacher', etc
    profession VARCHAR(100),
    specialization VARCHAR(100),
    profile_picture_url TEXT,
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);

-- Email verification table
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(254) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    code_expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_email (email),
    INDEX idx_user_id (user_id)
);

-- Login attempts (for security)
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    ip_address VARCHAR(45),
    success BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_email_created (email, created_at)
);
```

---

### PART 5: BACKEND IMPLEMENTATION (Node.js)

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const db = require('./database'); // Your DB connection

// Email configuration (use SendGrid, AWS SES, or Mailgun)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// ==================== REGISTRATION ====================

router.post('/api/auth/register', async (req, res) => {
    const { email, password, name, phone, user_type } = req.body;
    
    try {
        // Validate email
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            return res.status(400).json({ 
                success: false,
                error: emailValidation.error 
            });
        }
        
        // Validate password
        if (!password || password.length < 8) {
            return res.status(400).json({ 
                success: false,
                error: 'Password must be at least 8 characters | كلمة المرور يجب أن تكون 8 أحرف على الأقل'
            });
        }
        
        // Validate name
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ 
                success: false,
                error: 'Name is required | الاسم مطلوب'
            });
        }
        
        // Check if email exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [emailValidation.email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ 
                success: false,
                error: 'Email already registered | هذا البريد مسجل بالفعل'
            });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);
        const userId = uuidv4();
        
        // Create user
        await db.query(
            `INSERT INTO users (id, email, password_hash, name, phone, user_type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, emailValidation.email, passwordHash, name, phone, user_type]
        );
        
        // Send verification email
        await sendVerificationCode(emailValidation.email, userId);
        
        res.json({
            success: true,
            user_id: userId,
            email: emailValidation.email,
            message: 'Registration successful, check your email | تم التسجيل بنجاح، تحقق من بريدك',
            verification_required: true
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Registration failed | فشل التسجيل'
        });
    }
});

// ==================== SEND VERIFICATION CODE ====================

async function sendVerificationCode(email, userId) {
    try {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = await bcrypt.hash(code, 12);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        // Store verification code
        await db.query(
            `INSERT INTO email_verifications (id, user_id, email, code_hash, code_expires_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [uuidv4(), userId, email, codeHash, expiresAt]
        );
        
        // Send email
        const mailOptions = {
            from: '"Saleem" <noreply@saleem.app>',
            to: email,
            subject: 'Saleem - Verification Code | كود التحقق',
            html: `
                <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
                    <h2 style="color: #ff6b9d;">أهلاً بك في Saleem</h2>
                    <h2 style="color: #ff6b9d;">Welcome to Saleem</h2>
                    
                    <p style="font-size: 16px;">رمز التحقق الخاص بك:</p>
                    <p style="font-size: 16px;">Your verification code:</p>
                    
                    <div style="background: #f5f1e8; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #ffd700; letter-spacing: 5px; margin: 0;">${code}</h1>
                    </div>
                    
                    <p style="color: #666;">ينتهي في: 15 دقيقة</p>
                    <p style="color: #666;">Expires in: 15 minutes</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="color: #999; font-size: 12px;">لا تشارك هذا الرمز مع أحد</p>
                    <p style="color: #999; font-size: 12px;">Don't share this code with anyone</p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Verification code sent to ${email}`);
        
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
}

// ==================== VERIFY EMAIL ====================

router.post('/api/auth/verify-email', async (req, res) => {
    const { email, code } = req.body;
    
    try {
        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        
        // Validate code format
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid code format | صيغة الرمز غير صحيحة'
            });
        }
        
        // Get unverified verification record
        const verification = await db.query(
            `SELECT * FROM email_verifications
             WHERE email = $1 
             AND verified_at IS NULL
             AND code_expires_at > NOW()
             AND attempts < max_attempts
             ORDER BY created_at DESC LIMIT 1`,
            [normalizedEmail]
        );
        
        if (verification.rows.length === 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Code expired or not found | الرمز منتهي الصلاحية'
            });
        }
        
        const record = verification.rows[0];
        
        // Verify code
        const codeValid = await bcrypt.compare(code, record.code_hash);
        
        if (!codeValid) {
            // Increment attempts
            await db.query(
                'UPDATE email_verifications SET attempts = attempts + 1 WHERE id = $1',
                [record.id]
            );
            
            const remainingAttempts = record.max_attempts - record.attempts - 1;
            
            return res.status(400).json({ 
                success: false,
                error: `Invalid code | رمز غير صحيح`,
                attempts_remaining: Math.max(0, remainingAttempts)
            });
        }
        
        // Mark as verified
        await db.query(
            `UPDATE email_verifications SET verified_at = NOW() WHERE id = $1`,
            [record.id]
        );
        
        // Update user
        await db.query(
            `UPDATE users SET email_verified = true, email_verified_at = NOW()
             WHERE id = $1`,
            [record.user_id]
        );
        
        // Create JWT token
        const token = jwt.sign(
            { 
                user_id: record.user_id, 
                email: normalizedEmail,
                type: 'auth'
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: 'Email verified successfully | تم التحقق بنجاح',
            auth_token: token,
            email_verified: true,
            user_id: record.user_id
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Verification failed | فشل التحقق'
        });
    }
});

// ==================== RESEND CODE ====================

router.post('/api/auth/resend-code', async (req, res) => {
    const { email } = req.body;
    
    try {
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check if user exists
        const user = await db.query(
            'SELECT id, email_verified FROM users WHERE email = $1',
            [normalizedEmail]
        );
        
        if (user.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found | لم يتم العثور على المستخدم'
            });
        }
        
        if (user.rows[0].email_verified) {
            return res.status(400).json({ 
                success: false,
                error: 'Email already verified | البريد مُتحقق منه بالفعل'
            });
        }
        
        // Delete old codes
        await db.query(
            'DELETE FROM email_verifications WHERE email = $1 AND verified_at IS NULL',
            [normalizedEmail]
        );
        
        // Send new code
        await sendVerificationCode(normalizedEmail, user.rows[0].id);
        
        res.json({
            success: true,
            message: 'Code resent | تم إعادة إرسال الرمز'
        });
        
    } catch (error) {
        console.error('Resend code error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to resend code | فشل إعادة الإرسال'
        });
    }
});

// ==================== VALIDATION FUNCTION ====================

function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!email || email.trim() === '') {
        return { valid: false, error: 'Email required | البريد مطلوب' };
    }
    if (email.length > 254) {
        return { valid: false, error: 'Email too long | البريد طويل جداً' };
    }
    if (!emailRegex.test(email.trim())) {
        return { valid: false, error: 'Invalid email format | صيغة البريد غير صحيحة' };
    }
    
    return { valid: true, email: email.trim().toLowerCase() };
}

module.exports = router;
```

---

### PART 6: FRONTEND IMPLEMENTATION (React Native)

```javascript
import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';

const RegistrationScreen = ({ navigation }) => {
    const [step, setStep] = useState('register'); // register, verify, done
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attemptsRemaining, setAttemptsRemaining] = useState(5);

    // ==================== REGISTRATION ====================
    
    const handleRegistration = async () => {
        // Clear previous error
        setError('');
        
        // Validate email
        if (!email || email.trim() === '') {
            setError('البريد الإلكتروني مطلوب');
            return;
        }
        
        if (!password || password.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }
        
        if (!name || name.trim().length < 2) {
            setError('الاسم مطلوب');
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await apiCall('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                    name: name.trim(),
                    user_type: 'patient'
                })
            });
            
            if (response.success) {
                setStep('verify');
                Alert.alert(
                    'نجح التسجيل',
                    'تحقق من بريدك للحصول على الرمز'
                );
            } else {
                setError(response.error || 'فشل التسجيل');
            }
        } catch (err) {
            setError(err.message || 'خطأ في الاتصال، حاول مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    // ==================== VERIFICATION ====================
    
    const handleVerification = async () => {
        setError('');
        
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            setError('أدخل الرمز الصحيح (6 أرقام)');
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await apiCall('/api/auth/verify-email', {
                method: 'POST',
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    code
                })
            });
            
            if (response.success) {
                setStep('done');
                
                // Save auth token
                await AsyncStorage.setItem('auth_token', response.auth_token);
                
                // Navigate to home
                setTimeout(() => {
                    navigation.navigate('Home');
                }, 1500);
            } else {
                setError(response.error);
                setAttemptsRemaining(response.attempts_remaining || 0);
            }
        } catch (err) {
            setError(err.message || 'فشل التحقق');
        } finally {
            setLoading(false);
        }
    };

    // ==================== RESEND CODE ====================
    
    const handleResendCode = async () => {
        setLoading(true);
        
        try {
            const response = await apiCall('/api/auth/resend-code', {
                method: 'POST',
                body: JSON.stringify({
                    email: email.trim().toLowerCase()
                })
            });
            
            if (response.success) {
                Alert.alert('نجح', 'تم إعادة إرسال الرمز');
                setCode('');
                setError('');
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ==================== UI ====================
    
    return (
        <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* REGISTRATION STEP */}
            {step === 'register' && (
                <View>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                        إنشاء حساب
                    </Text>
                    
                    {error ? (
                        <View style={{ backgroundColor: '#ffebee', padding: 15, borderRadius: 8, marginBottom: 15 }}>
                            <Text style={{ color: '#c62828' }}>{error}</Text>
                        </View>
                    ) : null}
                    
                    <TextInput
                        placeholder="الاسم الكامل"
                        value={name}
                        onChangeText={setName}
                        style={{ borderWidth: 1, padding: 15, marginBottom: 15, borderRadius: 8 }}
                        editable={!loading}
                    />
                    
                    <TextInput
                        placeholder="البريد الإلكتروني"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={{ borderWidth: 1, padding: 15, marginBottom: 15, borderRadius: 8 }}
                        editable={!loading}
                    />
                    
                    <TextInput
                        placeholder="كلمة المرور (8 أحرف على الأقل)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={{ borderWidth: 1, padding: 15, marginBottom: 20, borderRadius: 8 }}
                        editable={!loading}
                    />
                    
                    <TouchableOpacity
                        onPress={handleRegistration}
                        disabled={loading}
                        style={{
                            backgroundColor: '#ff6b9d',
                            padding: 15,
                            borderRadius: 8,
                            alignItems: 'center'
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                                التالي
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* VERIFICATION STEP */}
            {step === 'verify' && (
                <View>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                        تحقق من بريدك
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
                        أدخل الكود المرسل إلى: {email}
                    </Text>
                    
                    {error ? (
                        <View style={{ backgroundColor: '#ffebee', padding: 15, borderRadius: 8, marginBottom: 15 }}>
                            <Text style={{ color: '#c62828' }}>{error}</Text>
                            {attemptsRemaining > 0 && (
                                <Text style={{ color: '#d32f2f', fontSize: 12, marginTop: 5 }}>
                                    محاولات متبقية: {attemptsRemaining}
                                </Text>
                            )}
                        </View>
                    ) : null}
                    
                    <TextInput
                        placeholder="كود التحقق (6 أرقام)"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        style={{
                            borderWidth: 1,
                            padding: 15,
                            marginBottom: 15,
                            borderRadius: 8,
                            fontSize: 24,
                            textAlign: 'center',
                            letterSpacing: 10
                        }}
                        editable={!loading}
                    />
                    
                    <TouchableOpacity
                        onPress={handleVerification}
                        disabled={loading || code.length !== 6}
                        style={{
                            backgroundColor: code.length === 6 ? '#ff6b9d' : '#ccc',
                            padding: 15,
                            borderRadius: 8,
                            alignItems: 'center',
                            marginBottom: 10
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                                تحقق
                            </Text>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={handleResendCode}
                        disabled={loading}
                        style={{
                            padding: 15,
                            borderRadius: 8,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#ff6b9d'
                        }}
                    >
                        <Text style={{ color: '#ff6b9d', fontSize: 14, fontWeight: 'bold' }}>
                            أعد الإرسال
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* SUCCESS STEP */}
            {step === 'done' && (
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <Text style={{ fontSize: 50, marginBottom: 20 }}>✅</Text>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
                        تم التحقق بنجاح!
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                        جاري نقلك للصفحة الرئيسية...
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

export default RegistrationScreen;
```

---

## TESTING CHECKLIST

- [ ] Email validation accepts valid emails
- [ ] Email validation rejects invalid emails
- [ ] Registration works on TestFlight
- [ ] Registration works on production
- [ ] Verification code sends to email
- [ ] Code expires after 15 minutes
- [ ] Code is 6 digits only
- [ ] User can resend code
- [ ] Code verifies correctly
- [ ] Too many attempts blocked (5 attempts)
- [ ] Error messages bilingual (Arabic & English)
- [ ] Network timeout handled (20s for TestFlight)
- [ ] Session saved correctly
- [ ] User can log in after verification
- [ ] Old codes deleted on resend
- [ ] Email stored in lowercase
- [ ] Password hashed with bcrypt
- [ ] JWT token generated correctly
- [ ] Logout clears token

---

## DEPLOYMENT NOTES

1. **Environment Setup**
   - Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` in `.env`
   - Set `JWT_SECRET` in `.env`
   - Use SendGrid, AWS SES, or Mailgun for email

2. **Database Migration**
   - Run SQL scripts to create tables
   - Add indexes for performance
   - Backup existing data

3. **Testing**
   - Test on TestFlight (iOS)
   - Test on Android
   - Test on production
   - Test with slow network

4. **Monitoring**
   - Log all registration attempts
   - Monitor email sending failures
   - Track verification code usage
   - Alert on high failure rates

