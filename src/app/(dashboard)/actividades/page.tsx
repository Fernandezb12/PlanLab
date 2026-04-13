import { Card } from "@/components/ui/card";
import { activities } from "@/data/mock";

export default function ActividadesPage() {
  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Actividades</h1>
      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{activity.name}</h2>
              <p className="text-sm text-slate-500">{activity.course}</p>
            </div>
            <p className="text-sm">Entrega: {activity.dueDate}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
