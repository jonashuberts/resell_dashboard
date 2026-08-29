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

    transactions.forEach((t) => {
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

    return Object.values(monthlyData).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-zinc-500 text-sm">
        <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center mb-2 border border-white/[0.06]">
          📈
        </div>
        {t("dashboard.chart.empty")}
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/[0.12] bg-zinc-950/85 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <p className="text-xs font-semibold text-zinc-300 mb-1.5 pb-1 border-b border-white/[0.08]">{label}</p>
          <div className="space-y-1 text-xs">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span 
                    className="h-2 w-2 rounded-full shadow-[0_0_6px]" 
                    style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}` }}
                  />
                  {entry.name}
                </span>
                <span className="font-mono font-medium text-white tabular-nums">
                  €{Number(entry.value).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="appleColorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="90%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="appleColorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
              <stop offset="90%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={8}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `€${value}`}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            name={t("dashboard.chart.revenue")}
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#appleColorRevenue)" 
            strokeWidth={2.5}
            isAnimationActive={false}
            activeDot={{ r: 5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="expenses" 
            name={t("dashboard.chart.expenses")}
            stroke="#f43f5e" 
            fillOpacity={1} 
            fill="url(#appleColorExpenses)" 
            strokeWidth={2.5}
            isAnimationActive={false}
            activeDot={{ r: 5, fill: "#f43f5e", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
