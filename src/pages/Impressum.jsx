import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageProvider';

const impressumContent = {
  de: {
    title: "Impressum",
    subtitle: "Angaben gemäß § 5 TMG",
    operator: "Betreiber der Plattform",
    companyName: "Firmenname",
    address: "Anschrift",
    ceo: "Geschäftsführer",
    court: "Registergericht",
    regNumber: "Registernummer",
    vatId: "USt-IdNr.",
    contact: "Kontakt",
    phone: "Telefon",
    email: "E-Mail",
    website: "Website",
    responsible: "Verantwortlich für den Inhalt",
    responsibleNote: "nach § 55 Abs. 2 RStV",
    dispute: "Streitschlichtung",
    disputeText: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:",
    disputeNote: "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
    disclaimer: "Haftungsausschluss",
    contentLiability: "Haftung für Inhalte",
    contentLiabilityText: "Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.",
    linkLiability: "Haftung für Links",
    linkLiabilityText: "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.",
    copyright: "Urheberrecht",
    copyrightText: "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers."
  },
  en: {
    title: "Legal Notice",
    subtitle: "Information according to § 5 TMG",
    operator: "Platform Operator",
    companyName: "Company Name",
    address: "Address",
    ceo: "Managing Director",
    court: "Registration Court",
    regNumber: "Registration Number",
    vatId: "VAT ID",
    contact: "Contact",
    phone: "Phone",
    email: "Email",
    website: "Website",
    responsible: "Responsible for Content",
    responsibleNote: "according to § 55 Abs. 2 RStV",
    dispute: "Dispute Resolution",
    disputeText: "The European Commission provides a platform for online dispute resolution (ODR):",
    disputeNote: "We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.",
    disclaimer: "Disclaimer",
    contentLiability: "Liability for Content",
    contentLiabilityText: "As a service provider, we are responsible for our own content on these pages in accordance with general laws pursuant to § 7 Abs.1 TMG. However, according to §§ 8 to 10 TMG, we are not obliged as a service provider to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.",
    linkLiability: "Liability for Links",
    linkLiabilityText: "Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the content of the linked pages.",
    copyright: "Copyright",
    copyrightText: "The content and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator."
  },
  it: {
    title: "Note Legali",
    subtitle: "Informazioni ai sensi del § 5 TMG",
    operator: "Gestore della Piattaforma",
    companyName: "Ragione Sociale",
    address: "Indirizzo",
    ceo: "Amministratore Delegato",
    court: "Tribunale di Registro",
    regNumber: "Numero di Registrazione",
    vatId: "Partita IVA",
    contact: "Contatto",
    phone: "Telefono",
    email: "E-Mail",
    website: "Sito Web",
    responsible: "Responsabile dei Contenuti",
    responsibleNote: "ai sensi del § 55 Abs. 2 RStV",
    dispute: "Risoluzione delle Controversie",
    disputeText: "La Commissione Europea mette a disposizione una piattaforma per la risoluzione delle controversie online (ODR):",
    disputeNote: "Non siamo disposti né obbligati a partecipare a procedimenti di risoluzione delle controversie presso un organismo di conciliazione dei consumatori.",
    disclaimer: "Esclusione di Responsabilità",
    contentLiability: "Responsabilità per i Contenuti",
    contentLiabilityText: "In qualità di fornitore di servizi, siamo responsabili dei nostri contenuti su queste pagine in conformità con le leggi generali ai sensi del § 7 Abs.1 TMG. Tuttavia, ai sensi dei §§ 8-10 TMG, non siamo obbligati come fornitori di servizi a monitorare le informazioni di terzi trasmesse o memorizzate.",
    linkLiability: "Responsabilità per i Link",
    linkLiabilityText: "La nostra offerta contiene link a siti web esterni di terzi, sui cui contenuti non abbiamo alcun controllo. Pertanto, non possiamo assumerci alcuna responsabilità per questi contenuti esterni.",
    copyright: "Diritto d'Autore",
    copyrightText: "I contenuti e le opere creati dagli operatori del sito su queste pagine sono soggetti al diritto d'autore tedesco. La riproduzione, l'elaborazione, la distribuzione e qualsiasi tipo di sfruttamento al di fuori dei limiti del diritto d'autore richiedono il consenso scritto del rispettivo autore o creatore."
  },
  tr: {
    title: "Yasal Bildirim",
    subtitle: "§ 5 TMG'ye göre bilgiler",
    operator: "Platform İşletmecisi",
    companyName: "Şirket Adı",
    address: "Adres",
    ceo: "Genel Müdür",
    court: "Sicil Mahkemesi",
    regNumber: "Sicil Numarası",
    vatId: "Vergi Kimlik No",
    contact: "İletişim",
    phone: "Telefon",
    email: "E-posta",
    website: "Web Sitesi",
    responsible: "İçerikten Sorumlu",
    responsibleNote: "§ 55 Abs. 2 RStV'ye göre",
    dispute: "Uyuşmazlık Çözümü",
    disputeText: "Avrupa Komisyonu çevrimiçi uyuşmazlık çözümü (ODR) için bir platform sağlamaktadır:",
    disputeNote: "Tüketici tahkim kurulu önünde uyuşmazlık çözüm süreçlerine katılmaya istekli veya zorunlu değiliz.",
    disclaimer: "Sorumluluk Reddi",
    contentLiability: "İçerik Sorumluluğu",
    contentLiabilityText: "Hizmet sağlayıcı olarak, bu sayfalardaki kendi içeriklerimizden § 7 Abs.1 TMG uyarınca genel yasalara göre sorumluyuz.",
    linkLiability: "Link Sorumluluğu",
    linkLiabilityText: "Teklifimiz, içerikleri üzerinde hiçbir etkimiz olmayan üçüncü taraf harici web sitelerine bağlantılar içermektedir.",
    copyright: "Telif Hakkı",
    copyrightText: "Site operatörleri tarafından bu sayfalarda oluşturulan içerik ve eserler Alman telif hakkı yasasına tabidir."
  },
  uk: {
    title: "Юридична інформація",
    subtitle: "Інформація згідно з § 5 TMG",
    operator: "Оператор платформи",
    companyName: "Назва компанії",
    address: "Адреса",
    ceo: "Генеральний директор",
    court: "Реєстраційний суд",
    regNumber: "Реєстраційний номер",
    vatId: "ІПН",
    contact: "Контакти",
    phone: "Телефон",
    email: "Ел. пошта",
    website: "Веб-сайт",
    responsible: "Відповідальний за зміст",
    responsibleNote: "згідно з § 55 Abs. 2 RStV",
    dispute: "Вирішення спорів",
    disputeText: "Європейська комісія надає платформу для онлайн-вирішення спорів (ODR):",
    disputeNote: "Ми не бажаємо і не зобов'язані брати участь у процедурах вирішення спорів перед споживчим арбітражним органом.",
    disclaimer: "Відмова від відповідальності",
    contentLiability: "Відповідальність за зміст",
    contentLiabilityText: "Як постачальник послуг, ми несемо відповідальність за власний вміст на цих сторінках відповідно до загальних законів згідно з § 7 Abs.1 TMG.",
    linkLiability: "Відповідальність за посилання",
    linkLiabilityText: "Наша пропозиція містить посилання на зовнішні веб-сайти третіх сторін, на зміст яких ми не маємо впливу.",
    copyright: "Авторське право",
    copyrightText: "Вміст і твори, створені операторами сайту на цих сторінках, підлягають німецькому закону про авторське право."
  },
  fr: {
    title: "Mentions Légales",
    subtitle: "Informations conformément au § 5 TMG",
    operator: "Exploitant de la Plateforme",
    companyName: "Nom de l'entreprise",
    address: "Adresse",
    ceo: "Directeur Général",
    court: "Tribunal d'enregistrement",
    regNumber: "Numéro d'enregistrement",
    vatId: "N° TVA",
    contact: "Contact",
    phone: "Téléphone",
    email: "E-mail",
    website: "Site Web",
    responsible: "Responsable du Contenu",
    responsibleNote: "conformément au § 55 Abs. 2 RStV",
    dispute: "Règlement des Litiges",
    disputeText: "La Commission européenne met à disposition une plateforme de règlement des litiges en ligne (RLL):",
    disputeNote: "Nous ne sommes pas disposés ou tenus de participer à des procédures de règlement des litiges devant un organisme de médiation des consommateurs.",
    disclaimer: "Clause de Non-responsabilité",
    contentLiability: "Responsabilité du Contenu",
    contentLiabilityText: "En tant que prestataire de services, nous sommes responsables de notre propre contenu sur ces pages conformément aux lois générales selon le § 7 Abs.1 TMG.",
    linkLiability: "Responsabilité des Liens",
    linkLiabilityText: "Notre offre contient des liens vers des sites web externes de tiers, sur le contenu desquels nous n'avons aucune influence.",
    copyright: "Droit d'Auteur",
    copyrightText: "Le contenu et les œuvres créés par les exploitants du site sur ces pages sont soumis au droit d'auteur allemand."
  },
  pl: {
    title: "Impressum",
    subtitle: "Informacje zgodnie z § 5 TMG",
    operator: "Operator Platformy",
    companyName: "Nazwa firmy",
    address: "Adres",
    ceo: "Dyrektor Zarządzający",
    court: "Sąd Rejestrowy",
    regNumber: "Numer Rejestracyjny",
    vatId: "NIP",
    contact: "Kontakt",
    phone: "Telefon",
    email: "E-mail",
    website: "Strona WWW",
    responsible: "Odpowiedzialny za Treść",
    responsibleNote: "zgodnie z § 55 Abs. 2 RStV",
    dispute: "Rozwiązywanie Sporów",
    disputeText: "Komisja Europejska udostępnia platformę do rozstrzygania sporów online (ODR):",
    disputeNote: "Nie jesteśmy skłonni ani zobowiązani do uczestnictwa w postępowaniach rozstrzygania sporów przed organem arbitrażowym ds. konsumentów.",
    disclaimer: "Wyłączenie Odpowiedzialności",
    contentLiability: "Odpowiedzialność za Treść",
    contentLiabilityText: "Jako dostawca usług jesteśmy odpowiedzialni za własne treści na tych stronach zgodnie z ogólnymi przepisami prawa na podstawie § 7 Abs.1 TMG.",
    linkLiability: "Odpowiedzialność za Linki",
    linkLiabilityText: "Nasza oferta zawiera linki do zewnętrznych stron internetowych osób trzecich, na których treść nie mamy wpływu.",
    copyright: "Prawa Autorskie",
    copyrightText: "Treści i dzieła stworzone przez operatorów witryny na tych stronach podlegają niemieckiemu prawu autorskiemu."
  }
};

export default function Impressum() {
  const { language } = useLanguage();
  const content = impressumContent[language] || impressumContent.de;

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{content.title}</h1>
      <p className="text-sm text-slate-600 mb-6">{content.subtitle}</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{content.operator}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>{content.companyName}:</strong> Zazarap GmbH</p>
          <p><strong>{content.address}:</strong> Musterstraße 123<br/>
          10115 Berlin<br/>
          Deutschland</p>
          <p><strong>{content.ceo}:</strong> Max Mustermann</p>
          <p><strong>{content.court}:</strong> Amtsgericht Berlin-Charlottenburg</p>
          <p><strong>{content.regNumber}:</strong> HRB 123456</p>
          <p><strong>{content.vatId}:</strong> DE123456789</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{content.contact}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>{content.phone}:</strong> +49 (0) 30 12345678</p>
          <p><strong>{content.email}:</strong> <a href="mailto:info@zazarap.de" className="text-blue-600 hover:underline">info@zazarap.de</a></p>
          <p><strong>{content.website}:</strong> www.zazarap.de</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{content.responsible}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{content.responsibleNote}:<br/>
          Max Mustermann<br/>
          Musterstraße 123, 10115 Berlin</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{content.dispute}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3">
            {content.disputeText}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p>{content.disputeNote}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{content.disclaimer}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{content.contentLiability}</h3>
            <p className="text-sm text-slate-700">{content.contentLiabilityText}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{content.linkLiability}</h3>
            <p className="text-sm text-slate-700">{content.linkLiabilityText}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{content.copyright}</h3>
            <p className="text-sm text-slate-700">{content.copyrightText}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}