
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type StockData = {
  name: string;
  value: number;
};

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
  const { data: stockData, isLoading } = useQuery({
    queryKey: ['stockByCategory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('category, stock_quantity');
      
      if (error) {
        console.error('Error fetching stock data:', error);
        throw error;
      }
      
      // Group by category
      const categoryStockMap = data.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        
        if (!acc[category]) {
          acc[category] = 0;
        }
        
        acc[category] += item.stock_quantity;
        return acc;
      }, {} as Record<string, number>);
      
      // Convert to array format for chart
      const chartData: StockData[] = Object.entries(categoryStockMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value) // Sort by value, largest first
        .slice(0, 6); // Limit to top 6 categories
      
      return chartData;
    }
  });

  return (
    <div className="bg-card rounded-xl shadow-soft overflow-hidden transition-apple hover:shadow-md h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-medium">Inventory by Category</h3>
        <button className="text-muted-foreground hover:text-foreground transition-apple">
          <Settings size={16} />
        </button>
      </div>
      
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading stock data...</p>
          </div>
        ) : stockData && stockData.length > 0 ? (
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
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No stock data available</p>
          </div>
        )}
      </div>
    </div>
  );
};
