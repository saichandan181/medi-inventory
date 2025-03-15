
import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PeriodType, SalesReportData, getSalesReport } from "@/services/reportService";
import { useQuery } from "@tanstack/react-query";

const SalesReports = () => {
  const [periodType, setPeriodType] = useState<PeriodType>('daily');
  const [date, setDate] = useState<Date>(new Date());
  
  // Calculate start and end dates for the query
  const { startDate, endDate } = useMemo(() => {
    const end = new Date(date);
    
    let start = new Date(date);
    if (periodType === 'daily') {
      // Last 30 days
      start.setDate(end.getDate() - 30);
    } else if (periodType === 'monthly') {
      // Last 12 months
      start.setMonth(end.getMonth() - 12);
    } else {
      // Last 5 years
      start.setFullYear(end.getFullYear() - 5);
    }
    
    return { startDate: start, endDate: end };
  }, [date, periodType]);

  // Fetch sales report data
  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['salesReport', periodType, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => getSalesReport(periodType, startDate, endDate)
  });

  // Format period labels for display
  const formatPeriodLabel = (period: string) => {
    if (periodType === 'daily') {
      return format(new Date(period), 'dd MMM');
    } else if (periodType === 'monthly') {
      const [year, month] = period.split('-');
      return format(new Date(Number(year), Number(month) - 1, 1), 'MMM yyyy');
    } else {
      return period;
    }
  };

  // Format data for chart display
  const chartData = useMemo(() => {
    if (!reportData) return [];
    
    return reportData.map(item => ({
      ...item,
      period: formatPeriodLabel(item.period),
      totalSales: Number(item.totalSales.toFixed(2))
    }));
  }, [reportData, periodType]);

  // Calculate summary stats
  const totalSales = useMemo(() => {
    if (!reportData) return 0;
    return reportData.reduce((sum, item) => sum + item.totalSales, 0);
  }, [reportData]);

  const totalItems = useMemo(() => {
    if (!reportData) return 0;
    return reportData.reduce((sum, item) => sum + item.itemsSold, 0);
  }, [reportData]);

  const averageSalePerDay = useMemo(() => {
    if (!reportData || reportData.length === 0) return 0;
    return totalSales / reportData.length;
  }, [reportData, totalSales]);

  return (
    <MainLayout>
      <PageHeader
        title="Sales Reports"
        description="View and analyze your sales data"
      />

      <div className="mb-6 flex justify-between items-center">
        <Tabs 
          defaultValue="daily" 
          className="w-full"
          onValueChange={(value) => setPeriodType(value as PeriodType)}
        >
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="ml-4 w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              For the selected period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Total quantity sold
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {periodType === 'daily' ? 'Average Daily Sales' : 
               periodType === 'monthly' ? 'Average Monthly Sales' : 'Average Yearly Sales'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageSalePerDay.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Average per {periodType.slice(0, -2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {periodType === 'daily' ? 'Daily Sales Trend' : 
             periodType === 'monthly' ? 'Monthly Sales Trend' : 'Yearly Sales Trend'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-80">
              <p>Loading sales data...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-80">
              <p className="text-red-500">Error loading sales data</p>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Sales']}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Bar dataKey="totalSales" name="Sales ($)" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-80">
              <p>No sales data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default SalesReports;
