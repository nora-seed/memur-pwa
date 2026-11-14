const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM, VirtualConsole } = require("jsdom");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const logicSrc = fs.readFileSync(path.join(root, "logic.js"), "utf8");
const appSrc = fs.readFileSync(path.join(root, "app.js"), "utf8");
const dataRaw = JSON.parse(fs.readFileSync(path.join(root, "data.json"), "utf8"));

function flush() {
  return new Promise(function (resolve) { setTimeout(resolve, 10); });
}

async function setup() {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", function (error) { errors.push(error); });
  virtualConsole.on("error", function (error) { errors.push(error); });

  const dom = new JSDOM(html, {
    url: "https://example.test/",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: virtualConsole
  });

  const window = dom.window;
  window.matchMedia = function () {
    return {
      matches: false,
      addEventListener: function () {},
      removeEventListener: function () {},
      addListener: function () {},
      removeListener: function () {}
    };
  };
  window.fetch = function () {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: function () { return Promise.resolve(JSON.parse(JSON.stringify(dataRaw))); }
    });
  };
  window.confirm = function () { return true; };
  window.addEventListener("error", function (event) { errors.push(event.error || event.message); });

  window.eval(logicSrc);
  window.eval(appSrc);
  await flush();
  await flush();

  return { dom: dom, window: window, document: window.document, errors: errors };
}

function navigate(window, hash) {
  window.location.hash = hash;
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
}

function storedState(window) {
  return JSON.parse(window.localStorage.getItem("memurAlim.v1"));
}

test("panel örnek ilanları, kahraman alanını ve istatistikleri gösterir", async function () {
  const ctx = await setup();
  const view = ctx.document.getElementById("view");

  assert.match(view.textContent, /Memur Alım/);
  assert.ok(view.querySelector(".hero"), "kahraman alanı yok");
  assert.ok(view.querySelectorAll(".stat").length >= 4, "istatistik kartları eksik");
  assert.ok(view.querySelectorAll(".ann-card").length > 0, "ilan kartı yok");
  assert.match(view.textContent, /Beden İşçisi/);
  assert.equal(ctx.errors.length, 0, String(ctx.errors[0]));
});

test("İlanlar sekmesi arama, tür çipleri ve sıralama gösterir", async function () {
  const ctx = await setup();
  navigate(ctx.window, "#ilanlar");

  const view = ctx.document.getElementById("view");
  assert.ok(ctx.document.getElementById("searchInput"), "arama alanı yok");
  assert.ok(view.querySelector(".filter-btn"), "filtre düğmesi yok");
  assert.ok(ctx.document.getElementById("sortSelect"), "sıralama seçimi yok");
  assert.ok(view.querySelectorAll(".type-chips .chip").length >= 4, "tür çipleri eksik");
  assert.ok(view.querySelectorAll(".ann-card").length > 0, "filtrelenmiş ilan yok");

  const tab = ctx.document.querySelector('.tab[data-nav="ilanlar"]');
  assert.ok(tab.classList.contains("active"), "sekme etkin değil");
});

test("favori düğmesi durumu kaydeder ve yıldızı etkinleştirir", async function () {
  const ctx = await setup();
  navigate(ctx.window, "#ilanlar");

  const fav = ctx.document.querySelector(".ann-fav");
  assert.ok(fav, "favori düğmesi yok");
  const id = fav.getAttribute("data-id");
  fav.click();

  const state = storedState(ctx.window);
  assert.deepEqual(state.favorites, [id]);

  const next = ctx.document.querySelector('.ann-fav[data-id="' + id + '"]');
  assert.ok(next.classList.contains("active"), "favori etkin görünmüyor");
});

test("ilan detayı açılır ve başvuru durumu kaydedilir", async function () {
  const ctx = await setup();
  navigate(ctx.window, "#ilanlar");

  const main = ctx.document.querySelector(".ann-main");
  const id = main.getAttribute("data-id");
  main.click();

  const overlay = ctx.document.getElementById("overlay");
  assert.ok(!overlay.classList.contains("hidden"), "detay katmanı açılmadı");
  assert.ok(ctx.document.getElementById("sheetTitle"), "detay başlığı yok");
  assert.match(ctx.document.getElementById("sheetBody").textContent, /Başvuru durumu/);

  ctx.document.getElementById("appStatus").value = "applied";
  ctx.document.getElementById("appNote").value = "Evrak hazır";
  ctx.document.getElementById("applicationForm").dispatchEvent(
    new ctx.window.Event("submit", { bubbles: true, cancelable: true })
  );

  const state = storedState(ctx.window);
  assert.equal(state.applications[id].status, "applied");
  assert.equal(state.applications[id].note, "Evrak hazır");
  assert.ok(overlay.classList.contains("hidden"), "detay katmanı kapanmadı");
});

test("profil formu P93 puanını ve bölümü kaydeder", async function () {
  const ctx = await setup();
  navigate(ctx.window, "#profil");

  ctx.document.getElementById("profileScore").value = "82,5";
  ctx.document.getElementById("profileDepartment").value = "Büro Yönetimi";
  ctx.document.getElementById("profileForm").dispatchEvent(
    new ctx.window.Event("submit", { bubbles: true, cancelable: true })
  );

  const state = storedState(ctx.window);
  assert.equal(state.profile.score, 82.5);
  assert.equal(state.profile.department, "Büro Yönetimi");
});

test("tema düğmesi koyu temaya geçer", async function () {
  const ctx = await setup();
  const before = ctx.document.documentElement.dataset.theme;
  ctx.document.getElementById("themeBtn").click();
  const after = ctx.document.documentElement.dataset.theme;

  assert.notEqual(after, before);
  assert.equal(storedState(ctx.window).settings.theme, after);
});

test("filtre paneli şehir filtresini uygular", async function () {
  const ctx = await setup();
  navigate(ctx.window, "#ilanlar");

  ctx.document.querySelector(".filter-btn").click();
  const form = ctx.document.getElementById("filterForm");
  assert.ok(form, "filtre formu açılmadı");

  form.elements.city.value = "İstanbul";
  form.dispatchEvent(new ctx.window.Event("submit", { bubbles: true, cancelable: true }));

  const chips = ctx.document.querySelectorAll(".active-filters .chip");
  assert.equal(chips.length, 1);
  assert.match(chips[0].textContent, /İstanbul/);
  assert.ok(ctx.document.querySelectorAll(".ann-card").length > 0, "filtre sonrası ilan yok");
});
