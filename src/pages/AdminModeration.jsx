import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, XCircle, Eye, RefreshCw, Filter, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminModeration() {
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['moderationListings', filterStatus],
    queryFn: () => {
      if (filterStatus === 'all') {
        return base44.entities.Listing.list('-created_date', 100);
      }
      return base44.entities.Listing.filter({ moderationStatus: filterStatus }, '-created_date', 100);
    },
    enabled: user?.role === 'admin',
  });

  const { data: moderationEvents = [] } = useQuery({
    queryKey: ['moderationEvents'],
    queryFn: () => base44.entities.ModerationEvent.list('-created_date', 50),
    enabled: user?.role === 'admin',
  });

  const approveMutation = useMutation({
    mutationFn: async (listingId) => {
      await base44.entities.Listing.update(listingId, {
        moderationStatus: 'approved',
        status: 'active'
      });
      await base44.entities.ModerationEvent.create({
        entityType: 'listing',
        entityId: listingId,
        action: 'approved',
        moderatorId: user.email,
        reason: 'Manually approved by admin'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderationListings'] });
      queryClient.invalidateQueries({ queryKey: ['moderationEvents'] });
      toast.success('Listing approved');
      setSelectedListing(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ listingId, reason }) => {
      const listing = listings.find(l => l.id === listingId);
      await base44.entities.Listing.update(listingId, {
        moderationStatus: 'rejected',
        rejectionReason: reason,
        status: 'archived'
      });
      await base44.entities.ModerationEvent.create({
        entityType: 'listing',
        entityId: listingId,
        action: 'rejected',
        severity: 'high',
        moderatorId: user.email,
        reason
      });
      // Notify user
      await base44.entities.Notification.create({
        userId: listing.created_by,
        type: 'status_update',
        title: '❌ Anzeige abgelehnt',
        message: `Deine Anzeige "${listing.title}" wurde abgelehnt. Grund: ${reason}`,
        linkUrl: '/MyListings'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderationListings'] });
      queryClient.invalidateQueries({ queryKey: ['moderationEvents'] });
      toast.success('Listing rejected');
      setSelectedListing(null);
      setRejectionReason('');
    }
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async (listingId) => {
      const result = await base44.functions.invoke('moderateListing', { listingId });
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['moderationListings'] });
      toast.success(`AI-Analyse: ${data.flagged ? 'Flagged' : 'Clean'} (${data.severity})`);
    }
  });

  if (user?.role !== 'admin') {
    return (
      <div className="py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg">Access denied</p>
      </div>
    );
  }

  const filteredListings = listings.filter(l => {
    if (filterSeverity === 'all') return true;
    try {
      const notes = JSON.parse(l.moderationNotes || '{}');
      return notes.textAnalysis?.severity === filterSeverity;
    } catch {
      return false;
    }
  });

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">KI-Moderation</h1>
        <Link to={createPageUrl('AdminDashboard')}>
          <Button variant="outline">← Zurück zum Dashboard</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Schwere</label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="critical">Kritisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Badge variant="secondary" className="h-10 px-4 flex items-center">
                {filteredListings.length} Anzeigen
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Listings List */}
        <div className="space-y-4">
          {isLoading ? (
            <p>Laden...</p>
          ) : filteredListings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                Keine Anzeigen gefunden
              </CardContent>
            </Card>
          ) : (
            filteredListings.map(listing => {
              let moderationData = null;
              try {
                moderationData = JSON.parse(listing.moderationNotes || '{}');
              } catch {}

              const severity = moderationData?.textAnalysis?.severity || 'low';

              return (
                <Card 
                  key={listing.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedListing?.id === listing.id ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => setSelectedListing(listing)}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {listing.images?.[0] ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-slate-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{listing.title}</h3>
                        <p className="text-sm text-slate-600">{listing.price}€ • {listing.category}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge className={severityColors[severity]}>
                            {severity}
                          </Badge>
                          <Badge variant="outline">
                            {listing.moderationStatus}
                          </Badge>
                          {moderationData?.textAnalysis?.categories?.map(cat => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Detail View */}
        <div className="sticky top-4">
          {selectedListing ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Details</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reanalyzeMutation.mutate(selectedListing.id)}
                    disabled={reanalyzeMutation.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 ${reanalyzeMutation.isPending ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{selectedListing.title}</h3>
                  <p className="text-sm text-slate-600">{selectedListing.description}</p>
                </div>

                {selectedListing.images?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedListing.images.map((img, idx) => (
                      <img key={idx} src={img} alt="" className="w-full rounded" />
                    ))}
                  </div>
                )}

                {(() => {
                  try {
                    const modData = JSON.parse(selectedListing.moderationNotes || '{}');
                    return (
                      <div className="space-y-3">
                        {modData.textAnalysis && (
                          <div className="bg-slate-50 p-3 rounded">
                            <h4 className="font-semibold text-sm mb-2">Text-Analyse</h4>
                            <p className="text-sm text-slate-700">{modData.textAnalysis.reason}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Confidence: {Math.round(modData.textAnalysis.confidence * 100)}%
                            </p>
                          </div>
                        )}
                        {modData.imageAnalysis && (
                          <div className="bg-slate-50 p-3 rounded">
                            <h4 className="font-semibold text-sm mb-2">Bild-Analyse</h4>
                            <p className="text-sm text-slate-700">{modData.imageAnalysis.reason}</p>
                          </div>
                        )}
                      </div>
                    );
                  } catch {
                    return null;
                  }
                })()}

                {selectedListing.moderationStatus === 'pending' && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveMutation.mutate(selectedListing.id)}
                        disabled={approveMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Genehmigen
                      </Button>
                      <Link to={createPageUrl('ListingDetail') + '?id=' + selectedListing.id} target="_blank">
                        <Button variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <div>
                      <Textarea
                        placeholder="Ablehnungsgrund..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mb-2"
                      />
                      <Button
                        onClick={() => rejectMutation.mutate({ 
                          listingId: selectedListing.id, 
                          reason: rejectionReason || 'Verstößt gegen Richtlinien'
                        })}
                        disabled={rejectMutation.isPending}
                        variant="destructive"
                        className="w-full"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Ablehnen
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-slate-400">
                Wähle eine Anzeige aus
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Events */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Letzte Moderationsereignisse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {moderationEvents.slice(0, 10).map(event => (
              <div key={event.id} className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  {event.action === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {event.action === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
                  {event.action === 'flagged' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                  <div>
                    <p className="text-sm font-medium">{event.action} - {event.entityType}</p>
                    <p className="text-xs text-slate-500">{event.reason}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(event.created_date).toLocaleString('de-DE')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}