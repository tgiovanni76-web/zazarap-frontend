import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Filter } from 'lucide-react';

export default function DashboardFilters({ 
  statusFilter, 
  setStatusFilter,
  categoryFilter, 
  setCategoryFilter,
  onExport,
  onReset 
}) {
  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Category
            </label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="elettronica">Elettronica</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="moda">Moda</SelectItem>
                <SelectItem value="sport">Sport</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="animali">Animali</SelectItem>
                <SelectItem value="altro">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={onReset} 
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
            <Button 
              onClick={onExport}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}