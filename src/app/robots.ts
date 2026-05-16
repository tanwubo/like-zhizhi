import { buildRobots, getSiteBaseUrl } from "@/features/public/seo";

export default function robots() {
  return buildRobots(getSiteBaseUrl());
}
