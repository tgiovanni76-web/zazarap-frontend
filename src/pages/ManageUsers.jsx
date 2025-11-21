import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, Ban, Unlock, Activity, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date'),
    enabled: currentUser?.role === 'admin',
  });

  const { data: userActivities = [] } = useQuery({
    queryKey: ['userActivities', selectedUser?.email],
    queryFn: () => base44.entities.UserActivity.filter({ userId: selectedUser.email }, '-created_date', 50),
    enabled: !!selectedUser && showActivityDialog,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('Utente aggiornato');
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.User.update(selectedUser.id, {
        blocked: true,
        blockedReason: blockReason,
        blockedAt: new Date().toISOString()
      });

      await base44.entities.Notification.create({
        userId: selectedUser.email,
        type: 'status_update',
        title: '🚫 Account bloccato',
        message: `Il tuo account è stato bloccato. Motivo: ${blockReason}`,
        linkUrl: '/Profile'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setShowBlockDialog(false);
      setBlockReason('');
      setSelectedUser(null);
      toast.success('Utente bloccato');
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (user) => {
      await base44.entities.User.update(user.id, {
        blocked: false,
        blockedReason: null,
        blockedAt: null
      });

      await base44.entities.Notification.create({
        userId: user.email,
        type: 'status_update',
        title: '✅ Account sbloccato',
        message: 'Il tuo account è stato sbloccato e puoi accedere normalmente.',
        linkUrl: '/Marketplace'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('Utente sbloccato');
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ user, newRole }) => 
      base44.entities.User.update(user.id, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('Ruolo aggiornato');
    },
  });

  if (currentUser?.role !== 'admin') {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold">Accesso negato</h2>
        <p className="text-slate-600">Solo gli amministratori possono gestire gli utenti.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    blocked: users.filter(u => u.blocked).length,
    active: users.filter(u => !u.blocked).length
  };

  return (
    <div className="py-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Gestione Utenti</h2>
        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="text-sm text-slate-600">Totale</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-sm text-slate-600">Attivi</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-sm text-slate-600">Bloccati</div>
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-sm text-slate-600">Admin</div>
            <div className="text-2xl font-bold text-indigo-600">{stats.admins}</div>
          </Card>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Cerca per email o nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className={user.blocked ? 'border-red-300 bg-red-50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{user.full_name || 'N/A'}</h3>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? (
                        <><Shield className="h-3 w-3 mr-1 inline" />Admin</>
                      ) : (
                        <>User</>
                      )}
                    </Badge>
                    {user.blocked && (
                      <Badge variant="destructive">
                        <Ban className="h-3 w-3 mr-1 inline" />
                        Bloccato
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{user.email}</p>
                  <p className="text-xs text-slate-500">
                    Registrato: {format(new Date(user.created_date), 'dd/MM/yyyy HH:mm')}
                  </p>
                  {user.blocked && user.blockedReason && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-sm">
                      <p className="font-semibold">Motivo blocco:</p>
                      <p>{user.blockedReason}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Bloccato il: {format(new Date(user.blockedAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => changeRoleMutation.mutate({ user, newRole })}
                    disabled={user.email === currentUser.email}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowActivityDialog(true);
                    }}
                  >
                    <Activity className="h-4 w-4" />
                  </Button>

                  {user.blocked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unblockUserMutation.mutate(user)}
                      disabled={user.email === currentUser.email}
                    >
                      <Unlock className="h-4 w-4 text-green-600" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowBlockDialog(true);
                      }}
                      disabled={user.email === currentUser.email}
                    >
                      <Ban className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500">Nessun utente trovato</p>
        </div>
      )}

      {showBlockDialog && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Blocca Utente</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setShowBlockDialog(false); setBlockReason(''); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Utente:</p>
                  <p className="font-bold">{selectedUser.full_name}</p>
                  <p className="text-sm text-slate-600">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Motivo del blocco</label>
                  <Textarea
                    placeholder="Descrivi il motivo del blocco..."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => blockUserMutation.mutate()}
                    disabled={!blockReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Blocca Utente
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setShowBlockDialog(false); setBlockReason(''); }}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showActivityDialog && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Storico Attività - {selectedUser.full_name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowActivityDialog(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-600">{selectedUser.email}</p>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {userActivities.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nessuna attività registrata</p>
              ) : (
                <div className="space-y-3">
                  {userActivities.map((activity) => (
                    <div key={activity.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {activity.activityType}
                          </Badge>
                          {activity.listingId && (
                            <p className="text-sm font-medium">Listing: {activity.listingId}</p>
                          )}
                          {activity.category && (
                            <p className="text-sm text-slate-600">Categoria: {activity.category}</p>
                          )}
                          {activity.searchTerm && (
                            <p className="text-sm text-slate-600">Ricerca: "{activity.searchTerm}"</p>
                          )}
                          {activity.priceRange && (
                            <p className="text-sm text-slate-600">Fascia prezzo: {activity.priceRange}€</p>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {format(new Date(activity.created_date), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}