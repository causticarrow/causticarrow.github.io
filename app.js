document.title = "@causticarrow \u00b7 esports";

let gameFilter = "all";
let bets = [];

const feed = document.querySelector("#betFeed");
const recordPill = document.querySelector("#recordPill");
const netProfit = document.querySelector("#netProfit");
const roi = document.querySelector("#roi");
const winRate = document.querySelector("#winRate");
const risked = document.querySelector("#risked");
let currentCopyText = "";

function moneyline(odds) {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

function stripTrailing(value) {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function units(value, signed = false) {
  const sign = value > 0 && signed ? "+" : "";
  return `${sign}${stripTrailing(value)}u`;
}

function pct(value, signed = false) {
  const sign = value > 0 && signed ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function riskForOdds(odds, isExtra) {
  const base = isExtra ? 0.5 : 1;
  return odds > 0 ? base * 100 / odds : base * Math.abs(odds) / 100;
}

function profitForBet(bet) {
  if (bet.result === "pending" || bet.result === "push") return 0;
  if (bet.result === "lost") return -bet.risk;
  if (bet.odds > 0) return bet.risk * bet.odds / 100;
  return bet.risk * 100 / Math.abs(bet.odds);
}

function americanToDecimal(american) {
  return american > 0 ? 1 + american / 100 : 1 + 100 / Math.abs(american);
}

/** -110/-110 overround (22/21). Infer the other side of a 2-way close. */
function closeMarketDecimals(closeAmerican) {
  const overround = 22 / 21;
  const ours = americanToDecimal(closeAmerican);
  const otherProb = overround - 1 / ours;
  if (!(otherProb > 0 && otherProb < 1)) return null;
  return [ours, 1 / otherProb];
}

/** Power/log de-vig: solve Σ(1/Oᵢ)^c = 1, fair Oᶠ = Oᵢ^c. */
function powerFairDecimal(decimals, sideIndex = 0) {
  const inv = decimals.map((d) => 1 / d);
  const sumAt = (c) => inv.reduce((sum, x) => sum + x ** c, 0);
  if (Math.abs(sumAt(1) - 1) < 1e-12) return decimals[sideIndex];

  let lo = 1;
  let hi = 2;
  while (sumAt(hi) > 1 && hi < 1e6) hi *= 2;
  if (sumAt(1) < 1) {
    lo = 0;
    hi = 1;
    while (sumAt(lo) < 1 && lo > 1e-12) lo /= 2;
  }
  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2;
    if (sumAt(mid) > 1) lo = mid;
    else hi = mid;
  }
  const c = (lo + hi) / 2;
  return decimals[sideIndex] ** c;
}

/**
 * No-vig close fair probability for our side.
 * Closing line assumes -110/-110 vig; other side inferred from overround,
 * then power de-vig: Σ(1/Oᵢ)^c = 1, Oᶠ = Oᵢ^c, p = 1/Oᶠ.
 */
function fairCloseProb(closeAmerican) {
  if (closeAmerican == null || closeAmerican === "" || Number.isNaN(Number(closeAmerican))) {
    return null;
  }
  const market = closeMarketDecimals(Number(closeAmerican));
  if (!market) return null;
  const fair = powerFairDecimal(market, 0);
  if (!(fair > 1)) return null;
  return 1 / fair;
}

/**
 * CLV metrics vs no-vig close:
 * - probEdge: p_fair − p_taken (percentage points) → No-Vig CLV
 * - roiEdge: D_taken * p_fair − 1 → Expected ROI / EV
 */
function clvMetrics(takenAmerican, closeAmerican) {
  const pFair = fairCloseProb(closeAmerican);
  if (pFair == null) return null;
  const takenDec = americanToDecimal(takenAmerican);
  return {
    probEdge: pFair - 1 / takenDec,
    roiEdge: takenDec * pFair - 1
  };
}

function maxDrawdownPct(items) {
  const settled = items
    .map((bet, index) => ({ bet, index }))
    .filter(({ bet }) => bet.result !== "pending" && bet.result !== "push")
    .sort((a, b) => a.bet.date.localeCompare(b.bet.date) || a.index - b.index);

  let equity = 0;
  let peak = 0;
  let maxDd = 0;
  settled.forEach(({ bet }) => {
    equity += profitForBet(bet);
    if (equity > peak) peak = equity;
    const dd = peak - equity;
    if (dd > maxDd) maxDd = dd;
  });

  const risk = items.reduce((sum, bet) => sum + bet.risk, 0);
  return risk > 0 ? maxDd / risk * 100 : 0;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    year: "2-digit",
    month: "numeric",
    day: "numeric"
  }).format(date);
}

function logoPath(slug) {
  return `logo/${encodeURIComponent(slug)}.png`;
}

function detectResult(play, score) {
  if (!score) return "pending";
  const parts = score.split("-").map((part) => Number(part.trim()));
  if (parts.length < 2 || parts.some(Number.isNaN)) return "pending";
  let left = parts[0];
  const right = parts[1];
  const handicap = play.match(/\s([+-]\d+\.?\d*)\s+vs\.?\s+/i);
  if (handicap && !/\bPK\b/.test(play)) left += Number(handicap[1]);
  if (left > right) return "won";
  if (left < right) return "lost";
  return "push";
}

function normalizeTeamName(name) {
  return String(name || "")
    .replace(/\bNiP\b/gi, "Ninjas in Pyjamas")
    .replace(/\bNaVi\b/gi, "Natus Vincere")
    .replace(/\bDFM\b/gi, "Detonation FocusMe")
    .replace(/\s+/g, " ")
    .trim();
}

function logoSlug(name) {
  const aliases = {
    "bc game": "bc.game",
    "bc.game": "bc.game",
    "boom esports": "betboom",
    "dplus kia": "dplus",
    "gen g": "gen.g",
    geng: "gen.g",
    navi: "natus vincere",
    nip: "ninjas in pyjamas",
    pain: "paiN",
    "team spirit": "spirit",
    "xtreme gaming": "xtreme"
  };
  const key = normalizeTeamName(name).toLowerCase().replace(/[^a-z0-9.]+/g, " ").trim();
  return aliases[key] ?? key;
}

function parsePlay(play) {
  const cleaned = play.replace(/\s+/g, " ").trim();
  const parts = cleaned.split(/\s+vs\.?\s+/i);
  if (parts.length !== 2) {
    const totalMatch = cleaned.match(/^(.+?)\/(.+?)\s+(.+)$/);
    if (totalMatch) {
      return {
        away: normalizeTeamName(totalMatch[1]),
        home: normalizeTeamName(totalMatch[2]),
        pick: totalMatch[3]
      };
    }
    return { away: cleaned, home: "", pick: cleaned };
  }

  const left = parts[0];
  const right = normalizeTeamName(parts[1]);
  const leftMatch = left.match(/^(.+?)\s+(PK|[+-]\d+\.?\d*|Over\s+\d+\.?\d*|Under\s+\d+\.?\d*)$/i);
  const away = normalizeTeamName(leftMatch ? leftMatch[1] : left);
  const market = leftMatch ? leftMatch[2] : "";

  return {
    away,
    home: right,
    pick: market ? `${away} ${market}` : cleaned
  };
}

function loadBets() {
  if (!Array.isArray(window.RAW_PICKS)) throw new Error("Could not load bet data.");
  bets = window.RAW_PICKS.map((raw) => {
    const parsed = parsePlay(raw.play);
    const result = raw.result || detectResult(raw.play, raw.score);
    return {
      date: raw.date,
      event: raw.tournament,
      game: raw.game || "Other",
      away: parsed.away,
      awayLogo: logoSlug(parsed.away),
      home: parsed.home,
      homeLogo: logoSlug(parsed.home),
      pick: raw.detail ? `${parsed.pick} - ${raw.detail}` : parsed.pick,
      odds: raw.odds,
      close: raw.close == null || raw.close === "" ? null : Number(raw.close),
      risk: riskForOdds(raw.odds, !!raw.extra),
      isExtra: !!raw.extra,
      score: raw.score || "",
      result
    };
  });
  bets.forEach((bet) => {
    bet.clv = clvMetrics(bet.odds, bet.close);
  });
}

function filteredBets() {
  return bets.filter((bet) => gameFilter === "all" || bet.game === gameFilter);
}

function gameClass(game) {
  const key = String(game || "").toLowerCase();
  if (key === "cs2") return "game-cs2";
  if (key === "dota 2") return "game-dota";
  if (key === "lol" || key === "league") return "game-lol";
  if (key === "val") return "game-val";
  return "game-other";
}

function displayGameLabel(game) {
  if (game === "VAL") return "Val";
  return game;
}

function formatPickLabelHTML(bet) {
  let label = bet.pick;
  const teamPrefix = `${bet.away} `;
  if (label.toLowerCase().startsWith(teamPrefix.toLowerCase())) {
    label = label.slice(teamPrefix.length);
  }

  const detailIndex = label.indexOf(" - ");
  const market = detailIndex === -1 ? label : label.slice(0, detailIndex);
  const detail = detailIndex === -1 ? "" : label.slice(detailIndex + 3);
  const details = detail
    ? detail.split(/\s+-\s+/).map((part) => {
        const detailClass = part.toLowerCase() === "live" ? "market-detail is-live" : "market-detail";
        return `<span class="${detailClass}">${part}</span>`;
      }).join("")
    : "";

  return `<span class="market-type">${market}</span><span class="market-odds">${moneyline(bet.odds)}</span>${details}`;
}

function updateSummary(items) {
  const settled = items.filter((bet) => bet.result !== "pending" && bet.result !== "push");
  const wins = settled.filter((bet) => bet.result === "won").length;
  const losses = settled.filter((bet) => bet.result === "lost").length;
  const risk = items.reduce((sum, bet) => sum + bet.risk, 0);
  const pnl = items.reduce((sum, bet) => sum + profitForBet(bet), 0);
  const closedCount = wins + losses;
  const adjWins = closedCount > 0 ? (1.1 * closedCount + pnl) / 2.1 : 0;
  const adjLosses = Math.max(closedCount - adjWins, 0);
  const rate = (adjWins + adjLosses) > 0 ? adjWins / (adjWins + adjLosses) * 100 : 0;
  const roiValue = risk ? pnl / risk * 100 : 0;
  const sortedDates = [...items].map((bet) => bet.date).sort();
  const firstYear = sortedDates.length ? new Date(`${sortedDates[0]}T12:00:00`).getFullYear() : new Date().getFullYear();
  const lastYear = sortedDates.length ? new Date(`${sortedDates[sortedDates.length - 1]}T12:00:00`).getFullYear() : firstYear;
  const seasonLabel = firstYear === lastYear ? "ytd" : `${firstYear}-${String(lastYear).slice(2)}`;

  recordPill.textContent = `${Math.round(adjWins)}-${Math.round(adjLosses)}`;
  netProfit.textContent = units(pnl, true);
  roi.textContent = `${roiValue.toFixed(1)}%`;
  winRate.textContent = `${rate.toFixed(1)}%`;
  risked.textContent = units(risk);
  currentCopyText = `${seasonLabel} record: ${Math.round(adjWins)}-${Math.round(adjLosses)}, ${units(pnl, true)} // [archive](https://causticarrow.com)`;
  window.currentCopyText = currentCopyText;

  netProfit.className = pnl > 0 ? "positive" : pnl < 0 ? "negative" : "neutral";
  roi.className = pnl > 0 ? "positive" : pnl < 0 ? "negative" : "neutral";
}

function copyRecord() {
  const btn = document.querySelector(".copy-record-btn");
  const reset = (label) => {
    if (!btn) return;
    btn.textContent = label;
    setTimeout(() => {
      btn.textContent = "Copy Record";
      btn.classList.remove("copied");
    }, 2000);
  };
  const copied = () => {
    if (btn) btn.classList.add("copied");
    reset("Copied!");
  };
  const failed = () => reset("Failed");
  const fallbackCopy = () => {
    const textarea = document.createElement("textarea");
    textarea.value = currentCopyText;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    textarea.remove();
    ok ? copied() : failed();
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(currentCopyText).then(copied).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
}

function renderBetRow(bet) {
  const pnl = profitForBet(bet);
  const score = bet.score || "vs";
  const statusText = bet.result === "pending" ? "Pending" : `${bet.result} (${units(pnl, true)})`;

  return `
    <article class="bet-row ${gameClass(bet.game)} ${bet.isExtra ? "is-extra" : ""} ${bet.result === "won" ? "is-won" : bet.result === "lost" ? "is-lost" : ""}">
      <div>
        <div class="bet-topline">
          <div class="event-title">${bet.event}</div>
          <time class="bet-date" datetime="${bet.date}">${formatDate(bet.date)}</time>
        </div>
        <div class="event-line">
          <span class="event-meta">${displayGameLabel(bet.game)}</span>
          ${bet.isExtra ? `<span class="extra-badge">Extra</span>` : ""}
        </div>
      </div>
      <div class="team away">
        <div>
          <div class="team-name">${bet.away}</div>
          <div class="market-note">${formatPickLabelHTML(bet)}</div>
        </div>
        <span class="logo-box"><img src="${logoPath(bet.awayLogo)}" alt="" width="44" height="44" loading="lazy" decoding="async" onerror="this.style.display='none'"></span>
      </div>
      <div class="score">
        <span>${score}</span>
      </div>
      <div class="team home">
        <span class="logo-box"><img src="${logoPath(bet.homeLogo)}" alt="" width="44" height="44" loading="lazy" decoding="async" onerror="this.style.display='none'"></span>
        <div>
          <div class="team-name">${bet.home || "Market"}</div>
        </div>
      </div>
      <div class="status ${bet.result}">${statusText}</div>
    </article>
  `;
}

function render() {
  const items = filteredBets();
  updateSummary(items);

  if (!items.length) {
    feed.innerHTML = `<div class="empty-state">No bets match the current filters.</div>`;
    return;
  }

  const groups = new Map();
  items.forEach((bet) => {
    if (!groups.has(bet.date)) groups.set(bet.date, []);
    groups.get(bet.date).push(bet);
  });

  feed.innerHTML = [...groups.entries()].map(([date, group]) => `
    <section class="day-group">
      <div class="day-heading">${formatDate(date)}</div>
      ${group.map(renderBetRow).join("")}
    </section>
  `).join("");
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("is-active"));
    button.classList.add("is-active");
    gameFilter = button.dataset.filter;
    render();
  });
});

function revealWhenReady() {
  const reveal = () => document.documentElement.classList.remove("booting");
  if (!(document.fonts && document.fonts.load)) {
    reveal();
    return;
  }
  const loads = Promise.all([
    document.fonts.load("400 1em Radiance"),
    document.fonts.load("700 1em Radiance"),
    document.fonts.load("900 1em Radiance"),
    document.fonts.load("400 1em Reaver"),
    document.fonts.load("600 1em Reaver"),
    document.fonts.load("700 1em Reaver")
  ]);
  Promise.race([
    loads.then(() => document.fonts.ready),
    new Promise((resolve) => setTimeout(resolve, 1800))
  ]).then(reveal).catch(reveal);
}

try {
  loadBets();
  render();
} catch (error) {
  feed.innerHTML = `<div class="empty-state">${error.message}</div>`;
}
revealWhenReady();
/* d705314319cf */
