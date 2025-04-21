const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()
// const { retrieveLaunchParams } = require('@telegram-apps/sdk')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = process.env.PORT || 8000
const SECRET_KEY = process.env.SUPABASE_JWT_SECRET
const SUPABASE_SERVICE_ROLE_TOKEN = process.env.SUPABASE_SERVICE_ROLE_TOKEN
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 // 7 days

const SUPABASE_URL = "https://yfplgpkkgfjzrhvbffbv.supabase.co"

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.json({
        status: true,
        message: 'Server is running',
    })
})

app.get('/health', (req, res) => {
    res.json({
        status: true,
        message: 'Health check passed',
    })
})

// Function to parse and validate Telegram initData
function parseTelegramInitData(initData) {
    try {
        // Step 1: Parse the URL-encoded initData
        const decodedData = querystring.parse(initData);

        // Step 2: Extract the user field and parse it as JSON
        if (!decodedData.user) {
            throw new Error('User data not found in initData');
        }

        const user = JSON.parse(decodedData.user);
        const authDate = decodedData.auth_date;
        const receivedHash = decodedData.hash;

        // Step 3: Extract user parameters
        const userData = {
            userId: user.id,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            username: user.username || '',
            languageCode: user.language_code || '',
            isPremium: user.is_premium || false,
            authDate: parseInt(authDate, 10),
        };

        // Step 4: (Optional) Verify the hash to ensure data authenticity
        if (BOT_TOKEN && receivedHash) {
            const isValid = verifyInitData(decodedData, receivedHash);
            if (!isValid) {
                throw new Error('Invalid initData hash');
            }
        }

        return userData;
    } catch (error) {
        console.error('Error parsing initData:', error.message);
        return null;
    }
}

// Function to verify the hash in initData
function verifyInitData(decodedData, receivedHash) {
    try {
        // Create the secret key from the bot token
        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(BOT_TOKEN)
            .digest();

        // Sort and prepare the data for hash verification (exclude the hash itself)
        const dataToVerify = Object.keys(decodedData)
            .filter((key) => key !== 'hash')
            .sort()
            .map((key) => `${key}=${decodedData[key]}`)
            .join('\n');

        // Compute the HMAC-SHA256 hash
        const computedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataToVerify)
            .digest('hex');

        // Compare computed hash with received hash
        return computedHash === receivedHash;
    } catch (error) {
        console.error('Error verifying hash:', error.message);
        return false;
    }
}

// Function to generate a random referral code
function generateReferralCode(length = 8) {
    const chars = 'ABCDEFGHKMNPQRSTUVWXY3456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// Initialize Supabase client with service role token
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_TOKEN)

app.post('/login', async (req, res) => {
    try {
        const parsedData = parseTelegramInitData(req.body.initData)

        // if (!parsedData) {
        //     return res.status(400).json({ detail: 'Invalid init data' })
        // }

        const userId = parseInt(parsedData?.userId || 1) // Default to 1 for testing
        if (!userId) {
            return res.status(400).json({ detail: 'User ID is missing in init data' })
        }

        // Check if user exists
        const { data: existingUser, error: userError } = await supabase
            .from('user')
            .select('id')
            .eq('id', userId)
            .single()

        if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found" error
            throw userError
        }

        // If user doesn't exist, create them
        if (!existingUser) {
            const referralCode = generateReferralCode()
            const { error: createError } = await supabase
                .from('user')
                .insert([
                    {
                        id: userId,
                        referral_code: referralCode,
                        // Extract referral code from parameters if user was referred
                        referred_by: req.body.referral_code || null
                    }
                ])

            if (createError) throw createError
        }

        const token = jwt.sign(
            {
                sub: String(userId),
                role: 'authenticated',
            },
            SECRET_KEY,
            { algorithm: 'HS256', expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` }
        )

        res.json({ token })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ detail: 'Error during login process', error: error.message })
    }
})

// Catch-all 404 route
app.use((req, res) => {
    console.log(`404 - Not Found - ${req.method} ${req.originalUrl}`)
    res.status(404).json({
        status: false,
        message: 'Route not found',
    })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error(`500 - Server Error - ${req.method} ${req.originalUrl} - ${err.message}`)
    res.status(500).json({
        status: false,
        message: 'Internal server error',
        // error: err.message,
    })
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port http://localhost:${PORT}`)
    console.log(`Server is running on http://0.0.0.0:${PORT}`)
    console.log(`Server is accessible on all network interfaces`)
})