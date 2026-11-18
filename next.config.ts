import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // En-têtes de sécurité envoyés avec toutes les pages du site
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Interdit d'afficher le site à l'intérieur d'une autre page (piège au clic)
          { key: "X-Frame-Options", value: "DENY" },
          // Le navigateur ne devine pas le type d'un fichier : il respecte celui annoncé
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Les autres sites ne voient que l'adresse du site, pas la page précise d'où vient le visiteur
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Le site n'utilise ni caméra, ni micro, ni position
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;