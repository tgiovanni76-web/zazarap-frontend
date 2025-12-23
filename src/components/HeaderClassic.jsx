import { Link } from "react-router-dom";

const Icon = ({ children, title }) => (
  <span className="inline-flex" aria-hidden="true" title={title}>
    {children}
  </span>
);

const IconBtn = ({ to, label, title, children, primary = false }) => {
  const base =
    "inline-flex h-10 w-10 items-center justify-center rounded-xl " +
    "text-white hover:bg-white/15 focus-visible:outline-none " +
    "focus-visible:ring-4 focus-visible:ring-white/70 " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[#c81616]";

  const cls = primary ? `${base} bg-white/15` : base;

  return (
    <Link to={to} aria-label={label} title={title} className={cls}>
      {children}
    </Link>
  );
};

export default function HeaderClassic({
  homeUrl = "/",
  messagesUrl = "/nachrichten",
  createUrl = "/anzeige-erstellen",
  statsUrl = "/statistiken",
  packagesUrl = "/pakete",
  notificationsUrl = "/benachrichtigungen",
  settingsUrl = "/einstellungen",
  showSettings = true,
}) {
  return (
    <header className="rounded-2xl bg-[#c81616] px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <Link
          to={homeUrl}
          aria-label="Startseite"
          className="no-underline"
          title="Startseite"
        >
          <div className="leading-tight">
            <div className="text-[22px] font-extrabold text-black [text-shadow:2px_2px_0_#000]">
              Zazarap.de
            </div>
            <div className="text-xs text-black/90">kleinanzeigen</div>
          </div>
        </Link>

        <nav aria-label="Hauptnavigation" className="flex items-center gap-3">
          <IconBtn to={homeUrl} label="Startseite" title="Startseite">
            <Icon title="Startseite">
              <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-current">
                <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
              </svg>
            </Icon>
          </IconBtn>

          <IconBtn to={messagesUrl} label="Nachrichten" title="Nachrichten">
            <Icon title="Nachrichten">
              <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-current">
                <path d="M4 4h16v12H7l-3 3V4zm3 5h10v2H7V9zm0-3h10v2H7V6zm0 6h7v2H7v-2z" />
              </svg>
            </Icon>
          </IconBtn>

          <IconBtn
            to={createUrl}
            label="Anzeige erstellen"
            title="Anzeige erstellen"
            primary
          >
            <Icon title="Anzeige erstellen">
              <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-current">
                <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6v-2z" />
              </svg>
            </Icon>
          </IconBtn>

          <IconBtn to={statsUrl} label="Statistiken" title="Statistiken">
            <Icon title="Statistiken">
              <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-current">
                <path d="M5 9h3v10H5V9zm6-4h3v14h-3V5zm6 7h3v7h-3v-7z" />
              </svg>
            </Icon>
          </IconBtn>

          <IconBtn to={packagesUrl} label="Pakete" title="Pakete">
            <Icon title="Pakete">
              <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-current">
                <path d="M21 8l-9-5-9 5 9 5 9-5zm-9 7L3 10v10l9 5 9-5V10l-9 5z" />
              </svg>
            </Icon>
          </IconBtn>

          <IconBtn
            to={notificationsUrl}
            label="Benachrichtigungen"
            title="Benachrichtigungen"
          >
            <Icon title="Benachrichtigungen">
              <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-current">
                <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2z" />
              </svg>
            </Icon>
          </IconBtn>

          {showSettings && (
            <IconBtn to={settingsUrl} label="Einstellungen" title="Einstellungen">
              <Icon title="Einstellungen">
                <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-current">
                  <path d="M19.4 13a7.7 7.7 0 0 0 .1-1 7.7 7.7 0 0 0-.1-1l2.1-1.6-2-3.4-2.5 1a7.5 7.5 0 0 0-1.7-1l-.4-2.7H10l-.4 2.7a7.5 7.5 0 0 0-1.7 1l-2.5-1-2 3.4L5.5 11a7.7 7.7 0 0 0-.1 1 7.7 7.7 0 0 0 .1 1L3.4 14.6l2 3.4 2.5-1a7.5 7.5 0 0 0 1.7 1l.4 2.7h4.2l.4-2.7a7.5 7.5 0 0 0 1.7-1l2.5 1 2-3.4L19.4 13zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z" />
                </svg>
              </Icon>
            </IconBtn>
          )}

          {/* Lingua: se non hai pagina dedicata, può diventare un menu */}
          <button
            type="button"
            aria-label="Sprache wählen"
            title="Sprache wählen"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#c81616]"
          >
            <span aria-hidden="true">🇩🇪</span>
          </button>
        </nav>
      </div>
    </header>
  );
}