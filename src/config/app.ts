export const appConfig = {
  name: "ReviewWall",
  tagline: "La plateforme d'avis profilés et vérifiés",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "reviewwall.fr",
  supportEmail: "support@reviewwall.fr",
  noreplyEmail: `noreply@${process.env.NEXT_PUBLIC_APP_DOMAIN ?? "reviewwall.fr"}`,

  auth: {
    callbackUrl: "/auth/callback",
    loginUrl: "/login",
    afterLoginUrl: "/dashboard",
    afterLogoutUrl: "/",
  },

  limits: {
    maxWallsPerUser: 10,
    maxReviewsPerWall: 500,
  },
} as const;
