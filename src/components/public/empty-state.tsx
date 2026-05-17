import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed border-[#ead4da] bg-white/86 px-6 py-12 text-center shadow-[0_14px_36px_rgba(36,48,71,0.05)]">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-[#1d1d1f]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-2 text-sm leading-6 text-[#6e6e73]">{description}</CardContent>
    </Card>
  );
}
