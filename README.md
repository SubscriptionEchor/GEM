# GEN
GEM Token Mining Telegram Mini App

## Overview
The GEM Token Mining Telegram Mini App allows users to mine GEM tokens through timed sessions within Telegram. It leverages Telegram's native authentication and offers upgrades and a referral system to enhance mining rates and rewards.

## Key Features

### User Authentication
- Uses Telegram's native authentication.
- No separate signup required; user data pulled from Telegram profile.
- Users identified by Telegram ID for tracking mining and rewards.

### Core Mining Mechanics
- **Mining Sessions**:
  - Manually started 8-hour sessions.
  - Mining halts after 8 hours until restarted.
  - Continues in background once initiated.
  - Base mining rate: **5 GEM/hour**.
- **Mining Rate**:
  - Calculated as base rate + active upgrades.
  - Accumulated GEMs added to user balance.
  - Mining history tracked in backend.

### Upgrade System
- Upgrades temporarily boost mining rate using mined GEMs.
- Multiple upgrades stack additively.
- **Upgrade Tiers**:

| Upgrade            | Cost       | Effect         | Duration      | Visual Indicator         | Best For                     |
|--------------------|------------|----------------|---------------|--------------------------|------------------------------|
| 24-Hour Boost      | 5 GEM      | +1 GEM/hour    | 24 hours      | Bronze equipment         | New users                    |
| 3-Day Boost        | 13 GEM     | +1 GEM/hour    | 72 hours      | Silver equipment         | Regular users                |
| 7-Day Boost        | 28 GEM     | +1 GEM/hour    | 168 hours     | Gold equipment           | Committed users              |

- **Mechanics**:
  - Purchase via Upgrade screen with confirmation dialog.
  - Active upgrades show type, remaining time, and boost.
  - Visual countdown for each upgrade.
  - Upgrades expire automatically, adjusting mining rate.

### Referral System
- Two-level system: 
- First-level system: Referrer earns **25% of GEMs mined** by referred users.
- Second-level system: Referrer earns **15% of GEMs mined** by referred users.
- Tracks total referrals and GEMs earned (no individual tracking).

## UI/UX Design
- **Main Mining Screen**:
  - Hero animation reflecting mining rate.
  - Real-time counter for GEM balance, rate, and session time.
  - Prominent "Start Mining" button when inactive.
- **Upgrades Screen**:
  - Lists boosts with duration, effects, and costs.
  - Shows active upgrades with remaining time.
- **Referral Screen**:
  - Displays referral code/link, copy/share options, and stats.
- **Wallet/Stats Screen**:
  - Shows total GEMs mined, current balance, and mining history.

## Technical Requirements
- **Backend**:
  - User management via Telegram ID.
  - Tracks mining sessions, rates, GEM balances, and referrals.
  - Secure token storage and transaction logging.
- **Frontend**:
  - Smooth mining animation.
  - Responsive design for all devices.
  - Real-time progress updates.
  - Telegram Mini App API integration.
- **Data Storage**:
  - Stores user profiles, mining sessions, upgrades, referrals, and transactions.
- **Hero Animation**:
  - Visualizes mining rig with GEM generation.
  - Intensity scales with mining rate.
  - Reflects active/inactive status and equipment upgrades.

## Future Expansion
- Leaderboards for top miners/referrers.
- Additional upgrade types and events.
- Community features and promotional upgrades.
- Permanent base rate upgrades.

## Notes
- Document sourced from `GEM Token Mining Telegram Mini App - Requirements Document.pdf`.
- Stored in memory bank for reference on [date saved, e.g., April 9, 2025].
