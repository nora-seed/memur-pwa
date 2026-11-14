const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../logic.js");

function ann(overrides) {
  return Object.assign({
    id: "ornek-1",
    institution: "Örnek Kurum",
    title: "Örnek Kadro",
    type: "kpss",
    city: "Ankara",
    quota: 10,
    education: "onlisans",
    departments: [],
    scoreType: "P93",
    requiredScore: 70,
    lastCutoff: 80,
    applicationStart: "2026-11-10",
    applicationEnd: "2026-11-20",
    examDate: "",
    resultDate: "",
    conditions: "Şartlar",
    description: "Açıklama",
    sourceUrl: "https://example.com",
    publishedAt: "2026-11-01",
    tags: [],
    sample: true
  }, overrides || {});
}

const profile = { education: "onlisans", department: "Büro Yönetimi", city: "Ankara", score: 75 };

test("tarih yardımcıları ve son başvuru durumu", function () {
  assert.equal(L.isISODate("2026-11-14"), true);
  assert.equal(L.isISODate("2026-02-30"), false);
  assert.equal(L.formatDateTR("2026-11-14"), "14/11/2026");
  assert.equal(L.diffDays("2026-11-14", "2026-11-20"), 6);

  const upcoming = L.deadlineInfo(ann({ applicationStart: "2026-11-20", applicationEnd: "2026-11-27" }), "2026-11-14");
  assert.equal(upcoming.state, "upcoming");
  assert.equal(upcoming.days, 6);

  const open = L.deadlineInfo(ann(), "2026-11-14");
  assert.equal(open.state, "open");
  assert.equal(open.days, 6);

  const lastDay = L.deadlineInfo(ann({ applicationEnd: "2026-11-14" }), "2026-11-14");
  assert.equal(lastDay.label, "Son gün bugün");

  const closed = L.deadlineInfo(ann({ applicationStart: "2026-10-01", applicationEnd: "2026-10-10" }), "2026-11-14");
  assert.equal(closed.state, "closed");
});

test("sayı ve puan biçimlendirme", function () {
  assert.equal(L.formatNumber(1234.5, 1), "1.234,5");
  assert.equal(L.formatNumber(70, 0), "70");
  assert.equal(L.formatScore(78.6), "78,6");
  assert.equal(L.formatScore(null), "—");
});

test("bölüm eşleşmesi ekleri ve kısaltmaları tolere eder", function () {
  assert.equal(L.departmentMatches([], "Büro Yönetimi"), true);
  assert.equal(L.departmentMatches(["Büro Yönetimi"], "Büro Yönetimi"), true);
  assert.equal(L.departmentMatches(["Yönetim"], "Büro Yönetimi"), true);
  assert.equal(L.departmentMatches(["Mühendislik"], "Bilgisayar Mühendisliği"), true);
  assert.equal(L.departmentMatches(["Muhasebe"], "Büro Yönetimi"), false);
  assert.equal(L.departmentMatches(["Büro"], ""), false);
});

test("uygunluk puan, mezuniyet ve bölümü birlikte değerlendirir", function () {
  assert.equal(L.eligibility(ann(), profile).status, "eligible");

  const low = L.eligibility(ann({ requiredScore: 80 }), profile);
  assert.equal(low.status, "low-score");
  assert.match(low.reason, /5,0 puan eksik/);

  assert.equal(L.eligibility(ann(), Object.assign({}, profile, { score: null })).status, "no-score");
  assert.equal(L.eligibility(ann({ education: "lisans" }), profile).status, "education");
  assert.equal(L.eligibility(ann({ departments: ["Muhasebe"] }), profile).status, "department");
  assert.equal(L.eligibility(ann({ departments: ["Büro"] }), Object.assign({}, profile, { department: "" })).status, "department-missing");
  assert.equal(L.eligibility(ann({ scoreType: "" }), Object.assign({}, profile, { score: null })).status, "eligible");
});

test("veri normalizasyonu geçersiz kayıtları ayıklar", function () {
  const raw = {
    version: 1,
    isSample: true,
    updatedAt: "2026-11-14",
    announcements: [
      ann(),
      ann({ id: "" }),
      ann({ id: "bozuk-tarih", applicationStart: "14.11.2026" }),
      ann({ id: "p3", scoreType: "P3" })
    ]
  };
  const data = L.normalizeData(raw);
  assert.equal(data.announcements.length, 2);
  assert.equal(data.announcements[1].scoreType, "");
  assert.equal(data.isSample, true);
});

test("validateData alan hatalarını ve tekrarlı ID'leri raporlar", function () {
  const good = L.validateData({ version: 1, announcements: [ann()] });
  assert.equal(good.ok, true);
  assert.equal(good.data.announcements.length, 1);

  const bad = L.validateData({
    version: 1,
    announcements: [
      ann({ id: "ayni" }),
      ann({ id: "ayni" }),
      ann({ id: "tur", type: "yanlis" }),
      ann({ id: "tarih", applicationEnd: "2026-13-01" }),
      ann({ id: "puan", requiredScore: 120 })
    ]
  });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some(function (e) { return e.field === "id" && /Tekrarlı/.test(e.message); }));
  assert.ok(bad.errors.some(function (e) { return e.field === "type"; }));
  assert.ok(bad.errors.some(function (e) { return e.field === "applicationEnd"; }));
  assert.ok(bad.errors.some(function (e) { return e.field === "requiredScore"; }));

  assert.equal(L.validateData({ version: 2, announcements: [] }).ok, false);
  assert.equal(L.validateData({ version: 1, announcements: {} }).ok, false);
});

test("filtreler arama, tür, şehir, durum ve favorileri uygular", function () {
  const list = [
    ann({ id: "a", institution: "Sağlık Bakanlığı", type: "sozlesmeli", city: "İstanbul", applicationStart: "2026-11-10", applicationEnd: "2026-11-25" }),
    ann({ id: "b", institution: "Adalet Bakanlığı", type: "kpss", city: "Ankara", applicationStart: "2026-11-20", applicationEnd: "2026-11-27" }),
    ann({ id: "c", institution: "PTT", type: "isci", city: "İzmir", scoreType: "", requiredScore: null, applicationStart: "2026-10-01", applicationEnd: "2026-10-10" })
  ];
  const favorites = new Set(["b"]);
  const applications = { b: { status: "applied", note: "" } };
  const today = "2026-11-14";

  assert.equal(L.filterAnnouncements(list, { query: "sağlık" }, profile, today, favorites, applications).length, 1);
  assert.equal(L.filterAnnouncements(list, { type: "isci" }, profile, today, favorites, applications)[0].id, "c");
  assert.equal(L.filterAnnouncements(list, { city: "Ankara" }, profile, today, favorites, applications)[0].id, "b");
  assert.equal(L.filterAnnouncements(list, { status: "open" }, profile, today, favorites, applications)[0].id, "a");
  assert.equal(L.filterAnnouncements(list, { status: "upcoming" }, profile, today, favorites, applications)[0].id, "b");
  assert.equal(L.filterAnnouncements(list, { onlyFavorites: true }, profile, today, favorites, applications)[0].id, "b");
  assert.equal(L.filterAnnouncements(list, { applicationStatus: "applied" }, profile, today, favorites, applications)[0].id, "b");
  assert.equal(L.filterAnnouncements(list, { eligibility: "eligible" }, profile, today, favorites, applications).length, 3);
});

test("sıralama açık, yaklaşan ve kapanmış ilanları doğru sıralar", function () {
  const list = [
    ann({ id: "closed", applicationStart: "2026-10-01", applicationEnd: "2026-10-10", publishedAt: "2026-11-13" }),
    ann({ id: "upcoming", applicationStart: "2026-11-18", applicationEnd: "2026-11-28", publishedAt: "2026-11-12" }),
    ann({ id: "open-late", applicationStart: "2026-11-01", applicationEnd: "2026-11-30", publishedAt: "2026-11-10" }),
    ann({ id: "open-soon", applicationStart: "2026-11-01", applicationEnd: "2026-11-20", publishedAt: "2026-11-11" })
  ];
  assert.deepEqual(
    L.sortAnnouncements(list, "deadline", "2026-11-14").map(function (a) { return a.id; }),
    ["open-soon", "open-late", "upcoming", "closed"]
  );
  assert.equal(L.sortAnnouncements(list, "published", "2026-11-14")[0].id, "closed");
  const scored = L.sortAnnouncements([
    ann({ id: "yuksek", requiredScore: 90 }),
    ann({ id: "dusuk", requiredScore: 60 }),
    ann({ id: "puan-yok", scoreType: "", requiredScore: null })
  ], "score", "2026-11-14");
  assert.deepEqual(scored.map(function (a) { return a.id; }), ["dusuk", "yuksek", "puan-yok"]);
});

test("istatistikler açık, uygun ve takip sayılarını toplar", function () {
  const list = [
    ann({ id: "open", applicationStart: "2026-11-10", applicationEnd: "2026-11-20" }),
    ann({ id: "upcoming", applicationStart: "2026-11-20", applicationEnd: "2026-11-27" }),
    ann({ id: "closed", applicationStart: "2026-10-01", applicationEnd: "2026-10-10" }),
    ann({ id: "lisans", education: "lisans", applicationStart: "2026-11-25", applicationEnd: "2026-12-01" })
  ];
  const s = L.stats(list, profile, "2026-11-14", new Set(["open"]), { open: { status: "applied" } });
  assert.equal(s.total, 4);
  assert.equal(s.open, 1);
  assert.equal(s.upcoming, 2);
  assert.equal(s.closed, 1);
  assert.equal(s.eligible, 3);
  assert.equal(s.eligibleOpen, 2);
  assert.equal(s.favorites, 1);
  assert.equal(s.applied, 1);
  assert.equal(s.nearest.id, "open");
});

test("profil ve durum normalizasyonu güvenli varsayılanlar kullanır", function () {
  assert.deepEqual(L.normalizeProfile(null), { education: "onlisans", department: "", city: "", score: null });
  assert.equal(L.normalizeProfile({ education: "lisans", score: 120 }).score, null);
  assert.equal(L.normalizeProfile({ education: "yanlis" }).education, "onlisans");

  const state = L.normalizeState({
    profile: { education: "onlisans", score: "78,6" },
    favorites: ["a", "a", "b"],
    applications: { a: { status: "applied", note: " deneme " }, b: { status: "yanlis" }, c: { note: "not" } },
    settings: { theme: "dark" }
  });
  assert.deepEqual(state.favorites, ["a", "b"]);
  assert.equal(state.profile.score, 78.6);
  assert.equal(state.applications.a.note, "deneme");
  assert.equal(state.applications.b, undefined);
  assert.equal(state.applications.c.status, "");
  assert.equal(state.settings.theme, "dark");
  assert.equal(L.normalizeState({ settings: { theme: "mavi" } }).settings.theme, "auto");
});

test("şehir listesi tekrarsız ve alfabetiktir", function () {
  const list = [ann({ city: "İzmir" }), ann({ city: "Ankara" }), ann({ city: "İzmir" }), ann({ city: "" })];
  assert.deepEqual(L.cityList(list), ["Ankara", "İzmir"]);
});
