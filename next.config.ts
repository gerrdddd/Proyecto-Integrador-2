import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El adapter de MariaDB usa módulos nativos de Node: no debe empaquetarse.
  serverExternalPackages: ["mariadb", "@prisma/adapter-mariadb"],
};

export default nextConfig;
