import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProductSearchAssistant() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    if (!query.trim() || query.length < 5) {
      return;
    }

    setIsSearching(true);
    try {
      const response = await base44.functions.invoke('intelligentProductSearch', {
        query: query.trim()
      });

      if (response.data) {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              🤖 Assistente Ricerca AI
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Descrivi cosa stai cercando in linguaggio naturale e l'AI troverà i prodotti perfetti per te.
            </p>
            
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Es: Cerco uno smartphone economico in buone condizioni..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || query.length < 5}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {results && (
              <div className="space-y-3">
                {results.interpretation && (
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-1">
                      Ho capito che cerchi:
                    </p>
                    <p className="text-sm text-slate-700">{results.interpretation}</p>
                    {results.filters && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {results.filters.category && (
                          <Badge variant="outline" className="text-xs">
                            📂 {results.filters.category}
                          </Badge>
                        )}
                        {results.filters.priceRange && (
                          <Badge variant="outline" className="text-xs">
                            💰 {results.filters.priceRange.min}€ - {results.filters.priceRange.max}€
                          </Badge>
                        )}
                        {results.filters.condition && (
                          <Badge variant="outline" className="text-xs">
                            ✨ {results.filters.condition}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {results.products && results.products.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">
                        {results.products.length} risultati trovati
                      </p>
                      {results.searchUrl && (
                        <Link to={results.searchUrl}>
                          <Button variant="outline" size="sm">
                            Vedi tutti
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {results.products.slice(0, 4).map(product => (
                        <Link
                          key={product.id}
                          to={createPageUrl('ListingDetail') + '?id=' + product.id}
                          className="bg-white p-2 rounded-lg border hover:border-blue-300 transition-colors"
                        >
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-24 object-cover rounded mb-2"
                            />
                          )}
                          <p className="text-xs font-medium line-clamp-2">
                            {product.title}
                          </p>
                          <p className="text-sm font-bold text-red-600 mt-1">
                            {product.price}€
                          </p>
                          {product.relevanceScore && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Match: {Math.round(product.relevanceScore * 100)}%
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : results.products && (
                  <p className="text-sm text-slate-600 text-center py-4">
                    Nessun risultato trovato. Prova a riformulare la ricerca.
                  </p>
                )}

                {results.suggestions && results.suggestions.length > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-2">
                      💡 Suggerimenti:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {results.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setQuery(suggestion)}
                          className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-blue-700 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}