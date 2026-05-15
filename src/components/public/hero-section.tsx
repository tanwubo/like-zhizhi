import { Card } from "@/components/ui/card";

type Person = {
  id: string;
  displayName: string;
  bio: string;
  location: string | null;
};

export function HeroSection({
  slogan,
  description,
  people,
  stats
}: {
  slogan: string;
  description: string;
  people: Person[];
  stats: Array<{ label: string; value: string | number }>;
}) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-16">
      <div>
        <p className="mb-3 text-sm font-medium text-blush-700">{slogan}</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-6xl">
          {description}
        </h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label}>
              <p className="text-sm text-ink/55">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-blush-700">{item.value}</p>
            </Card>
          ))}
        </div>
      </div>
      <Card className="self-start">
        <p className="text-sm text-ink/55">今日主角</p>
        <div className="mt-5 grid gap-3">
          {people.map((person) => (
            <div key={person.id} className="rounded-md bg-blush-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-ink">{person.displayName}</p>
                {person.location ? <p className="text-xs text-ink/45">{person.location}</p> : null}
              </div>
              <p className="mt-1 text-sm leading-6 text-ink/60">{person.bio}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
