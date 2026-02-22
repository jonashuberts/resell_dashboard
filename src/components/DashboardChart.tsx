"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import { useLanguage } from "./LanguageContext";

type Transaction = {
  date: string;
  type: string;
  amount: number;
};

export function DashboardChart({ transactions }: { transactions: Transaction[] }) {
  const { t } = useLanguage();

  const chartData = useMemo(() => {
    // Group transactions by month
    const monthlyData: Record<string, { month: string; sortKey: string; revenue: number; expenses: number }> = {};

    transactions.forEach(t => {
      // Store both a formatted label for the UI and a strict YYYY-MM string for reliable chronological sorting
      const dateObj = dayjs(t.date);
      const monthLabel = dateObj.format("MMM YY");
      const sortKey = dateObj.format("YYYY-MM");

      if (!monthlyData[monthLabel]) {
        monthlyData[monthLabel] = { month: monthLabel, sortKey, revenue: 0, expenses: 0 };
      }

      if (t.type === "Verkauf") {
        monthlyData[monthLabel].revenue += Number(t.amount);
      } else {
        monthlyData[monthLabel].expenses += Number(t.amount);
      }
    });

    // Sort chronologically based on the strict YYYY-MM key
    return Object.values(monthlyData).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-zinc-500">
        {t("dashboard.chart.empty")}
      </div>
    );
  }

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorEinnahmen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAusgaben" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            stroke="#52525b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `€${value}`}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fafafa', borderRadius: '8px' }}
            itemStyle={{ color: '#fafafa' }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            name={t("dashboard.chart.revenue")}
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorEinnahmen)" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="expenses" 
            name={t("dashboard.chart.expenses")}
            stroke="#f43f5e" 
            fillOpacity={1} 
            fill="url(#colorAusgaben)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
