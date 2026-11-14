/* Memur Alım — saf hesaplama ve veri normalizasyonu */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.MemurLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VERSION = 1;
  const SCORE_TYPE = "P93";

  const TYPES = [
    { id: "kpss", name: "KPSS Merkezi Atama", short: "KPSS", tone: "blue" },
    { id: "sozlesmeli", name: "Sözleşmeli Personel", short: "Sözleşmeli", tone: "cyan" },
    { id: "isci", name: "Kamu İşçisi", short: "İşçi", tone: "amber" }
  ];

  const EDUCATION = [
    { id: "ilkogretim", name: "İlköğretim", rank: 1 },
    { id: "ortaogretim", name: "Ortaöğretim", rank: 2 },
    { id: "onlisans", name: "Önlisans", rank: 3 },
    { id: "lisans", name: "Lisans", rank: 4 },
    { id: "farketmez", name: "Fark etmez", rank: 0 }
  ];

  const APPLICATION_STATUSES = [
    { id: "interested", name: "İlgileniyorum", tone: "amber" },
    { id: "applied", name: "Başvurdum", tone: "blue" },
    { id: "result", name: "Sonuçlandı", tone: "green" },
    { id: "dropped", name: "Vazgeçtim", tone: "muted" }
  ];

  const SORT_OPTIONS = [
    { id: "deadline", name: "Son başvuru" },
    { id: "published", name: "Yayın tarihi" },
    { id: "score", name: "İstenen puan" },
    { id: "institution", name: "Kurum adı" }
  ];

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function num(value) {
    const normalized = typeof value === "string" ? value.trim().replace(",", ".") : value;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    const p = Math.pow(10, digits == null ? 2 : digits);
    return Math.round(num(value) * p) / p;
  }

  function todayISO(now) {
    const d = now ? new Date(now) : new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function isISODate(value) {
    if (typeof value !== "string") return false;
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return false;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (y < 1900 || y > 2200 || mo < 1 || mo > 12 || d < 1 || d > 31) return false;
    const dt = new Date(Date.UTC(y, mo - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
  }

  function dateFromISO(iso) {
    const p = iso.split("-").map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  }

  function diffDays(fromISO, toISO) {
    if (!isISODate(fromISO) || !isISODate(toISO)) return null;
    return Math.round((dateFromISO(toISO).getTime() - dateFromISO(fromISO).getTime()) / 86400000);
  }

  function formatDateTR(iso) {
    if (!isISODate(iso)) return "—";
    const p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function formatNumber(value, digits) {
    const d = digits == null ? 0 : digits;
    const fixed = num(value).toFixed(d);
    const parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? parts[0] + "," + parts[1] : parts[0];
  }

  function formatScore(value) {
    return value == null || value === "" ? "—" : formatNumber(value, 1);
  }

  function labelFor(list, id, fallback) {
    const found = list.find(function (item) { return item.id === id; });
    return found ? found.name : (fallback == null ? "" : fallback);
  }

  function typeName(id) {
    return labelFor(TYPES, id, "Diğer");
  }

  function typeShort(id) {
    const found = TYPES.find(function (item) { return item.id === id; });
    return found ? found.short : "Diğer";
  }

  function typeTone(id) {
    const found = TYPES.find(function (item) { return item.id === id; });
    return found ? found.tone : "muted";
  }

  function educationName(id) {
    return labelFor(EDUCATION, id, "Fark etmez");
  }

  function applicationStatusName(id) {
    return labelFor(APPLICATION_STATUSES, id, "");
  }

  function applicationStatusTone(id) {
    const found = APPLICATION_STATUSES.find(function (item) { return item.id === id; });
    return found ? found.tone : "muted";
  }

  function normalizeText(value) {
    return String(value == null ? "" : value)
      .toLocaleLowerCase("tr")
      .replace(/ı/g, "i")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function tokens(value) {
    return normalizeText(value).split(" ").filter(function (token) { return token.length > 2; });
  }

  function tokenMatch(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    const n = Math.min(a.length, b.length, 8);
    return n >= 4 && a.slice(0, n) === b.slice(0, n);
  }

  function departmentMatches(departments, userDepartment) {
    const list = Array.isArray(departments) ? departments : [];
    if (!list.length) return true;
    const user = normalizeText(userDepartment);
    if (!user) return false;
    const userTokens = tokens(userDepartment);
    return list.some(function (dep) {
      const depText = normalizeText(dep);
      if (!depText) return true;
      if (user.indexOf(depText) >= 0 || depText.indexOf(user) >= 0) return true;
      const depTokens = tokens(dep);
      if (!depTokens.length) return true;
      return depTokens.every(function (dt) {
        return userTokens.some(function (ut) { return tokenMatch(dt, ut); });
      });
    });
  }

  function deadlineInfo(announcement, today) {
    const t = isISODate(today) ? today : todayISO();
    const start = announcement && announcement.applicationStart;
    const end = announcement && announcement.applicationEnd;
    if (!isISODate(start) || !isISODate(end)) {
      return { state: "unknown", days: null, label: "Tarih yok", tone: "muted" };
    }
    if (t < start) {
      const days = diffDays(t, start);
      return {
        state: "upcoming",
        days: days,
        label: days === 0 ? "Bugün başlıyor" : days === 1 ? "Yarın başlıyor" : days + " gün sonra",
        tone: "amber"
      };
    }
    if (t > end) {
      return { state: "closed", days: diffDays(end, t), label: "Başvuru kapandı", tone: "muted" };
    }
    const days = diffDays(t, end);
    if (days === 0) return { state: "open", days: 0, label: "Son gün bugün", tone: "red" };
    if (days <= 3) return { state: "open", days: days, label: days + " gün kaldı", tone: "red" };
    return { state: "open", days: days, label: days + " gün kaldı", tone: "green" };
  }

  function defaultProfile() {
    return { education: "onlisans", department: "", city: "", score: null };
  }

  function normalizeProfile(raw) {
    const p = raw && typeof raw === "object" ? raw : {};
    const education = EDUCATION.some(function (item) { return item.id === p.education; })
      ? p.education
      : "onlisans";
    const scoreValue = num(p.score);
    return {
      education: education,
      department: String(p.department == null ? "" : p.department).trim(),
      city: String(p.city == null ? "" : p.city).trim(),
      score: scoreValue > 0 && scoreValue <= 100 ? round(scoreValue, 1) : null
    };
  }

  function eligibility(announcement, profile) {
    const p = normalizeProfile(profile);
    const education = announcement.education || "farketmez";
    if (education !== "farketmez" && education !== p.education) {
      return {
        status: "education",
        label: "Mezuniyet uygun değil",
        tone: "muted",
        reason: educationName(education) + " mezunu aranıyor"
      };
    }
    if (announcement.departments && announcement.departments.length) {
      if (!p.department) {
        return {
          status: "department-missing",
          label: "Bölümünü gir",
          tone: "amber",
          reason: "İlan bölüm şartı içeriyor: " + announcement.departments.join(", ")
        };
      }
      if (!departmentMatches(announcement.departments, p.department)) {
        return {
          status: "department",
          label: "Bölüm uygun değil",
          tone: "muted",
          reason: "Aranan bölümler: " + announcement.departments.join(", ")
        };
      }
    }
    if (announcement.scoreType === SCORE_TYPE) {
      if (!p.score) {
        return {
          status: "no-score",
          label: "P93 puanı yok",
          tone: "amber",
          reason: "Profiline P93 puanını ekle"
        };
      }
      if (announcement.requiredScore != null && p.score < announcement.requiredScore) {
        return {
          status: "low-score",
          label: "Puan yetersiz",
          tone: "red",
          reason: formatNumber(announcement.requiredScore - p.score, 1) + " puan eksik (istenen " + formatScore(announcement.requiredScore) + ")"
        };
      }
    }
    return { status: "eligible", label: "Uygun", tone: "green", reason: "" };
  }

  function parseAnnouncement(raw, index) {
    const errors = [];
    const add = function (field, message) {
      errors.push({ index: index, field: field, message: message });
    };
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      add("root", "İlan nesnesi değil");
      return { data: null, errors: errors };
    }

    const id = String(raw.id == null ? "" : raw.id).trim();
    if (!id) add("id", "ID zorunlu");
    const institution = String(raw.institution == null ? "" : raw.institution).trim();
    if (!institution) add("institution", "Kurum zorunlu");
    const title = String(raw.title == null ? "" : raw.title).trim();
    if (!title) add("title", "Kadro zorunlu");

    const type = TYPES.some(function (item) { return item.id === raw.type; }) ? raw.type : "";
    if (!type) add("type", "Geçersiz ilan türü");

    const educationValid = EDUCATION.some(function (item) { return item.id === raw.education; });
    if (!educationValid) add("education", "Geçersiz mezuniyet düzeyi");
    const education = educationValid ? raw.education : "farketmez";

    const scoreType = raw.scoreType === SCORE_TYPE || raw.scoreType === "" ? raw.scoreType : "";
    if (raw.scoreType && raw.scoreType !== SCORE_TYPE) add("scoreType", "Sadece P93 destekleniyor");

    const start = isISODate(raw.applicationStart) ? raw.applicationStart : "";
    if (!start) add("applicationStart", "Geçerli başlangıç tarihi yok");
    const end = isISODate(raw.applicationEnd) ? raw.applicationEnd : "";
    if (!end) add("applicationEnd", "Geçerli bitiş tarihi yok");
    if (start && end && end < start) add("applicationEnd", "Bitiş tarihi başlangıçtan önce");

    const examDate = isISODate(raw.examDate) ? raw.examDate : "";
    if (raw.examDate && !examDate) add("examDate", "Geçersiz sınav tarihi");
    const resultDate = isISODate(raw.resultDate) ? raw.resultDate : "";
    if (raw.resultDate && !resultDate) add("resultDate", "Geçersiz sonuç tarihi");
    const publishedAt = isISODate(raw.publishedAt) ? raw.publishedAt : "";
    if (raw.publishedAt && !publishedAt) add("publishedAt", "Geçersiz yayın tarihi");

    let quota = null;
    if (raw.quota != null && raw.quota !== "") {
      const q = num(raw.quota);
      if (q < 0) add("quota", "Kontenjan negatif olamaz");
      else quota = Math.round(q);
    }

    let requiredScore = null;
    if (raw.requiredScore != null && raw.requiredScore !== "") {
      const s = num(raw.requiredScore);
      if (s < 0 || s > 100) add("requiredScore", "Puan 0-100 arasında olmalı");
      else requiredScore = round(s, 2);
    }

    let lastCutoff = null;
    if (raw.lastCutoff != null && raw.lastCutoff !== "") {
      const s = num(raw.lastCutoff);
      if (s < 0 || s > 100) add("lastCutoff", "Taban puan 0-100 arasında olmalı");
      else lastCutoff = round(s, 2);
    }

    function stringList(value) {
      if (Array.isArray(value)) {
        return value.map(function (item) { return String(item == null ? "" : item).trim(); })
          .filter(Boolean);
      }
      if (typeof value === "string") {
        return value.split(",").map(function (item) { return item.trim(); }).filter(Boolean);
      }
      return [];
    }

    let sourceUrl = String(raw.sourceUrl == null ? "" : raw.sourceUrl).trim();
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
      add("sourceUrl", "Kaynak adresi http(s) ile başlamalı");
      sourceUrl = "";
    }

    const critical = errors.some(function (item) {
      return item.field === "root" || item.field === "id" || item.field === "institution" ||
        item.field === "title" || item.field === "type" || item.field === "applicationStart" ||
        item.field === "applicationEnd";
    });
    if (critical) return { data: null, errors: errors };

    return {
      data: {
        id: id,
        institution: institution,
        title: title,
        type: type,
        city: String(raw.city == null ? "" : raw.city).trim(),
        quota: quota,
        education: education,
        departments: stringList(raw.departments),
        scoreType: scoreType,
        requiredScore: requiredScore,
        lastCutoff: lastCutoff,
        applicationStart: start,
        applicationEnd: end,
        examDate: examDate,
        resultDate: resultDate,
        conditions: String(raw.conditions == null ? "" : raw.conditions).trim(),
        description: String(raw.description == null ? "" : raw.description).trim(),
        sourceUrl: sourceUrl,
        publishedAt: publishedAt,
        tags: stringList(raw.tags),
        sample: raw.sample === true
      },
      errors: errors
    };
  }

  function validateData(raw) {
    const errors = [];
    let input = raw;
    if (Array.isArray(input)) input = { version: VERSION, announcements: input };
    if (!input || typeof input !== "object") {
      errors.push({ index: -1, field: "root", message: "Kök nesne değil" });
      return {
        ok: false,
        errors: errors,
        data: { version: VERSION, isSample: false, updatedAt: todayISO(), announcements: [] }
      };
    }
    if (input.version !== VERSION) {
      errors.push({ index: -1, field: "version", message: "Desteklenmeyen veri sürümü" });
    }
    if (!Array.isArray(input.announcements)) {
      errors.push({ index: -1, field: "announcements", message: "İlanlar dizisi yok" });
      return {
        ok: false,
        errors: errors,
        data: {
          version: VERSION,
          isSample: input.isSample === true,
          updatedAt: isISODate(input.updatedAt) ? input.updatedAt : todayISO(),
          announcements: []
        }
      };
    }

    const seen = Object.create(null);
    const list = [];
    input.announcements.forEach(function (item, index) {
      const parsed = parseAnnouncement(item, index);
      parsed.errors.forEach(function (err) { errors.push(err); });
      if (!parsed.data) return;
      if (seen[parsed.data.id]) {
        errors.push({ index: index, field: "id", message: "Tekrarlı ID: " + parsed.data.id });
        return;
      }
      seen[parsed.data.id] = true;
      list.push(parsed.data);
    });

    return {
      ok: errors.length === 0,
      errors: errors,
      data: {
        version: VERSION,
        isSample: input.isSample === true,
        updatedAt: isISODate(input.updatedAt) ? input.updatedAt : todayISO(),
        announcements: list
      }
    };
  }

  function normalizeData(raw) {
    return validateData(raw).data;
  }

  function searchText(announcement) {
    return normalizeText([
      announcement.institution,
      announcement.title,
      announcement.city,
      (announcement.departments || []).join(" "),
      (announcement.tags || []).join(" ")
    ].join(" "));
  }

  function filterAnnouncements(list, filters, profile, today, favorites, applications) {
    const f = filters || {};
    const query = normalizeText(f.query);
    const favSet = favorites instanceof Set ? favorites : new Set(favorites || []);
    const apps = applications || {};
    return (list || []).filter(function (announcement) {
      if (query && searchText(announcement).indexOf(query) < 0) return false;
      if (f.type && f.type !== "all" && announcement.type !== f.type) return false;
      if (f.city && f.city !== "all" && announcement.city !== f.city) return false;
      if (f.education && f.education !== "all" && announcement.education !== f.education) return false;
      if (f.onlyFavorites && !favSet.has(announcement.id)) return false;
      if (f.applicationStatus && f.applicationStatus !== "all") {
        const app = apps[announcement.id];
        if (!app || app.status !== f.applicationStatus) return false;
      }
      const deadline = deadlineInfo(announcement, today);
      if (f.status && f.status !== "all" && deadline.state !== f.status) return false;
      if (f.eligibility && f.eligibility !== "all") {
        const eligible = eligibility(announcement, profile).status === "eligible";
        if (f.eligibility === "eligible" && !eligible) return false;
        if (f.eligibility === "not-eligible" && eligible) return false;
      }
      return true;
    });
  }

  function sortAnnouncements(list, sort, today) {
    const arr = (list || []).slice();
    const t = isISODate(today) ? today : todayISO();
    if (sort === "published") {
      arr.sort(function (a, b) {
        return String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")) ||
          a.institution.localeCompare(b.institution, "tr");
      });
    } else if (sort === "score") {
      arr.sort(function (a, b) {
        const sa = a.requiredScore == null ? 101 : a.requiredScore;
        const sb = b.requiredScore == null ? 101 : b.requiredScore;
        return sa - sb || a.institution.localeCompare(b.institution, "tr");
      });
    } else if (sort === "institution") {
      arr.sort(function (a, b) { return a.institution.localeCompare(b.institution, "tr"); });
    } else {
      const order = { open: 0, upcoming: 1, closed: 2, unknown: 3 };
      arr.sort(function (a, b) {
        const da = deadlineInfo(a, t);
        const db = deadlineInfo(b, t);
        if (order[da.state] !== order[db.state]) return order[da.state] - order[db.state];
        if (da.state === "closed") {
          return String(b.applicationEnd || "").localeCompare(String(a.applicationEnd || ""));
        }
        if (da.state === "upcoming") {
          return String(a.applicationStart || "").localeCompare(String(b.applicationStart || ""));
        }
        return String(a.applicationEnd || "").localeCompare(String(b.applicationEnd || ""));
      });
    }
    return arr;
  }

  function stats(list, profile, today, favorites, applications) {
    const t = isISODate(today) ? today : todayISO();
    const favSet = favorites instanceof Set ? favorites : new Set(favorites || []);
    const apps = applications || {};
    const out = {
      total: 0, open: 0, upcoming: 0, closed: 0,
      eligible: 0, eligibleOpen: 0, favorites: 0, applied: 0, nearest: null
    };
    (list || []).forEach(function (announcement) {
      out.total += 1;
      const deadline = deadlineInfo(announcement, t);
      if (deadline.state === "open") out.open += 1;
      else if (deadline.state === "upcoming") out.upcoming += 1;
      else if (deadline.state === "closed") out.closed += 1;
      if (eligibility(announcement, profile).status === "eligible") {
        out.eligible += 1;
        if (deadline.state !== "closed") out.eligibleOpen += 1;
      }
      if (favSet.has(announcement.id)) out.favorites += 1;
      const app = apps[announcement.id];
      if (app && app.status === "applied") out.applied += 1;
    });
    const open = (list || []).filter(function (announcement) {
      return deadlineInfo(announcement, t).state === "open";
    }).sort(function (a, b) {
      return String(a.applicationEnd).localeCompare(String(b.applicationEnd));
    });
    const upcoming = (list || []).filter(function (announcement) {
      return deadlineInfo(announcement, t).state === "upcoming";
    }).sort(function (a, b) {
      return String(a.applicationStart).localeCompare(String(b.applicationStart));
    });
    out.nearest = open[0] || upcoming[0] || null;
    return out;
  }

  function cityList(list) {
    const seen = Object.create(null);
    const out = [];
    (list || []).forEach(function (announcement) {
      if (!announcement.city || seen[announcement.city]) return;
      seen[announcement.city] = true;
      out.push(announcement.city);
    });
    return out.sort(function (a, b) { return a.localeCompare(b, "tr"); });
  }

  function normalizeApplications(raw) {
    const out = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
    Object.keys(raw).forEach(function (id) {
      const value = raw[id];
      if (!value || typeof value !== "object") return;
      const status = APPLICATION_STATUSES.some(function (item) { return item.id === value.status; })
        ? value.status
        : "";
      const note = String(value.note == null ? "" : value.note).trim().slice(0, 600);
      if (!status && !note) return;
      out[id] = {
        status: status,
        note: note,
        updatedAt: String(value.updatedAt == null ? "" : value.updatedAt)
      };
    });
    return out;
  }

  function normalizeState(raw) {
    const input = raw && typeof raw === "object" ? raw : {};
    const favorites = Array.isArray(input.favorites) ? input.favorites : [];
    const theme = input.settings && ["auto", "light", "dark"].indexOf(input.settings.theme) >= 0
      ? input.settings.theme
      : "auto";
    return {
      profile: normalizeProfile(input.profile),
      favorites: Array.from(new Set(favorites.map(function (id) { return String(id); }).filter(Boolean))),
      applications: normalizeApplications(input.applications),
      settings: { theme: theme }
    };
  }

  function defaultState() {
    return {
      profile: defaultProfile(),
      favorites: [],
      applications: {},
      settings: { theme: "auto" }
    };
  }

  return {
    VERSION: VERSION,
    SCORE_TYPE: SCORE_TYPE,
    TYPES: TYPES,
    EDUCATION: EDUCATION,
    APPLICATION_STATUSES: APPLICATION_STATUSES,
    SORT_OPTIONS: SORT_OPTIONS,
    todayISO: todayISO,
    isISODate: isISODate,
    diffDays: diffDays,
    formatDateTR: formatDateTR,
    formatNumber: formatNumber,
    formatScore: formatScore,
    typeName: typeName,
    typeShort: typeShort,
    typeTone: typeTone,
    educationName: educationName,
    applicationStatusName: applicationStatusName,
    applicationStatusTone: applicationStatusTone,
    normalizeText: normalizeText,
    departmentMatches: departmentMatches,
    deadlineInfo: deadlineInfo,
    defaultProfile: defaultProfile,
    normalizeProfile: normalizeProfile,
    eligibility: eligibility,
    parseAnnouncement: parseAnnouncement,
    validateData: validateData,
    normalizeData: normalizeData,
    searchText: searchText,
    filterAnnouncements: filterAnnouncements,
    sortAnnouncements: sortAnnouncements,
    stats: stats,
    cityList: cityList,
    normalizeApplications: normalizeApplications,
    normalizeState: normalizeState,
    defaultState: defaultState
  };
});
