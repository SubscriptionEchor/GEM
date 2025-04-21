GEM Token Mining Telegram Mini App - Requirements Document
Overview
A Telegram Mini App that allows users to mine GEM tokens through timed mining sessions, with options to upgrade mining rates and refer friends for additional rewards. The app leverages Telegram's native user authentication and provides an engaging mining experience with visual feedback.

User Authentication

- Leverages Telegram's native authentication
- No separate signup required - user data pulled from Telegram profile
- User identified by Telegram ID for tracking mining sessions and rewards

Core Mining Mechanics
Mining Sessions

- Users manually start 8-hour mining sessions
- After 8 hours, mining automatically halts until manually restarted
- Mining continues in the background once initiated
- Clear visual indicator when a mining session has ended
- Base mining rate: 5 GEM per hour

Mining Rate Calculation

- Simple hourly rate calculation (base rate + any active upgrades)
- Small, manageable numbers (e.g., 5-20 GEM per hour)
- Accumulated GEMs added to user's balance
- Mining history tracked in the backend

Upgrade System
Mining Rate Upgrades
Core Concept:

- Upgrades temporarily increase the base mining rate (5 GEM/hour)
- Each upgrade adds a specific GEM/hour boost for a set duration
- Multiple upgrades can stack additively (e.g., +1 and +2 could combine for +3 GEM/hour)
- Upgrades are purchased using mined GEM tokens
- Timer begins immediately upon purchase

Upgrade Tiers:

1. 24-Hour Mining Boost (1 Day)

- Cost: 5 GEM tokens
- Effect: +1 GEM/hour (increases mining from 5 to 6 GEM/hour)
- Duration: 24 hours (spans up to 3 complete mining sessions)
- Visual indicator: Bronze mining equipment enhancement
- Best for: New users looking for quick progress

2. 3-Day Mining Boost

- Cost: 13 GEM tokens (slight discount compared to buying three 1-day boosts)
- Effect: +1 GEM/hour (increases mining from 5 to 6 GEM/hour)
- Duration: 72 hours (spans up to 9 complete mining sessions)
- Visual indicator: Silver mining equipment enhancement
- Best for: Regular users who log in daily

3. 7-Day Mining Boost (1 Week)

- Cost: 28 GEM tokens (significant discount compared to buying seven 1-day boosts)
- Effect: +1 GEM/hour (increases mining from 5 to 6 GEM/hour)
- Duration: 168 hours (spans up to 21 complete mining sessions)
- Visual indicator: Gold mining equipment enhancement
- Best for: Committed users seeking maximum efficiency

Upgrade Implementation Details:

- Purchase Flow:
- User navigates to Upgrade screen
- Selects desired upgrade duration
- Confirmation dialog displays cost, effect, and duration
- If user has sufficient GEM balance, upgrade is applied immediately
- Visual and text confirmation of successful upgrade
- Active Upgrades Visualization:
- Dedicated section on Upgrade screen shows all active upgrades
- Each active upgrade displays:
- Upgrade type/duration
- Remaining time (hours )
- Mining rate boost provided
- Visual countdown or progress bar for each active upgrade
- Upgrade Stacking Mechanics:
- Multiple instances of the same upgrade can be stacked (e.g., two 24-hour boosts)
- Different duration upgrades can be combined (e.g., 24-hour + 7-day)
- Total mining rate boost is the sum of all active upgrades plus base rate
- Example: Base (5) + 24-hour boost (+1) + 7-day boost (+1) = 7 GEM/hour
- Upgrade Expiration:
- Upgrades expire automatically after their duration
- No notification required when upgrades expire
- Mining rate automatically adjusts when upgrades expire
- Expired upgrades are removed from the active upgrades list

Referral System
Basic Structure

- Single-level referral system
- Referrer earns $2 \%$ of all GEMs mined by referred users
- Personalized referral code/link for sharing
- No notification system required (native to Telegram)

Tracking

- Total number of referrals
- Total GEMs earned from referrals
- No individual referral performance tracking

UI/UX Design
Main Mining Screen

- Hero animation showing active mining with GEM tokens being generated
- Animation intensity reflects current mining rate
- Real-time counter showing:
- Current GEM balance
- Mining rate (GEMs/hour)
- Remaining time in current mining session
- Prominent "Start Mining" button when inactive
- Mining session status clearly visible

Upgrades Screen

- List of available boosts with clear duration and effects
- Cost of each upgrade displayed prominently
- Visual representation of active upgrades with remaining time
- Confirmation dialog before purchasing upgrades

Referral Screen

- Personalized referral code/link
- Copy button and direct share to Telegram contacts
- Statistics on referrals and rewards
- Explanation of referral benefits

Wallet/Stats Screen

- Total GEMs mined to date
- Current GEM balance
- Mining history summary
- Achievement badges (optional for future development)

Technical Requirements
Backend Requirements

- User account management linked to Telegram ID
- Mining calculation engine that tracks:
- Active mining sessions
- Mining rates based on upgrades
- GEM token balances
- Referral tracking system
- Secure token storage and transaction logging

 Though Requirements

- Smooth, engaging mining animation
- Responsive design that works on all devices
- Real-time updates of mining progress
- Integration with Telegram Mini App APIs
- Offline status handling

Data Storage

- User profiles
- Mining session data
- Upgrade purchase history
- Referral relationships
- Token transaction logs

Hero Animation Specifications

- Digital mining rig visualization that shows GEM tokens being generated
- Visual effects increase in intensity with higher mining rates
- Animation should indicate active/inactive mining status
- Counter showing real-time token accumulation
- Mining equipment visually upgrades based on active boosts
- Animation should work smoothly on mobile devices

Future Expansion Possibilities

- Leaderboards for top miners and referrers
- Additional upgrade types
- Special mining events
- Community features
- Higher tier upgrades with greater mining rate boosts
- Special limited-time promotional upgrades
- Permanent base rate upgrades


Stacking multiple boosts of the same type reduces their effectiveness:
- First boost: 100% effective
- Second boost: 90% effective
- Third boost: 80% effective
- Additional boosts: -10% each (minimum 50%)

# Supabase project name is "Gem" , org name is "Echor tech"

---
 user table:  with useid(telegram id), balance, created_at, updated_at
 - referral code(his referral code) string
    - referred_by (referral code of the user who referred him)(can be null)
# i dont know where to store mining status(like is the mining session active or not, how many hours are left, etc)
# idont need mining history
- boosts table
    id
    user_id
    start_time
    end_time
    boost_type # 24-hour, 3-day, 7-day
    status # active, expired