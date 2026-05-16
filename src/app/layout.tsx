import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildSiteMetadata } from "@/features/public/seo";
import { prisma } from "@/server/db/prisma";
import "./globals.css";

const fallbackMetadata: Metadata = {
  title: "Like Zhizhi",
  description: "情侣纪念站"
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await prisma.siteSetting.findUnique({ where: { id: "site" } });

  return site ? buildSiteMetadata(site) : fallbackMetadata;
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
