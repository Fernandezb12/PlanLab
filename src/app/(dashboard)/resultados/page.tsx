import { Card } from "@/components/ui/card";
import { results } from "@/data/mock";

export default function ResultadosPage() {
  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Resultados</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((item) => (
          <Card key={item.id}>
            <p className="text-sm text-slate-500">{item.metric}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
            <p className="mt-1 text-sm text-emerald-600">{item.trend}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
