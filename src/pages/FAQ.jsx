import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => base44.entities.FAQ.filter({ active: true }, 'order'),
  });

  const incrementViewMutation = useMutation({
    mutationFn: async (faqId) => {
      const faq = faqs.find(f => f.id === faqId);
      await base44.entities.FAQ.update(faqId, { views: (faq.views || 0) + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    }
  });

  const handleToggle = (id) => {
    if (expandedId !== id) {
      incrementViewMutation.mutate(id);
    }
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(faqs.map(f => f.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <HelpCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Domande Frequenti</h1>
          <p className="text-slate-600">
            Trova risposte alle domande più comuni
          </p>
        </div>

        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Cerca nelle FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory('all')}
              >
                Tutte
              </Badge>
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <Card 
              key={faq.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleToggle(faq.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{faq.question}</h3>
                      {faq.category && (
                        <Badge variant="secondary" className="text-xs">
                          {faq.category}
                        </Badge>
                      )}
                    </div>
                    {expandedId === faq.id && (
                      <div className="mt-3 text-slate-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                    {faq.views > 0 && (
                      <div className="text-xs text-slate-400 mt-2">
                        {faq.views} visualizzazioni
                      </div>
                    )}
                  </div>
                  <div className="text-red-600">
                    {expandedId === faq.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">
              Nessuna FAQ trovata per la tua ricerca
            </p>
          </div>
        )}

        <div className="mt-12 text-center bg-slate-100 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-2">Non hai trovato risposta?</h3>
          <p className="text-slate-600 mb-4">
            Contattaci e saremo felici di aiutarti
          </p>
          <Link to={createPageUrl('Contact')}>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Contattaci
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}