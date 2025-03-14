
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Settings } from 'lucide-react';

// Mock data for the stock chart
const stockData = [
  { name: 'Antibiotics', value: 125 },
  { name: 'Analgesics', value: 85 },
  { name: 'Antihistamines', value: 53 },
  { name: 'Antidiabetics', value: 72 },
  { name: 'Respiratory', value: 43 },
  { name: 'Cardiovascular', value: 94 },
];

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-2 border border-border rounded-md shadow-soft text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-secondary-500">
          {`${payload[0].value} units`}
        </p>
      </div>
    );
  }
  return null;
};

export const StockChart = () => {
  return (
    <div className="bg-card rounded-xl shadow-soft overflow-hidden transition-apple hover:shadow-md h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-medium">Inventory by Category</h3>
        <button className="text-muted-foreground hover:text-foreground transition-apple">
          <Settings size={16} />
        </button>
      </div>
      
      <div className="flex-1 p-4">
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
          <BarChart
            data={stockData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="var(--secondary)" 
              radius={[4, 4, 0, 0]}
              className="transition-apple"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
