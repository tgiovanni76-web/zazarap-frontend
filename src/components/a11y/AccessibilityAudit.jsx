import React, { useEffect, useState } from 'react';

function hasText(node) {
  return (node.textContent || '').trim().length > 0;
}

export default function AccessibilityAudit() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const issues = [];

    // 1) Images without alt
    document.querySelectorAll('img').forEach((img) => {
      const alt = img.getAttribute('alt');
      if (!alt || alt.trim() === '') {
        issues.push({ rule: 'img-alt', severity: 'moderate', message: 'Immagine senza attributo alt', node: img.outerHTML.slice(0, 120) + '…' });
      }
    });

    // 2) Buttons without accessible name
    document.querySelectorAll('button').forEach((btn) => {
      const label = btn.getAttribute('aria-label') || btn.getAttribute('title');
      if (!label && !hasText(btn)) {
        issues.push({ rule: 'button-name', severity: 'moderate', message: 'Bottone senza nome accessibile', node: btn.outerHTML.slice(0, 120) + '…' });
      }
    });

    // 3) Links without accessible name
    document.querySelectorAll('a').forEach((a) => {
      const label = a.getAttribute('aria-label') || a.getAttribute('title');
      if (!label && !hasText(a)) {
        issues.push({ rule: 'link-name', severity: 'moderate', message: 'Link senza nome accessibile', node: a.outerHTML.slice(0, 120) + '…' });
      }
    });

    // 4) Inputs without label
    document.querySelectorAll('input, select, textarea').forEach((el) => {
      const id = el.getAttribute('id');
      const hasLabel = !!document.querySelector(`label[for="${id}"]`);
      const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
      if (!hasLabel && !aria) {
        issues.push({ rule: 'form-label', severity: 'high', message: 'Campo di input senza etichetta', node: el.outerHTML.slice(0, 120) + '…' });
      }
    });

    // 5) Heading order checks (warn on jumps > 1)
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    let lastLevel = 0;
    headings.forEach((h) => {
      const level = Number(h.tagName.replace('H',''));
      if (lastLevel && level > lastLevel + 1) {
        issues.push({ rule: 'heading-order', severity: 'low', message: `Salto di intestazione da h${lastLevel} a h${level}`, node: h.outerHTML.slice(0, 120) + '…' });
      }
      lastLevel = level;
    });

    // 6) Page title exists
    const title = document.title || '';
    if (!title || title.trim() === '') {
      issues.push({ rule: 'page-title', severity: 'high', message: 'Titolo della pagina mancante' });
    }

    setResults(issues);
  }, []);

  const groups = results.reduce((acc, it) => {
    acc[it.severity] = acc[it.severity] || [];
    acc[it.severity].push(it);
    return acc;
  }, {});

  const order = ['high','moderate','low'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Accessibility audit</h2>
        <p className="text-slate-600">Verifica base automatizzata (non sostituisce un audit completo con strumenti dedicati).</p>
      </div>

      {order.map((sev) => (
        <div key={sev}>
          <h3 className="text-lg font-semibold capitalize">{sev} ({groups[sev]?.length || 0})</h3>
          <div className="mt-2 space-y-2">
            {(groups[sev] || []).map((r, idx) => (
              <div key={idx} className="bg-white border rounded p-3">
                <div className="text-sm"><span className="font-medium">Regola:</span> {r.rule}</div>
                <div className="text-sm"><span className="font-medium">Messaggio:</span> {r.message}</div>
                {r.node && <pre className="text-xs text-slate-500 overflow-x-auto mt-1">{r.node}</pre>}
              </div>
            ))}
            {(!groups[sev] || groups[sev].length === 0) && (
              <div className="text-slate-500 text-sm">Nessun problema {sev} rilevato.</div>
            )}
          </div>
        </div>
      ))}

      {results.length === 0 && (
        <div className="text-green-700 bg-green-50 border border-green-200 rounded p-4">Nessun problema rilevato nelle verifiche di base.</div>
      )}
    </div>
  );
}