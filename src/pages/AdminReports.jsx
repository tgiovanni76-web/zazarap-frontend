import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function AdminReports() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list('-created_date'),
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list(),
  });

  const updateReportMutation = useMutation({
    mutationFn: (data) => base44.entities.Report.update(data.id, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success(t('admin.reportUpdated'));
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async (email) => {
      const users = await base44.entities.User.filter({ email });
      if (users[0]) {
        await base44.entities.User.update(users[0].id, { blocked: true });
        
        await base44.entities.Notification.create({
          userId: email,
          type: 'status_update',
          title: '🚫 Account Sospeso',
          message: `${t('admin.accountBlockedMsgPrefix')}`,
          linkUrl: '/CustomerSupport'
        });
      }
    },
    onSuccess: () => {
      toast.success(t('admin.userBanned'));
    }
  });

  if (user?.role !== 'admin') {
    return <div className="py-8 text-center">{t('accessDenied')}</div>;
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800'
  };

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">{t('admin.reports')}</h2>

      <div className="grid grid-cols-1 gap-4">
        {reports.map(report => {
          const chat = chats.find(c => c.id === report.chatId);
          
          return (
            <Card key={report.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{report.reason}</h3>
                    <p className="text-sm text-slate-600">
                      Da: {report.reporterId} | Contro: {report.reportedUserId}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(report.created_date), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <Badge className={statusColors[report.status]}>
                    {report.status}
                  </Badge>
                </div>

                <p className="text-sm text-slate-700 mb-4">{report.description}</p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => updateReportMutation.mutate({ id: report.id, status: 'reviewed' })}
                    variant="outline"
                    size="sm"
                  >
                    {t('action.reviewed')}
                  </Button>
                  <Button
                    onClick={() => updateReportMutation.mutate({ id: report.id, status: 'resolved' })}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {t('action.resolved')}
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm(`${t('admin.confirmBan')} ${report.reportedUserId}?`)) {
                        banUserMutation.mutate(report.reportedUserId);
                        updateReportMutation.mutate({ id: report.id, status: 'resolved' });
                      }
                    }}
                    size="sm"
                    variant="destructive"
                  >
                    {t('action.banUser')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          {t('admin.noReportsFound')}
        </div>
      )}
    </div>
  );
}