import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import querystring from 'querystring'

const SECRET_KEY = process.env.SUPABASE_JWT_SECRET
const SUPABASE_SERVICE_ROLE_TOKEN = process.env.SUPABASE_SERVICE_ROLE_TOKEN
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 // 7 days

const SUPABASE_URL = "https://yfplgpkkgfjzrhvbffbv.supabase.co"


// Function to parse and validate Telegram initData
function parseTelegramInitData(initData) {
    try {
        if (!initData) {
            return null
        }
        return {
            userId: initData?.user?.id,
            startParam: initData?.start_param,
        }
        // Step 1: Parse the URL-encoded initData
        const decodedData = querystring.parse(initData)

        // Step 2: Extract the user field and parse it as JSON
        if (!decodedData.user) {
            throw new Error('User data not found in initData')
        }

        const user = JSON.parse(decodedData.user)
        const authDate = decodedData.auth_date
        const receivedHash = decodedData.hash
        const startParam = decodedData.start_param || '' // Extract start_param (might contain referral code)

        // Step 3: Extract user parameters
        const userData = {
            userId: user.id,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            username: user.username || '',
            languageCode: user.language_code || '',
            isPremium: user.is_premium || false,
            authDate: parseInt(authDate, 10),
            startParam: startParam // Add start_param to userData
        }

        // Step 4: Verify the hash to ensure data authenticity
        if (BOT_TOKEN && receivedHash) {
            const isValid = verifyInitData(decodedData, receivedHash)
            if (!isValid) {
                throw new Error('Invalid initData hash')
            }
        }

        return userData
    } catch (error) {
        console.error('Error parsing initData:', error.message)
        return null
    }
}

// // Function to verify the hash in initData
// function verifyInitData(decodedData, receivedHash) {
//     try {
//         // Create the secret key from the bot token
//         const secretKey = crypto
//             .createHmac('sha256', 'WebAppData')
//             .update(BOT_TOKEN)
//             .digest()

//         // Sort and prepare the data for hash verification (exclude the hash itself)
//         const dataToVerify = Object.keys(decodedData)
//             .filter((key) => key !== 'hash')
//             .sort()
//             .map((key) => `${key}=${decodedData[key]}`)
//             .join('\n')

//         // Compute the HMAC-SHA256 hash
//         const computedHash = crypto
//             .createHmac('sha256', secretKey)
//             .update(dataToVerify)
//             .digest('hex')

//         // Compare computed hash with received hash
//         return computedHash === receivedHash
//     } catch (error) {
//         console.error('Error verifying hash:', error.message)
//         return false
//     }
// }

// Function to generate a random referral code
function generateReferralCode(length = 8) {
    const chars = 'ABCDEFGHKMNPQRSTUVWXY3456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// // Process referral if user was referred
// async function processReferral(userId, referralCode) {
//     if (!referralCode) return null

//     try {
//         // Check if referral code exists and get the referrer's ID
//         const { data: referrer, error: referrerError } = await supabase
//             .from('user')
//             .select('id')
//             .eq('referral_code', referralCode)
//             .single()

//         if (referrerError || !referrer) {
//             console.error('Invalid referral code or referrer not found:', referralCode)
//             return null
//         }

//         // Don't allow self-referrals
//         if (referrer.id === userId) {
//             console.error('Self-referral not allowed')
//             return null
//         }

//         // Update the user with the referrer's ID (not the code)
//         const { error: updateError } = await supabase
//             .from('user')
//             .update({ referred_by: referrer.id })
//             .eq('id', userId)

//         if (updateError) {
//             console.error('Error updating referral information:', updateError)
//             return null
//         }

//         // Get current referral count
//         const { data: currentReferrer, error: fetchError } = await supabase
//             .from('user')
//             .select('total_referrals')
//             .eq('id', referrer.id)
//             .single()

//         if (fetchError) {
//             console.error('Error fetching referrer data:', fetchError)
//             return referrer.id // Return ID but don't update count if can't fetch
//         }

//         // Increment total_referrals for the referrer
//         const { error: incrementError } = await supabase
//             .from('user')
//             .update({
//                 total_referrals: (currentReferrer.total_referrals || 0) + 1
//             })
//             .eq('id', referrer.id)

//         if (incrementError) {
//             console.error('Error incrementing referral count:', incrementError)
//         }

//         return referrer.id
//     } catch (error) {
//         console.error('Error processing referral:', error)
//         return null
//     }
// }

// Initialize Supabase client with service role token
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_TOKEN)

export const handler = async (event) => {
    try {
        // Parse the request body
        let requestBody
        if (typeof event === 'string') {
            requestBody = JSON.parse(event)
        } else {
            requestBody = event
        }

        const parsedData = parseTelegramInitData(requestBody?.initData)
        let referralCode = requestBody?.referralCode || parsedData?.startParam

        if (!parsedData) {
            return {
                statusCode: 400,
                body: JSON.stringify({ detail: 'Invalid init data' }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                }
            }
        }

        const userId = parseInt(parsedData.userId || 1) // Default to 1 for testing
        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ detail: 'User ID is missing in init data' }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                }
            }
        }

        // Check if user exists
        const { data: existingUser, error: userError } = await supabase
            .from('user')
            .select('id, referral_code, referred_by')
            .eq('id', userId)
            .single()

        if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found" error
            throw userError
        }

        // Process referral ID if a referral code was provided
        let referrerId = null
        if (referralCode) {
            // Get the referrer's ID from their referral code
            const { data: referrer, error: referrerError } = await supabase
                .from('user')
                .select('id')
                .eq('referral_code', String(referralCode).trim())
                .single()

            if (!referrerError && referrer) {
                referrerId = referrer.id
            }
        }

        // If user doesn't exist, create them
        if (!existingUser) {
            const newReferralCode = generateReferralCode()

            // Create the new user
            const { error: createError } = await supabase
                .from('user')
                .insert([
                    {
                        id: userId,
                        referral_code: newReferralCode,
                        referred_by: referrerId
                    }
                ])

            if (createError) throw createError

            // If user was referred, increment the referrer's total_referrals
            if (referrerId) {
                // Get current referral count
                const { data: currentReferrer, error: fetchError } = await supabase
                    .from('user')
                    .select('total_referrals')
                    .eq('id', referrerId)
                    .single()

                if (!fetchError && currentReferrer) {
                    // Increment total_referrals for the referrer
                    const { error: updateError } = await supabase
                        .from('user')
                        .update({
                            total_referrals: (currentReferrer.total_referrals || 0) + 1
                        })
                        .eq('id', referrerId)

                    if (updateError) {
                        console.error('Error incrementing referral count:', updateError)
                    }
                }
            }
        }
        // else if (!existingUser.referred_by && referralCode) {
        // If user exists but wasn't previously referred, process the referral
        // This will update the user's referred_by field and increment the referrer's total_referrals
        // await processReferral(userId, referralCode)
        // }

        const token = jwt.sign(
            {
                sub: String(userId),
                role: 'authenticated',
            },
            SECRET_KEY,
            { algorithm: 'HS256', expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` }
        )

        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Login successful',
                token: token,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
        }
        return { token }
    } catch (error) {
        console.error('Error handling request:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ detail: 'Internal server error' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            }
        }
    }
}