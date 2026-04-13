import { Card } from "@/components/ui/card";
import { lessonPlans } from "@/data/mock";

export default function PlanesPage() {
  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Planes</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {lessonPlans.map((plan) => (
          <Card key={plan.id}>
            <p className="text-sm text-slate-500">{plan.grade}</p>
            <h2 className="mt-2 text-lg font-semibold">{plan.title}</h2>
            <p className="mt-3 text-sm">Estado: {plan.status}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
