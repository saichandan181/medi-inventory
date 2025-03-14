
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Line, Pie } from "recharts";
import { BarChart, LineChart, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const Analytics = () => {
  // Sample data for charts
  const monthlySalesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
  ];

  const categoryData = [
    { name: 'Antibiotics', value: 35 },
    { name: 'Analgesics', value: 25 },
    { name: 'Antihistamines', value: 15 },
    { name: 'Antidiabetics', value: 10 },
    { name: 'Respiratory', value: 8 },
    { name: 'Cardiovascular', value: 7 },
  ];

  const stockTrendData = [
    { name: 'Jan', stock: 120, reorder: 40 },
    { name: 'Feb', stock: 90, reorder: 40 },
    { name: 'Mar', stock: 170, reorder: 40 },
    { name: 'Apr', stock: 130, reorder: 40 },
    { name: 'May', stock: 60, reorder: 40 },
    { name: 'Jun', stock: 80, reorder: 40 },
    { name: 'Jul', stock: 150, reorder: 40 },
  ];

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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>Distribution of medicines by category</CardDescription>
          </CardHeader>
          <CardContent>
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Level Trends</CardTitle>
          <CardDescription>Stock level trends over time with reorder level</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Analytics;
