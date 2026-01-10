import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryChartProps {
  data: CategoryData[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6 animate-slide-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
      <h3 className="font-semibold text-lg mb-6">Gastos por Categoria</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "var(--shadow-lg)",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 mt-4">
        {data.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-muted-foreground">{category.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {formatCurrency(category.value)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({((category.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
