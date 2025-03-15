
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Line, Pie } from "recharts";
import { BarChart, LineChart, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

const Analytics = () => {
  const [monthlySalesData, setMonthlySalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [stockTrendData, setStockTrendData] = useState([]);

  // Fetch monthly sales data
  const { data: salesData, isLoading: isSalesLoading } = useQuery({
    queryKey: ['monthlySales'],
    queryFn: async () => {
      // Get current date
      const now = new Date();
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 7); // 7 months ago
      
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_date, grand_total')
        .gte('invoice_date', startDate.toISOString())
        .order('invoice_date');
      
      if (error) throw error;
      
      // Process data by month
      const monthlyData = data.reduce((acc, item) => {
        const date = new Date(item.invoice_date);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })}`;
        
        if (!acc[monthYear]) {
          acc[monthYear] = { name: monthYear, sales: 0 };
        }
        
        acc[monthYear].sales += item.grand_total;
        return acc;
      }, {});
      
      return Object.values(monthlyData);
    }
  });

  // Fetch category distribution data
  const { data: medicineCategories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['medicineCategories'],
    queryFn: async () => {
      // Get medicines with their categories
      const { data: medicines, error } = await supabase
        .from('medicines')
        .select('category, stock_quantity');
      
      if (error) throw error;
      
      // Group by category
      const categories = medicines.reduce((acc, medicine) => {
        const category = medicine.category || 'Uncategorized';
        
        if (!acc[category]) {
          acc[category] = { name: category, value: 0 };
        }
        
        acc[category].value += medicine.stock_quantity;
        return acc;
      }, {});
      
      return Object.values(categories);
    }
  });

  // Fetch stock trend data
  const { data: transactionData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['stockTrends'],
    queryFn: async () => {
      // Get current date
      const now = new Date();
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 7); // 7 months ago
      
      // Get transactions for stock movements
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('created_at, quantity')
        .gte('created_at', startDate.toISOString())
        .order('created_at');
      
      if (error) throw error;
      
      // Get medicines for reorder levels
      const { data: medicines, error: medicineError } = await supabase
        .from('medicines')
        .select('reorder_level')
        .limit(1);
      
      if (medicineError) throw medicineError;
      
      // Calculate average reorder level
      const avgReorderLevel = medicines.length > 0 
        ? medicines.reduce((sum, med) => sum + med.reorder_level, 0) / medicines.length
        : 40; // Default if no medicines
      
      // Process data by month
      const monthlyData = transactions.reduce((acc, item) => {
        const date = new Date(item.created_at);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })}`;
        
        if (!acc[monthYear]) {
          acc[monthYear] = { name: monthYear, stock: 0, reorder: avgReorderLevel };
        }
        
        acc[monthYear].stock += item.quantity;
        return acc;
      }, {});
      
      return Object.values(monthlyData);
    }
  });
  
  // Update state when data is loaded
  useEffect(() => {
    if (salesData) {
      setMonthlySalesData(salesData);
    }
  }, [salesData]);
  
  useEffect(() => {
    if (medicineCategories) {
      setCategoryData(medicineCategories);
    }
  }, [medicineCategories]);
  
  useEffect(() => {
    if (transactionData) {
      setStockTrendData(transactionData);
    }
  }, [transactionData]);

  return (
    <MainLayout>
      <PageHeader
        title="Analytics"
        description="View inventory performance and insights"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>Sales trend over the past 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isSalesLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Loading sales data...</p>
              </div>
            ) : monthlySalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Sales']} />
                  <Legend />
                  <Bar dataKey="sales" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>Distribution of medicines by category</CardDescription>
          </CardHeader>
          <CardContent>
            {isCategoriesLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Loading category data...</p>
              </div>
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={categoryData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    fill="#8884d8"
                    label
                  />
                  <Tooltip formatter={(value) => [value, 'Units']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Level Trends</CardTitle>
          <CardDescription>Stock level trends over time with reorder level</CardDescription>
        </CardHeader>
        <CardContent>
          {isTransactionsLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">Loading stock trend data...</p>
            </div>
          ) : stockTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={stockTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stock" stroke="#4f46e5" />
                <Line type="monotone" dataKey="reorder" stroke="#ef4444" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">No stock trend data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Analytics;
