document.title = "@causticarrow \u00b7 esports";

let gameFilter = "all";
let bets = [];

const feed = document.querySelector("#betFeed");
const recordPill = document.querySelector("#recordPill");
const netProfit = document.querySelector("#netProfit");
const roi = document.querySelector("#roi");
const winRate = document.querySelector("#winRate");
const risked = document.querySelector("#risked");
const equityChart = document.querySelector("#equityChart");
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

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
    .sort((a, b) => chartBetComparator(a.bet, b.bet) || a.index - b.index);

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
  if (handicap) left += Number(handicap[1]);
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
  const leftMatch = left.match(/^(.+?)\s+([+-]\d+\.?\d*|Over\s+\d+\.?\d*|Under\s+\d+\.?\d*)$/i);
  const away = normalizeTeamName(leftMatch ? leftMatch[1] : left);
  const market = leftMatch ? leftMatch[2] : "";

  return {
    away,
    home: right,
    pick: market ? `${away} ${market}` : ""
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
  return bets
    .filter((bet) => gameFilter === "all" || bet.game === gameFilter)
    .sort(displayBetComparator);
}

function selectedTeamName(bet) {
  return normalizeTeamName(bet.away || "");
}

function compareSelectedTeamDesc(a, b) {
  return selectedTeamName(b).localeCompare(selectedTeamName(a), undefined, { sensitivity: "base" });
}

function displayBetComparator(a, b) {
  return b.date.localeCompare(a.date) || compareSelectedTeamDesc(a, b);
}

function chartBetComparator(a, b) {
  return a.date.localeCompare(b.date) || compareSelectedTeamDesc(a, b);
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

  const marketType = market ? `<span class="market-type">${market}</span>` : "";
  return `${marketType}<span class="market-odds">${moneyline(bet.odds)}</span>${details}`;
}

function equitySeries(items) {
  const settled = items
    .map((bet, index) => ({ bet, index }))
    .filter(({ bet }) => bet.result !== "pending" && bet.result !== "push")
    .sort((a, b) => chartBetComparator(a.bet, b.bet) || a.index - b.index);

  const points = [{ date: settled[0]?.bet.date || "", equity: 0 }];
  let equity = 0;
  settled.forEach(({ bet }) => {
    equity += profitForBet(bet);
    points.push({ date: bet.date, equity, bet });
  });
  return points;
}

function equitySign(value) {
  if (Math.abs(value) < 1e-9) return 0;
  return value > 0 ? 1 : -1;
}

function equitySignClass(sign) {
  if (sign > 0) return "is-pos";
  if (sign < 0) return "is-neg";
  return "is-zero";
}

function equitySegments(points, xAt, yAt, zeroY) {
  const segments = [];
  if (!points.length) return segments;

  let current = {
    sign: equitySign(points[0].equity),
    pts: [{ x: xAt(0), y: yAt(points[0].equity), v: points[0].equity }]
  };

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1].equity;
    const next = points[i].equity;
    const sp = equitySign(prev);
    const sn = equitySign(next);
    const x0 = xAt(i - 1);
    const x1 = xAt(i);
    const y1 = yAt(next);

    if (sp !== 0 && sn !== 0 && sp !== sn) {
      const t = prev / (prev - next);
      const xc = x0 + t * (x1 - x0);
      current.pts.push({ x: xc, y: zeroY, v: 0 });
      segments.push(current);
      current = {
        sign: sn,
        pts: [{ x: xc, y: zeroY, v: 0 }, { x: x1, y: y1, v: next }]
      };
      continue;
    }

    if (sp === 0 && sn !== 0) {
      segments.push(current);
      current = {
        sign: sn,
        pts: [{ x: x0, y: zeroY, v: 0 }, { x: x1, y: y1, v: next }]
      };
      continue;
    }

    if (sp !== 0 && sn === 0) {
      current.pts.push({ x: x1, y: zeroY, v: 0 });
      segments.push(current);
      current = { sign: 0, pts: [{ x: x1, y: zeroY, v: 0 }] };
      continue;
    }

    current.pts.push({ x: x1, y: y1, v: next });
  }

  segments.push(current);
  return segments.filter((segment) => segment.pts.length >= 2 || segment.sign === 0);
}

function renderEquityChart(items) {
  if (!equityChart) return;

  const points = equitySeries(items);
  const last = points[points.length - 1]?.equity || 0;

  const width = Math.max(equityChart.clientWidth || 640, 280);
  const height = Math.max(equityChart.clientHeight || 132, 96);
  const pad = { top: 10, right: 12, bottom: 22, left: 12 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  let min = Math.min(0, ...points.map((p) => p.equity));
  let max = Math.max(0, ...points.map((p) => p.equity));
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  min -= span * 0.08;
  max += span * 0.08;

  const xAt = (i) => pad.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yAt = (v) => pad.top + (max - v) / (max - min) * innerH;
  const zeroY = yAt(0);
  const segments = equitySegments(points, xAt, yAt, zeroY);
  const startDate = points.find((p) => p.date)?.date;
  const endDate = [...points].reverse().find((p) => p.date)?.date;
  const lastSign = equitySign(last);

  const pathFor = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const areaFor = (pts) => {
    if (pts.length < 2) return "";
    const line = pathFor(pts);
    const lastPt = pts[pts.length - 1];
    const firstPt = pts[0];
    return `${line} L${lastPt.x.toFixed(2)},${zeroY.toFixed(2)} L${firstPt.x.toFixed(2)},${zeroY.toFixed(2)} Z`;
  };
  const tooltipFor = (point, index) => {
    if (!point.bet) return "";
    const x = xAt(index);
    const y = yAt(point.equity);
    const tooltipW = 138;
    const tooltipH = 40;
    const tx = Math.min(Math.max(x - tooltipW / 2, pad.left), width - pad.right - tooltipW);
    const ty = y - tooltipH - 10 < pad.top ? y + 10 : y - tooltipH - 10;
    const leftBound = index === 0 ? pad.left : (xAt(index - 1) + x) / 2;
    const rightBound = index === points.length - 1 ? width - pad.right : (x + xAt(index + 1)) / 2;
    const signClass = equitySignClass(equitySign(point.equity));
    const title = `${formatDate(point.date)} ${selectedTeamName(point.bet)}`;
    return `
      <g class="equity-point ${signClass}">
        <rect class="equity-hover-target" x="${leftBound.toFixed(2)}" y="${pad.top}" width="${(rightBound - leftBound).toFixed(2)}" height="${innerH.toFixed(2)}"></rect>
        <line class="equity-hover-line" x1="${x.toFixed(2)}" y1="${pad.top}" x2="${x.toFixed(2)}" y2="${(height - pad.bottom).toFixed(2)}"></line>
        <circle class="equity-hover-dot" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.5"></circle>
        <g class="equity-tooltip" transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)})">
          <rect width="${tooltipW}" height="${tooltipH}" rx="4"></rect>
          <text x="8" y="15">${escapeHTML(title)}</text>
          <text x="8" y="31">${escapeHTML(units(point.equity, true))}</text>
        </g>
      </g>
    `;
  };

  equityChart.setAttribute("viewBox", `0 0 ${width} ${height}`);
  equityChart.innerHTML = `
    <line class="equity-zero" x1="${pad.left}" y1="${zeroY.toFixed(2)}" x2="${(width - pad.right).toFixed(2)}" y2="${zeroY.toFixed(2)}"></line>
    ${segments.map((segment) => {
      if (segment.sign === 0 || segment.pts.length < 2) return "";
      return `<path class="equity-fill ${equitySignClass(segment.sign)}" d="${areaFor(segment.pts)}"></path>`;
    }).join("")}
    ${segments.map((segment) => {
      if (segment.pts.length < 2) return "";
      return `<path class="equity-line ${equitySignClass(segment.sign)}" d="${pathFor(segment.pts)}"></path>`;
    }).join("")}
    <circle class="equity-dot ${equitySignClass(lastSign)}" cx="${xAt(points.length - 1).toFixed(2)}" cy="${yAt(last).toFixed(2)}" r="3.5"></circle>
    <text class="equity-axis" x="${pad.left}" y="${(height - 6).toFixed(2)}" text-anchor="start">${startDate ? formatDate(startDate) : ""}</text>
    <text class="equity-axis" x="${(width - pad.right).toFixed(2)}" y="${(height - 6).toFixed(2)}" text-anchor="end">${endDate ? formatDate(endDate) : ""}</text>
    ${points.map(tooltipFor).join("")}
  `;
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
  renderEquityChart(items);
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
        <div class="team-copy">
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
        <div class="team-copy">
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
    feed.innerHTML = `<div class="empty-state">...</div>`;
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

window.addEventListener("resize", () => {
  if (bets.length) renderEquityChart(filteredBets());
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
