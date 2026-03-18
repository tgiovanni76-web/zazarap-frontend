import React from "react";
import BusinessForm from "@/components/business/BusinessForm";

export default function BusinessContact() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Jetzt Werbekampagne starten</h1>
      <div className="mb-4 text-slate-600 text-sm">
        <p className="leading-snug">Erreichen Sie gezielt Kunden in Ihrer Region</p>
        <p className="leading-snug">Wir melden uns innerhalb von 24 Stunden</p>
      </div>
      <BusinessForm />
    </div>
  );
}