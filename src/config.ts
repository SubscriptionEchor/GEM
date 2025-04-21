const config = {
    // baseURL: 'http://localhost:8000',
    baseURL: import.meta.env.VITE_BASE_URL || "https://p3i9mdap4d.execute-api.ap-south-1.amazonaws.com/Dev",
    telegramUrl: import.meta.env.VITE_TEL_URL || "https://t.me/gem_rush_bot/game", //?startapp=refcode
};

export default config;