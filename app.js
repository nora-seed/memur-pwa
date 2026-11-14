/* Memur Alım — arayüz ve yerel durum */
(function () {
  "use strict";

  const L = window.MemurLogic;
  const STORAGE_KEY = "memurAlim.v1";
  const DATA_CACHE_KEY = "memurAlim.data.v1";
  const ROUTES = ["panel", "ilanlar", "uygun", "takip", "profil"];

  const ICONS = {
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
    starFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10z"/><circle cx="12" cy="11" r="2"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3 3 0 0 1 0 5.5"/><path d="M18 14a5 5 0 0 1 3 4.5"/></svg>',
    cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v4c2.5 1.5 7.5 1.5 10 0v-4"/><path d="M21 9v5"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.5" r="0.8" fill="currentColor" stroke="none"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M5 3h14"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4L19 6"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7V5.6A1.6 1.6 0 0 1 10.1 4h3.8a1.6 1.6 0 0 1 1.6 1.6V7"/><path d="M3 12.5h18"/><path d="M10 12.5v2h4v-2"/></svg>'
  };

  const view = document.getElementById("view");
  const overlay = document.getElementById("overlay");
  const sheet = document.getElementById("sheet");
  const sheetBody = document.getElementById("sheetBody");
  const toastEl = document.getElementById("toast");
  const topSub = document.getElementById("topSub");
  const refreshBtn = document.getElementById("refreshBtn");
  const themeBtn = document.getElementById("themeBtn");
  const importFile = document.getElementById("importFile");

  let state = loadState();
  let data = loadCachedData() || emptyData();
  let dataError = "";
  let loading = false;
  let filters = defaultFilters();
  let takipTab = "favorites";
  let selectedId = null;
  let toastTimer = null;

  function emptyData() {
    return { version: 1, isSample: false, updatedAt: "", announcements: [] };
  }

  function defaultFilters() {
    return {
      query: "",
      type: "all",
      city: "all",
      education: "all",
      status: "all",
      eligibility: "all",
      onlyFavorites: false,
      applicationStatus: "all",
      sort: "deadline"
    };
  }

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return L.normalizeState(raw);
    } catch (e) {
      return L.defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function loadCachedData() {
    try {
      const raw = JSON.parse(localStorage.getItem(DATA_CACHE_KEY) || "null");
      if (!raw) return null;
      const normalized = L.normalizeData(raw);
      return normalized.announcements.length ? normalized : null;
    } catch (e) {
      return null;
    }
  }

  function saveDataCache(raw) {
    try {
      localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(raw));
    } catch (e) {}
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function currentRoute() {
    const hash = String(location.hash || "").replace(/^#/, "");
    return ROUTES.indexOf(hash) >= 0 ? hash : "panel";
  }

  function today() {
    return L.todayISO();
  }

  function appFor(id) {
    return state.applications[id] || { status: "", note: "" };
  }

  function isFavorite(id) {
    return state.favorites.indexOf(id) >= 0;
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  function options(items, selected, allLabel) {
    let html = allLabel ? '<option value="all">' + esc(allLabel) + "</option>" : "";
    (items || []).forEach(function (item) {
      const value = typeof item === "string" ? item : item.id;
      const label = typeof item === "string" ? item : item.name;
      html += '<option value="' + esc(value) + '"' + (value === selected ? " selected" : "") + ">" + esc(label) + "</option>";
    });
    return html;
  }

  function pageHead(title, subtitle, actionHtml) {
    return '<div class="page-head"><div><h2>' + esc(title) + "</h2><p>" + esc(subtitle) + "</p></div>" +
      (actionHtml || "") + "</div>";
  }

  function sectionBlock(title, linkLabel, action, cards) {
    return '<section class="section"><div class="section-head"><h3 class="section-title">' + esc(title) + "</h3>" +
      (linkLabel ? '<button class="section-link" type="button" data-action="' + esc(action) + '">' + esc(linkLabel) + "</button>" : "") +
      '</div><div class="ann-list">' + cards.join("") + "</div></section>";
  }

  function notice(tone, title, text, action, actionLabel) {
    return '<div class="notice tone-' + esc(tone) + '"><div class="notice-body"><strong>' + esc(title) + "</strong><p>" + esc(text) + "</p></div>" +
      (action ? '<button class="btn small ghost" type="button" data-action="' + esc(action) + '">' + esc(actionLabel || "Aç") + "</button>" : "") +
      "</div>";
  }

  function statCard(label, value, sub, tone) {
    return '<div class="stat tone-' + esc(tone) + '"><div class="stat-label">' + esc(label) + "</div>" +
      '<div class="stat-value">' + value + '</div><div class="stat-sub">' + esc(sub) + "</div></div>";
  }

  function typeBadge(announcement) {
    return '<span class="badge ' + esc(L.typeTone(announcement.type)) + '">' + esc(L.typeShort(announcement.type)) + "</span>";
  }

  function deadlineBadge(announcement) {
    const deadline = L.deadlineInfo(announcement, today());
    return '<span class="badge ' + esc(deadline.tone) + '">' + esc(deadline.label) + "</span>";
  }

  function eligibilityBadge(announcement) {
    const result = L.eligibility(announcement, state.profile);
    return '<span class="badge ' + esc(result.tone) + '">' + esc(result.label) + "</span>";
  }

  function statusBadge(id) {
    const app = appFor(id);
    if (!app.status) return "";
    return '<span class="badge ' + esc(L.applicationStatusTone(app.status)) + '">' + esc(L.applicationStatusName(app.status)) + "</span>";
  }

  function sampleBadge(announcement) {
    return announcement.sample ? '<span class="badge muted">Örnek</span>' : "";
  }

  function announcementCard(announcement, opts) {
    const o = opts || {};
    const deadline = L.deadlineInfo(announcement, today());
    const meta = [];
    if (announcement.city) {
      meta.push('<span class="meta-chip">' + ICONS.pin + esc(announcement.city) + "</span>");
    }
    if (announcement.quota != null) {
      meta.push('<span class="meta-chip">' + ICONS.users + esc(L.formatNumber(announcement.quota)) + " kişi</span>");
    }
    if (announcement.education) {
      meta.push('<span class="meta-chip">' + ICONS.cap + esc(L.educationName(announcement.education)) + "</span>");
    }
    if (announcement.scoreType === L.SCORE_TYPE) {
      meta.push('<span class="meta-chip score">P93' + (announcement.requiredScore != null ? " ≥ " + esc(L.formatScore(announcement.requiredScore)) : "") + "</span>");
    }
    const last = announcement.lastCutoff != null
      ? '<span class="ann-sub">Geçen yıl taban ' + esc(L.formatScore(announcement.lastCutoff)) + "</span>"
      : "";
    const favorite = isFavorite(announcement.id);
    return '<article class="ann-card tone-' + esc(L.typeTone(announcement.type)) + '">' +
      '<button class="ann-main" type="button" data-action="detail" data-id="' + esc(announcement.id) + '">' +
      '<span class="ann-top"><span class="ann-inst">' + esc(announcement.institution) + "</span>" +
      '<span class="ann-date-mini">' + ICONS.calendar + esc(L.formatDateTR(announcement.applicationEnd)) + "</span></span>" +
      '<span class="ann-title">' + esc(announcement.title) + "</span>" +
      '<span class="ann-meta">' + meta.join("") + "</span>" +
      last +
      '<span class="ann-foot">' +
      '<span class="badge ' + esc(L.typeTone(announcement.type)) + '">' + esc(L.typeShort(announcement.type)) + "</span>" +
      '<span class="badge ' + esc(deadline.tone) + '">' + esc(deadline.label) + "</span>" +
      (o.showEligibility === false ? "" : eligibilityBadge(announcement)) +
      (appFor(announcement.id).status ? statusBadge(announcement.id) : "") +
      sampleBadge(announcement) +
      "</span></button>" +
      '<button class="ann-fav' + (favorite ? " active" : "") + '" type="button" data-action="favorite" data-id="' + esc(announcement.id) + '" aria-label="' + (favorite ? "Favorilerden çıkar" : "Favorilere ekle") + '" title="' + (favorite ? "Favorilerden çıkar" : "Favorilere ekle") + '">' +
      (favorite ? ICONS.starFill : ICONS.star) + "</button></article>";
  }

  function emptyState(iconName, title, text, actionHtml) {
    return '<div class="empty"><div class="empty-icon">' + (ICONS[iconName] || ICONS.info) + "</div>" +
      "<h3>" + esc(title) + "</h3><p>" + esc(text) + "</p>" + (actionHtml || "") + "</div>";
  }

  function profileStrip() {
    const p = state.profile;
    return '<div class="profile-strip">' +
      '<div class="profile-score"><span>P93</span><strong>' + (p.score != null ? esc(L.formatScore(p.score)) : "—") + "</strong></div>" +
      '<div class="profile-item"><span>Mezuniyet</span><strong>' + esc(L.educationName(p.education)) + "</strong></div>" +
      '<div class="profile-item"><span>Bölüm</span><strong>' + esc(p.department || "Belirtilmedi") + "</strong></div>" +
      '<button class="btn small ghost" type="button" data-action="go-profil">Düzenle</button>' +
      "</div>";
  }

  function typeChip(type, label, count) {
    return '<button class="chip' + (filters.type === type ? " active" : "") + '" type="button" data-action="type-filter" data-type="' + esc(type) + '">' +
      esc(label) + ' <span class="chip-count">' + count + "</span></button>";
  }

  function applyFilters(list) {
    const t = today();
    return L.sortAnnouncements(
      L.filterAnnouncements(list, filters, state.profile, t, new Set(state.favorites), state.applications),
      filters.sort,
      t
    );
  }

  function countActiveFilters() {
    let count = 0;
    if (filters.city !== "all") count += 1;
    if (filters.education !== "all") count += 1;
    if (filters.status !== "all") count += 1;
    if (filters.eligibility !== "all") count += 1;
    if (filters.applicationStatus !== "all") count += 1;
    if (filters.onlyFavorites) count += 1;
    return count;
  }

  function filterChip(key, label) {
    return '<button class="chip active" type="button" data-action="remove-filter" data-key="' + esc(key) + '">' +
      esc(label) + ' <span aria-hidden="true">×</span></button>';
  }

  function activeFilterChips() {
    const chips = [];
    if (filters.city !== "all") chips.push(filterChip("city", "Şehir: " + filters.city));
    if (filters.education !== "all") chips.push(filterChip("education", "Mezuniyet: " + L.educationName(filters.education)));
    if (filters.status !== "all") {
      const labels = { open: "Açık", upcoming: "Yaklaşan", closed: "Kapandı" };
      chips.push(filterChip("status", labels[filters.status] || filters.status));
    }
    if (filters.eligibility !== "all") {
      chips.push(filterChip("eligibility", filters.eligibility === "eligible" ? "Sadece uygun" : "Sadece uygun değil"));
    }
    if (filters.applicationStatus !== "all") {
      chips.push(filterChip("applicationStatus", L.applicationStatusName(filters.applicationStatus)));
    }
    if (filters.onlyFavorites) chips.push(filterChip("onlyFavorites", "Sadece favoriler"));
    return chips;
  }

  function renderPanel() {
    const t = today();
    const list = data.announcements;
    const s = L.stats(list, state.profile, t, new Set(state.favorites), state.applications);
    const favorites = new Set(state.favorites);
    const eligible = L.sortAnnouncements(
      L.filterAnnouncements(list, { eligibility: "eligible" }, state.profile, t, favorites, state.applications)
        .filter(function (item) { return L.deadlineInfo(item, t).state !== "closed"; }),
      "deadline",
      t
    ).slice(0, 3);
    const soon = L.sortAnnouncements(
      list.filter(function (item) { return L.deadlineInfo(item, t).state === "open"; }),
      "deadline",
      t
    ).slice(0, 3);
    const recent = L.sortAnnouncements(list, "published", t).slice(0, 4);
    const nearest = s.nearest;

    let html = "";
    if (data.isSample) {
      html += notice("purple", "Örnek ilanlar", "data.json dosyasındaki örnek kayıtlar gösteriliyor. Gerçek ilanlar için veriyi güncelle.", "refresh", "Yenile");
    }
    if (dataError) html += notice("red", "Veri uyarısı", dataError, "refresh", "Tekrar dene");
    if (!state.profile.score) {
      html += notice("amber", "P93 puanını ekle", "Sana uygun ilanları görmek için P93 puanını ve bölümünü profile ekle.", "go-profil", "Profil");
    }

    html += '<section class="hero">' +
      '<div class="hero-top"><div><span class="hero-kicker">P93 · ' + esc(L.educationName(state.profile.education)) + "</span>" +
      "<h2>Memur Alım</h2><p class=\"hero-sub\">" +
      (data.updatedAt ? "Veri " + esc(L.formatDateTR(data.updatedAt)) + " tarihli" : "Kamu ilanları") +
      '</p></div><button class="hero-edit" type="button" data-action="go-profil" aria-label="Profili düzenle" title="Profili düzenle">' + ICONS.edit + "</button></div>" +
      '<div class="hero-stats">' +
      '<div class="hero-stat"><span>Açık ilan</span><strong>' + s.open + "</strong></div>" +
      '<div class="hero-stat"><span>Sana uygun</span><strong>' + s.eligibleOpen + "</strong></div>" +
      '<div class="hero-stat"><span>En yakın</span><strong>' + (nearest ? esc(L.formatDateTR(nearest.applicationEnd)) : "—") + "</strong></div>" +
      "</div></section>";

    html += '<div class="stat-grid">' +
      statCard("P93 puanın", state.profile.score != null ? esc(L.formatScore(state.profile.score)) : "—", state.profile.score != null ? "Profilde kayıtlı" : "Profilden ekle", "blue") +
      statCard("Açık ilan", String(s.open), s.upcoming + " yaklaşan", "green") +
      statCard("Sana uygun", String(s.eligibleOpen), "Profiline göre", "purple") +
      statCard("Takip", String(s.favorites), s.applied + " başvuru", "pink") +
      "</div>";

    html += '<div class="chip-row type-chips">' +
      typeChip("all", "Tümü", s.total) +
      typeChip("kpss", "KPSS", list.filter(function (item) { return item.type === "kpss"; }).length) +
      typeChip("sozlesmeli", "Sözleşmeli", list.filter(function (item) { return item.type === "sozlesmeli"; }).length) +
      typeChip("isci", "İşçi", list.filter(function (item) { return item.type === "isci"; }).length) +
      "</div>";

    if (!list.length) {
      html += emptyState("briefcase", loading ? "İlanlar yükleniyor…" : "İlan verisi yok",
        loading ? "data.json getiriliyor." : "Veriyi güncellemeyi dene.",
        '<button class="btn primary" type="button" data-action="refresh">Yenile</button>');
      return html;
    }

    if (eligible.length) {
      html += sectionBlock("Sana uygun ilanlar", "Tümünü gör", "go-uygun", eligible.map(function (item) { return announcementCard(item); }));
    }
    if (soon.length) {
      html += sectionBlock("Yaklaşan son başvurular", "Tüm ilanlar", "go-ilanlar", soon.map(function (item) { return announcementCard(item); }));
    }
    if (recent.length) {
      html += sectionBlock("Son eklenenler", "Tüm ilanlar", "go-ilanlar", recent.map(function (item) { return announcementCard(item); }));
    }
    return html;
  }

  function renderIlanlar() {
    const list = applyFilters(data.announcements);
    const activeCount = countActiveFilters();
    const active = activeFilterChips();
    let html = pageHead("İlanlar", data.announcements.length + " ilan · " + (data.updatedAt ? L.formatDateTR(data.updatedAt) : "—"),
      '<button class="btn small primary" type="button" data-action="refresh">' + ICONS.refresh + " Yenile</button>");
    html += '<div class="searchbar"><span class="search-ico">' + ICONS.search + "</span>" +
      '<input id="searchInput" type="search" placeholder="Kurum, kadro veya şehir ara…" value="' + esc(filters.query) + '" autocomplete="off" spellcheck="false"></div>';
    html += '<div class="chip-row type-chips">' +
      typeChip("all", "Tümü", data.announcements.length) +
      typeChip("kpss", "KPSS", data.announcements.filter(function (item) { return item.type === "kpss"; }).length) +
      typeChip("sozlesmeli", "Sözleşmeli", data.announcements.filter(function (item) { return item.type === "sozlesmeli"; }).length) +
      typeChip("isci", "İşçi", data.announcements.filter(function (item) { return item.type === "isci"; }).length) +
      "</div>";
    html += '<div class="filter-row"><button class="filter-btn' + (activeCount ? " has-filters" : "") + '" type="button" data-action="filter">' +
      ICONS.filter + " Filtreler" + (activeCount ? ' <span class="count">' + activeCount + "</span>" : "") + "</button>" +
      '<select id="sortSelect" class="sort-select" aria-label="Sıralama">' + options(L.SORT_OPTIONS, filters.sort) + "</select></div>";
    if (active.length) {
      html += '<div class="chip-row active-filters">' + active.join("") + "</div>";
    }
    if (!data.announcements.length) {
      html += emptyState("briefcase", "İlan verisi yok", "data.json dosyasına ilan ekleyip veriyi yenile.",
        '<button class="btn primary" type="button" data-action="refresh">Yenile</button>');
    } else if (!list.length) {
      html += emptyState("search", "Sonuç bulunamadı", "Arama veya filtreleri değiştirmeyi dene.",
        '<button class="btn ghost" type="button" data-action="clear-filters">Filtreleri temizle</button>');
    } else {
      html += '<div class="result-count">' + list.length + " ilan gösteriliyor</div>";
      html += '<div class="ann-list">' + list.map(function (item) { return announcementCard(item); }).join("") + "</div>";
    }
    return html;
  }

  function renderUygun() {
    const t = today();
    const list = data.announcements;
    const eligible = L.sortAnnouncements(
      list.filter(function (item) {
        return L.eligibility(item, state.profile).status === "eligible" &&
          L.deadlineInfo(item, t).state !== "closed";
      }),
      "deadline",
      t
    );
    const low = L.sortAnnouncements(
      list.filter(function (item) { return L.eligibility(item, state.profile).status === "low-score"; }),
      "score",
      t
    ).slice(0, 8);

    let html = pageHead("Sana uygun", "P93 puanına ve mezuniyetine göre",
      '<button class="btn small ghost" type="button" data-action="go-profil">Profili düzenle</button>');
    html += profileStrip();

    if (!state.profile.score) {
      html += emptyState("info", "P93 puanı yok", "Uygun ilanları görmek için profilinden P93 puanını gir.",
        '<button class="btn primary" type="button" data-action="go-profil">Puan ekle</button>');
    } else if (!eligible.length) {
      html += emptyState("info", "Şu an uygun ilan yok", "Profil bilgilerini güncelleyip yeni ilanları kontrol et.",
        '<button class="btn primary" type="button" data-action="go-ilanlar">İlanlara bak</button>');
    } else {
      html += sectionBlock("Uygun ilanlar", "", "", eligible.map(function (item) { return announcementCard(item); }));
    }

    if (low.length) {
      html += sectionBlock("Puanın yetmiyor", "", "", low.map(function (item) { return announcementCard(item); }));
    }
    return html;
  }

  function renderTakip() {
    const t = today();
    const favorites = data.announcements.filter(function (item) { return isFavorite(item.id); });
    const applications = data.announcements.filter(function (item) {
      const app = appFor(item.id);
      return app.status || app.note;
    });
    const statusOrder = { applied: 0, interested: 1, result: 2, dropped: 3 };
    applications.sort(function (a, b) {
      const sa = statusOrder[appFor(a.id).status] == null ? 9 : statusOrder[appFor(a.id).status];
      const sb = statusOrder[appFor(b.id).status] == null ? 9 : statusOrder[appFor(b.id).status];
      if (sa !== sb) return sa - sb;
      return String(a.applicationEnd).localeCompare(String(b.applicationEnd));
    });

    let html = pageHead("Takip", "Favoriler ve başvuru durumları");
    html += '<div class="segmented-wrap"><div class="segmented">' +
      '<button type="button" data-action="takip-tab" data-tab="favorites" class="' + (takipTab === "favorites" ? "active" : "") + '">Favoriler (' + favorites.length + ")</button>" +
      '<button type="button" data-action="takip-tab" data-tab="applications" class="' + (takipTab === "applications" ? "active" : "") + '">Başvurular (' + applications.length + ")</button>" +
      "</div></div>";

    if (takipTab === "favorites") {
      if (!favorites.length) {
        html += emptyState("star", "Henüz favori yok", "İlan kartındaki yıldıza dokunarak favorilere ekle.",
          '<button class="btn primary" type="button" data-action="go-ilanlar">İlanlara bak</button>');
      } else {
        html += '<div class="ann-list">' + L.sortAnnouncements(favorites, "deadline", t).map(function (item) { return announcementCard(item); }).join("") + "</div>";
      }
    } else if (!applications.length) {
      html += emptyState("check", "Başvuru takibi boş", "Bir ilanın detayında durum seçerek takibe başla.",
        '<button class="btn primary" type="button" data-action="go-ilanlar">İlanlara bak</button>');
    } else {
      html += '<div class="ann-list">' + applications.map(function (item) { return announcementCard(item); }).join("") + "</div>";
    }
    return html;
  }

  function themeOptions() {
    return [["auto", "Cihaz"], ["light", "Açık"], ["dark", "Koyu"]].map(function (item) {
      return '<option value="' + item[0] + '"' + (state.settings.theme === item[0] ? " selected" : "") + ">" + item[1] + "</option>";
    }).join("");
  }

  function settingRow(label, sub, side) {
    return '<div class="setting-row"><div><div class="setting-label">' + esc(label) + "</div>" +
      '<div class="setting-sub">' + esc(sub) + '</div></div><div class="setting-side">' + side + "</div></div>";
  }

  function renderProfil() {
    const p = state.profile;
    const cities = L.cityList(data.announcements);
    let html = pageHead("Profil", "P93 puanı ve mezuniyet bilgileri");
    html += '<form class="form card form-card" id="profileForm">' +
      '<div class="field-row"><div class="field"><label for="profileEducation">Mezuniyet</label>' +
      '<select id="profileEducation" name="education">' + options(L.EDUCATION, p.education) + "</select></div>" +
      '<div class="field"><label for="profileCity">Şehir</label><input id="profileCity" name="city" list="cityOptions" value="' + esc(p.city) + '" placeholder="örn. Ankara"></div></div>' +
      '<div class="field"><label for="profileDepartment">Bölüm</label><input id="profileDepartment" name="department" value="' + esc(p.department) + '" placeholder="örn. Büro Yönetimi"></div>' +
      '<div class="field"><label for="profileScore">P93 puanı</label><input id="profileScore" name="score" inputmode="decimal" value="' + (p.score != null ? esc(L.formatScore(p.score)) : "") + '" placeholder="örn. 78,6"></div>' +
      '<span class="hint">P93 puanın yoksa boş bırak. Puan 0-100 arasında olmalı.</span>' +
      '<button class="btn primary" type="submit">Profili kaydet</button>' +
      '<datalist id="cityOptions">' + cities.map(function (city) { return '<option value="' + esc(city) + '"></option>'; }).join("") + "</datalist>" +
      "</form>";

    html += '<section class="section"><div class="section-head"><h3 class="section-title">Veri</h3></div><div class="settings-group">' +
      settingRow("Veri güncelleme", data.updatedAt ? "Son güncelleme " + L.formatDateTR(data.updatedAt) : "Henüz yüklenmedi",
        '<button class="btn small ghost" type="button" data-action="refresh">Yenile</button>') +
      settingRow("Kaynak", "data.json · GitHub Pages",
        '<span class="badge ' + (data.isSample ? "amber" : "green") + '">' + (data.isSample ? "Örnek" : "Canlı") + "</span>") +
      settingRow("Yedek al", "Profil, favoriler ve başvurular",
        '<button class="btn small ghost" type="button" data-action="export">' + ICONS.download + " İndir</button>") +
      settingRow("Yedek yükle", "JSON dosyasından geri yükle",
        '<button class="btn small ghost" type="button" data-action="import">' + ICONS.upload + " Yükle</button>") +
      settingRow("Verileri temizle", "Sadece bu cihazdaki takip verileri",
        '<button class="btn small danger" type="button" data-action="clear-data">' + ICONS.trash + " Temizle</button>") +
      "</div></section>";

    html += '<section class="section"><div class="section-head"><h3 class="section-title">Görünüm</h3></div><div class="settings-group">' +
      '<div class="setting-row"><div><div class="setting-label">Tema</div><div class="setting-sub">Açık, koyu veya cihaz teması</div></div>' +
      '<div class="setting-side"><select id="themeSelect" aria-label="Tema">' + themeOptions() + "</select></div></div>" +
      "</div></section>";

    html += '<section class="section"><div class="section-head"><h3 class="section-title">Hakkında</h3></div>' +
      '<div class="about card"><strong>Memur Alım</strong><p>KPSS P93 ve önlisans mezunları için kamu personel alım ilanlarını tek yerde toplar.</p>' +
      '<p class="muted">Bu uygulama resmi ilan sitesi değildir. İlan bilgileri data.json dosyasından gelir; başvuru öncesi ilgili kurumun resmi ilanını kontrol et.</p></div></section>';
    return html;
  }

  function render() {
    const route = currentRoute();
    const active = document.activeElement;
    const focusId = active && active.id;
    const focusPos = active && typeof active.selectionStart === "number" ? active.selectionStart : null;

    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.classList.toggle("active", tab.getAttribute("data-nav") === route);
    });

    if (route === "ilanlar") view.innerHTML = renderIlanlar();
    else if (route === "uygun") view.innerHTML = renderUygun();
    else if (route === "takip") view.innerHTML = renderTakip();
    else if (route === "profil") view.innerHTML = renderProfil();
    else view.innerHTML = renderPanel();

    updateTopbar();
    if (focusId === "searchInput") {
      const input = document.getElementById("searchInput");
      if (input) {
        input.focus();
        if (focusPos != null) input.setSelectionRange(focusPos, focusPos);
      }
    }
  }

  function updateTopbar() {
    topSub.textContent = data.updatedAt ? "Son güncelleme " + L.formatDateTR(data.updatedAt) : "Kamu ilanları";
    refreshBtn.classList.toggle("spinning", loading);
    refreshBtn.disabled = loading;
  }

  function applyTheme() {
    const pref = state.settings.theme;
    const dark = pref === "dark" || (pref === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0b0f1a" : "#4f46e5");
  }

  function toggleTheme() {
    const dark = document.documentElement.dataset.theme === "dark";
    state.settings.theme = dark ? "light" : "dark";
    saveState();
    applyTheme();
    toast(dark ? "Açık tema" : "Koyu tema");
  }

  function fetchData(manual) {
    if (loading) return;
    loading = true;
    dataError = "";
    updateTopbar();
    if (manual) render();

    fetch("data.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (raw) {
        const result = L.validateData(raw);
        if (!result.data.announcements.length && !result.ok) throw new Error("Veri okunamadı");
        data = result.data;
        saveDataCache(raw);
        if (!result.ok) {
          dataError = result.errors.length + " veri uyarısı var; geçersiz kayıtlar atlandı.";
        }
        if (manual) toast("Veri güncellendi");
      })
      .catch(function () {
        if (!data.announcements.length) {
          dataError = "İlan verisi yüklenemedi. Bağlantını kontrol edip tekrar dene.";
        } else {
          dataError = "Güncel veri alınamadı; önbellekteki ilanlar gösteriliyor.";
        }
        if (manual) toast("Veri güncellenemedi");
      })
      .finally(function () {
        loading = false;
        render();
      });
  }

  function openSheet(html) {
    sheetBody.innerHTML = html;
    overlay.classList.remove("hidden");
    document.body.classList.add("locked");
    sheet.focus();
  }

  function closeSheet() {
    overlay.classList.add("hidden");
    document.body.classList.remove("locked");
    sheetBody.innerHTML = "";
    selectedId = null;
  }

  function sheetHead(title, subtitle) {
    return '<div class="sheet-head"><div><h2 class="sheet-title" id="sheetTitle">' + esc(title) + "</h2>" +
      '<p class="sheet-sub">' + esc(subtitle) + '</p></div><button class="sheet-close" type="button" data-action="close-sheet" aria-label="Kapat" title="Kapat">' + ICONS.close + "</button></div>";
  }

  function detailMeta(announcement) {
    const rows = [];
    if (announcement.city) rows.push(["Şehir", announcement.city]);
    if (announcement.quota != null) rows.push(["Kontenjan", L.formatNumber(announcement.quota) + " kişi"]);
    rows.push(["Mezuniyet", L.educationName(announcement.education)]);
    if (announcement.scoreType === L.SCORE_TYPE) {
      rows.push(["P93 şartı", announcement.requiredScore != null ? "≥ " + L.formatScore(announcement.requiredScore) : "Puan şartı yok"]);
    }
    if (announcement.lastCutoff != null) rows.push(["Geçen yıl taban", L.formatScore(announcement.lastCutoff)]);
    rows.push(["Başvuru", L.formatDateTR(announcement.applicationStart) + " – " + L.formatDateTR(announcement.applicationEnd)]);
    if (announcement.examDate) rows.push(["Sınav", L.formatDateTR(announcement.examDate)]);
    if (announcement.resultDate) rows.push(["Sonuç", L.formatDateTR(announcement.resultDate)]);
    return rows.map(function (row) {
      return '<div class="meta-item"><span>' + esc(row[0]) + "</span><strong>" + esc(row[1]) + "</strong></div>";
    }).join("");
  }

  function detailSection(title, text) {
    if (!text) return "";
    return '<section class="detail-section"><h3>' + esc(title) + "</h3><p>" + esc(text) + "</p></section>";
  }

  function openDetail(id) {
    const announcement = data.announcements.find(function (item) { return item.id === id; });
    if (!announcement) return;
    selectedId = id;
    const app = appFor(id);
    const elig = L.eligibility(announcement, state.profile);
    const favorite = isFavorite(id);
    const source = announcement.sourceUrl
      ? '<a class="btn ghost" href="' + esc(announcement.sourceUrl) + '" target="_blank" rel="noopener">' + ICONS.external + " Kaynak ilan</a>"
      : "";
    const tags = announcement.tags && announcement.tags.length
      ? '<div class="tag-row">' + announcement.tags.map(function (tag) { return '<span class="tag">' + esc(tag) + "</span>"; }).join("") + "</div>"
      : "";
    const html = sheetHead(announcement.title, announcement.institution) +
      '<div class="detail">' +
      '<div class="detail-badges">' + typeBadge(announcement) + deadlineBadge(announcement) + sampleBadge(announcement) + "</div>" +
      '<div class="elig-box tone-' + esc(elig.tone) + '"><strong>' + esc(elig.label) + "</strong>" +
      (elig.reason ? "<span>" + esc(elig.reason) + "</span>" : "") + "</div>" +
      '<div class="meta-grid">' + detailMeta(announcement) + "</div>" +
      detailSection("Şartlar", announcement.conditions) +
      detailSection("Açıklama", announcement.description) +
      tags +
      '<div class="detail-actions">' +
      '<button class="btn ' + (favorite ? "primary" : "ghost") + '" type="button" data-action="favorite" data-id="' + esc(id) + '">' +
      (favorite ? ICONS.starFill : ICONS.star) + " " + (favorite ? "Favorilerde" : "Favorile") + "</button>" +
      source +
      "</div>" +
      '<form class="form detail-form" id="applicationForm">' +
      '<div class="field"><label for="appStatus">Başvuru durumu</label><select id="appStatus" name="status">' +
      '<option value="">Durum yok</option>' +
      L.APPLICATION_STATUSES.map(function (item) {
        return '<option value="' + esc(item.id) + '"' + (app.status === item.id ? " selected" : "") + ">" + esc(item.name) + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="field"><label for="appNote">Not</label><textarea id="appNote" name="note" rows="3" placeholder="Başvuru linki, evrak, hatırlatma…">' + esc(app.note) + "</textarea></div>" +
      '<div class="form-actions"><button class="btn ghost" type="button" data-action="close-sheet">Kapat</button><button class="btn primary" type="submit">Kaydet</button></div>' +
      "</form>" +
      '<p class="disclaimer">Bu uygulama resmi ilan sitesi değildir. Başvuru öncesi ilanın resmi kaynağını kontrol et.</p>' +
      "</div>";
    openSheet(html);
  }

  function openFilterSheet() {
    const cities = L.cityList(data.announcements);
    const statusOptions = [
      { id: "open", name: "Açık" },
      { id: "upcoming", name: "Yaklaşan" },
      { id: "closed", name: "Kapandı" }
    ];
    const eligibilityOptions = [
      { id: "eligible", name: "Uygun" },
      { id: "not-eligible", name: "Uygun değil" }
    ];
    const html = sheetHead("Filtreler", "İlanları daralt") +
      '<form class="form" id="filterForm">' +
      '<div class="field-row"><div class="field"><label for="filterCity">Şehir</label><select id="filterCity" name="city">' + options(cities, filters.city, "Tüm şehirler") + "</select></div>" +
      '<div class="field"><label for="filterEducation">Mezuniyet</label><select id="filterEducation" name="education">' + options(L.EDUCATION, filters.education, "Tümü") + "</select></div></div>" +
      '<div class="field-row"><div class="field"><label for="filterStatus">Başvuru</label><select id="filterStatus" name="status">' + options(statusOptions, filters.status, "Tümü") + "</select></div>" +
      '<div class="field"><label for="filterEligibility">Uygunluk</label><select id="filterEligibility" name="eligibility">' + options(eligibilityOptions, filters.eligibility, "Tümü") + "</select></div></div>" +
      '<div class="field"><label for="filterApplication">Takip durumu</label><select id="filterApplication" name="applicationStatus">' + options(L.APPLICATION_STATUSES, filters.applicationStatus, "Tümü") + "</select></div>" +
      '<div class="field"><label for="filterSort">Sıralama</label><select id="filterSort" name="sort">' + options(L.SORT_OPTIONS, filters.sort) + "</select></div>" +
      '<label class="check"><input type="checkbox" name="onlyFavorites"' + (filters.onlyFavorites ? " checked" : "") + "> Sadece favoriler</label>" +
      '<div class="form-actions"><button class="btn ghost" type="button" data-action="clear-filters">Temizle</button><button class="btn primary" type="submit">Uygula</button></div>' +
      "</form>";
    openSheet(html);
  }

  function saveProfile(form) {
    const fd = new FormData(form);
    const rawScore = String(fd.get("score") || "").trim();
    const score = rawScore ? Number(rawScore.replace(",", ".")) : null;
    if (score != null && (!Number.isFinite(score) || score < 0 || score > 100)) {
      toast("P93 puanı 0-100 arasında olmalı");
      return;
    }
    state.profile = L.normalizeProfile({
      education: fd.get("education"),
      department: fd.get("department"),
      city: fd.get("city"),
      score: score
    });
    saveState();
    render();
    toast("Profil kaydedildi");
  }

  function saveApplication(form) {
    if (!selectedId) return;
    const status = form.elements.status.value;
    const note = String(form.elements.note.value || "").trim();
    if (!status && !note) {
      delete state.applications[selectedId];
    } else {
      state.applications[selectedId] = {
        status: status,
        note: note,
        updatedAt: new Date().toISOString()
      };
    }
    saveState();
    closeSheet();
    render();
    toast("Takip güncellendi");
  }

  function applyFilterForm(form) {
    const fd = new FormData(form);
    filters.city = String(fd.get("city") || "all");
    filters.education = String(fd.get("education") || "all");
    filters.status = String(fd.get("status") || "all");
    filters.eligibility = String(fd.get("eligibility") || "all");
    filters.applicationStatus = String(fd.get("applicationStatus") || "all");
    filters.sort = String(fd.get("sort") || "deadline");
    filters.onlyFavorites = form.elements.onlyFavorites.checked;
    closeSheet();
    render();
  }

  function exportState() {
    const payload = {
      app: "Memur Alım",
      version: 1,
      exportedAt: new Date().toISOString(),
      state: state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "memur-alim-yedek-" + L.todayISO() + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
    toast("Yedek indirildi");
  }

  function importState(file) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(String(reader.result));
        const raw = parsed && parsed.state ? parsed.state : parsed;
        state = L.normalizeState(raw);
        saveState();
        applyTheme();
        render();
        toast("Yedek yüklendi");
      } catch (e) {
        toast("Yedek dosyası okunamadı");
      }
    };
    reader.readAsText(file);
  }

  function clearData() {
    if (!window.confirm("Profil, favoriler ve başvuru notları silinsin mi? İlan verisi silinmez.")) return;
    state = L.defaultState();
    saveState();
    applyTheme();
    render();
    toast("Takip verileri temizlendi");
  }

  function onClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.getAttribute("data-action");
    if (action === "detail") {
      openDetail(target.getAttribute("data-id"));
    } else if (action === "favorite") {
      const id = target.getAttribute("data-id");
      const index = state.favorites.indexOf(id);
      if (index >= 0) state.favorites.splice(index, 1);
      else state.favorites.push(id);
      saveState();
      if (selectedId) openDetail(selectedId);
      else render();
      toast(index >= 0 ? "Favorilerden çıkarıldı" : "Favorilere eklendi");
    } else if (action === "go-profil") {
      location.hash = "#profil";
    } else if (action === "go-ilanlar") {
      location.hash = "#ilanlar";
    } else if (action === "go-uygun") {
      location.hash = "#uygun";
    } else if (action === "go-takip") {
      location.hash = "#takip";
    } else if (action === "refresh") {
      fetchData(true);
    } else if (action === "filter") {
      openFilterSheet();
    } else if (action === "clear-filters") {
      filters = defaultFilters();
      closeSheet();
      render();
    } else if (action === "remove-filter") {
      const key = target.getAttribute("data-key");
      if (key === "onlyFavorites") filters.onlyFavorites = false;
      else filters[key] = "all";
      render();
    } else if (action === "type-filter") {
      filters.type = target.getAttribute("data-type");
      if (currentRoute() !== "ilanlar") location.hash = "#ilanlar";
      else render();
    } else if (action === "takip-tab") {
      takipTab = target.getAttribute("data-tab");
      render();
    } else if (action === "close-sheet") {
      closeSheet();
    } else if (action === "export") {
      exportState();
    } else if (action === "import") {
      importFile.click();
    } else if (action === "clear-data") {
      clearData();
    }
  }

  function onSubmit(event) {
    if (event.target.id === "profileForm") {
      event.preventDefault();
      saveProfile(event.target);
    } else if (event.target.id === "applicationForm") {
      event.preventDefault();
      saveApplication(event.target);
    } else if (event.target.id === "filterForm") {
      event.preventDefault();
      applyFilterForm(event.target);
    }
  }

  function onInput(event) {
    if (event.target.id === "searchInput") {
      filters.query = event.target.value;
      render();
    }
  }

  function onChange(event) {
    if (event.target.id === "sortSelect") {
      filters.sort = event.target.value;
      render();
    } else if (event.target.id === "themeSelect") {
      state.settings.theme = event.target.value;
      saveState();
      applyTheme();
      toast(event.target.value === "auto" ? "Cihaz teması" : event.target.value === "dark" ? "Koyu tema" : "Açık tema");
    }
  }

  function init() {
    applyTheme();
    render();
    fetchData(false);

    themeBtn.addEventListener("click", toggleTheme);
    refreshBtn.addEventListener("click", function () { fetchData(true); });
    importFile.addEventListener("change", function (event) {
      const file = event.target.files && event.target.files[0];
      if (file) importState(file);
      event.target.value = "";
    });
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closeSheet();
    });
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    document.addEventListener("input", onInput);
    document.addEventListener("change", onChange);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeSheet();
      if ((event.key === "Enter" || event.key === " ") && event.target.matches && event.target.matches('[role="button"][data-action]')) {
        event.preventDefault();
        event.target.click();
      }
    });
    window.addEventListener("hashchange", render);
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").addEventListener) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        if (state.settings.theme === "auto") applyTheme();
      });
    }
  }

  init();
})();
