function logoPath(teamName) { return "logo/" + teamName.toLowerCase() + ".png"; }

const _LOGO_SEED = {"play:3dmax":{"w":"13.22","h":"18"},"stats:3dmax":{"w":"8.82","h":"12"},"prop:3dmax":{"w":"12.12","h":"16.5"},"play:9ine":{"w":"18","h":"18"},"stats:9ine":{"w":"12","h":"12"},"prop:9ine":{"w":"16.5","h":"16.5"},"play:9z":{"w":"21.6","h":"18"},"stats:9z":{"w":"12","h":"10"},"prop:9z":{"w":"16.5","h":"13.75"},"play:anaheim":{"w":"12.42","h":"18"},"stats:anaheim":{"w":"8.28","h":"12"},"prop:anaheim":{"w":"11.38","h":"16.5"},"play:arizona":{"w":"18","h":"18"},"stats:arizona":{"w":"12","h":"12"},"prop:arizona":{"w":"16.5","h":"16.5"},"play:astralis":{"w":"14.76","h":"18"},"stats:astralis":{"w":"9.84","h":"12"},"prop:astralis":{"w":"13.53","h":"16.5"},"play:aurora":{"w":"18","h":"18"},"stats:aurora":{"w":"12","h":"12"},"prop:aurora":{"w":"16.5","h":"16.5"},"play:b8":{"w":"15.12","h":"18"},"stats:b8":{"w":"10.08","h":"12"},"prop:b8":{"w":"13.86","h":"16.5"},"play:bc.game":{"w":"18","h":"18"},"stats:bc.game":{"w":"12","h":"12"},"prop:bc.game":{"w":"16.5","h":"16.5"},"play:betboom":{"w":"20.16","h":"18"},"stats:betboom":{"w":"12","h":"10.71"},"prop:betboom":{"w":"16.5","h":"14.73"},"play:big":{"w":"12.6","h":"18"},"stats:big":{"w":"8.4","h":"12"},"prop:big":{"w":"11.55","h":"16.5"},"play:cleveland":{"w":"12.06","h":"18"},"stats:cleveland":{"w":"8.04","h":"12"},"prop:cleveland":{"w":"11.05","h":"16.5"},"play:cubs":{"w":"18","h":"18"},"stats:cubs":{"w":"12","h":"12"},"prop:cubs":{"w":"16.5","h":"16.5"},"play:ecstatic":{"w":"18","h":"18"},"stats:ecstatic":{"w":"12","h":"12"},"prop:ecstatic":{"w":"16.5","h":"16.5"},"play:ence":{"w":"18","h":"18"},"stats:ence":{"w":"12","h":"12"},"prop:ence":{"w":"16.5","h":"16.5"},"play:eyeballers":{"w":"12.86","h":"18"},"stats:eyeballers":{"w":"8.57","h":"12"},"prop:eyeballers":{"w":"11.79","h":"16.5"},"play:falcons":{"w":"14.76","h":"18"},"stats:falcons":{"w":"9.84","h":"12"},"prop:falcons":{"w":"13.53","h":"16.5"},"play:faze":{"w":"21.24","h":"18"},"stats:faze":{"w":"12","h":"10.17"},"prop:faze":{"w":"16.5","h":"13.98"},"play:flyquest":{"w":"18.36","h":"18"},"stats:flyquest":{"w":"12","h":"11.76"},"prop:flyquest":{"w":"16.5","h":"16.18"},"play:fnatic":{"w":"20.79","h":"13.5"},"stats:fnatic":{"w":"12","h":"7.79"},"prop:fnatic":{"w":"16.5","h":"10.71"},"play:furia":{"w":"18.36","h":"18"},"stats:furia":{"w":"12","h":"11.76"},"prop:furia":{"w":"16.5","h":"16.18"},"play:fut":{"w":"9.55","h":"18"},"stats:fut":{"w":"6.37","h":"12"},"prop:fut":{"w":"8.76","h":"16.5"},"play:g2":{"w":"15.84","h":"18"},"stats:g2":{"w":"10.56","h":"12"},"prop:g2":{"w":"14.52","h":"16.5"},"play:gaimin gladiators":{"w":"10.8","h":"18"},"stats:gaimin gladiators":{"w":"7.2","h":"12"},"prop:gaimin gladiators":{"w":"9.9","h":"16.5"},"play:gamerlegion":{"w":"24.57","h":"13.5"},"stats:gamerlegion":{"w":"12","h":"6.59"},"prop:gamerlegion":{"w":"16.5","h":"9.07"},"play:gentle mates":{"w":"18.72","h":"18"},"stats:gentle mates":{"w":"12","h":"11.54"},"prop:gentle mates":{"w":"16.5","h":"15.87"},"play:heroic":{"w":"20.52","h":"18"},"stats:heroic":{"w":"12","h":"10.53"},"prop:heroic":{"w":"16.5","h":"14.47"},"play:hotu":{"w":"18","h":"18"},"stats:hotu":{"w":"12","h":"12"},"prop:hotu":{"w":"16.5","h":"16.5"},"play:inner circle":{"w":"15.48","h":"18"},"stats:inner circle":{"w":"10.32","h":"12"},"prop:inner circle":{"w":"14.19","h":"16.5"},"play:legacy":{"w":"17.64","h":"18"},"stats:legacy":{"w":"11.76","h":"12"},"prop:legacy":{"w":"16.17","h":"16.5"},"play:liquid":{"w":"15.84","h":"18"},"stats:liquid":{"w":"10.56","h":"12"},"prop:liquid":{"w":"14.52","h":"16.5"},"play:los angeles":{"w":"12.6","h":"18"},"stats:los angeles":{"w":"8.4","h":"12"},"prop:los angeles":{"w":"11.55","h":"16.5"},"play:lynn vision":{"w":"19.98","h":"13.5"},"stats:lynn vision":{"w":"12","h":"8.11"},"prop:lynn vision":{"w":"16.5","h":"11.15"},"play:m80":{"w":"15.84","h":"18"},"stats:m80":{"w":"10.56","h":"12"},"prop:m80":{"w":"14.52","h":"16.5"},"play:milwaukee":{"w":"18","h":"18"},"stats:milwaukee":{"w":"12","h":"12"},"prop:milwaukee":{"w":"16.5","h":"16.5"},"play:mongolz":{"w":"14.04","h":"18"},"stats:mongolz":{"w":"9.36","h":"12"},"prop:mongolz":{"w":"12.87","h":"16.5"},"play:monte":{"w":"12.6","h":"18"},"stats:monte":{"w":"8.4","h":"12"},"prop:monte":{"w":"11.55","h":"16.5"},"play:mouz":{"w":"16.92","h":"18"},"stats:mouz":{"w":"11.28","h":"12"},"prop:mouz":{"w":"15.51","h":"16.5"},"play:natus vincere":{"w":"20.49","h":"18"},"stats:natus vincere":{"w":"12","h":"10.54"},"prop:natus vincere":{"w":"16.5","h":"14.5"},"play:nemiga":{"w":"18","h":"18"},"stats:nemiga":{"w":"12","h":"12"},"prop:nemiga":{"w":"16.5","h":"16.5"},"play:ninjas in pyjamas":{"w":"18","h":"18"},"stats:ninjas in pyjamas":{"w":"12","h":"12"},"prop:ninjas in pyjamas":{"w":"16.5","h":"16.5"},"play:nrg":{"w":"27","h":"6.48"},"stats:nrg":{"w":"12","h":"2.88"},"prop:nrg":{"w":"16.5","h":"3.96"},"play:og":{"w":"13.22","h":"18"},"stats:og":{"w":"8.82","h":"12"},"prop:og":{"w":"12.12","h":"16.5"},"play:pain":{"w":"20.25","h":"13.5"},"stats:pain":{"w":"12","h":"8"},"prop:pain":{"w":"16.5","h":"11"},"play:parivision":{"w":"20.16","h":"18"},"stats:parivision":{"w":"12","h":"10.71"},"prop:parivision":{"w":"16.5","h":"14.73"},"play:passion ua":{"w":"9.92","h":"18"},"stats:passion ua":{"w":"6.61","h":"12"},"prop:passion ua":{"w":"9.09","h":"16.5"},"play:pittsburgh":{"w":"18","h":"18"},"stats:pittsburgh":{"w":"12","h":"12"},"prop:pittsburgh":{"w":"16.5","h":"16.5"},"play:seattle":{"w":"10.08","h":"18"},"stats:seattle":{"w":"6.72","h":"12"},"prop:seattle":{"w":"9.24","h":"16.5"},"play:semperfi":{"w":"11.39","h":"18"},"stats:semperfi":{"w":"7.59","h":"12"},"prop:semperfi":{"w":"10.44","h":"16.5"},"play:sinners":{"w":"14.04","h":"18"},"stats:sinners":{"w":"9.36","h":"12"},"prop:sinners":{"w":"12.87","h":"16.5"},"play:spirit":{"w":"15.48","h":"18"},"stats:spirit":{"w":"10.32","h":"12"},"prop:spirit":{"w":"14.19","h":"16.5"},"play:tampa bay":{"w":"18","h":"18"},"stats:tampa bay":{"w":"12","h":"12"},"prop:tampa bay":{"w":"16.5","h":"16.5"},"play:texas":{"w":"18","h":"18"},"stats:texas":{"w":"12","h":"12"},"prop:texas":{"w":"16.5","h":"16.5"},"play:tnl":{"w":"23.49","h":"13.5"},"stats:tnl":{"w":"12","h":"6.9"},"prop:tnl":{"w":"16.5","h":"9.48"},"play:tyloo":{"w":"20.16","h":"18"},"stats:tyloo":{"w":"12","h":"10.71"},"prop:tyloo":{"w":"16.5","h":"14.73"},"play:virtus.pro":{"w":"18.36","h":"18"},"stats:virtus.pro":{"w":"12","h":"11.76"},"prop:virtus.pro":{"w":"16.5","h":"16.18"},"play:vitality":{"w":"14.76","h":"18"},"stats:vitality":{"w":"9.84","h":"12"},"prop:vitality":{"w":"13.53","h":"16.5"},"play:washington":{"w":"18","h":"18"},"stats:washington":{"w":"12","h":"12"},"prop:washington":{"w":"16.5","h":"16.5"},"play:white sox":{"w":"13.12","h":"18"},"stats:white sox":{"w":"8.75","h":"12"},"prop:white sox":{"w":"12.03","h":"16.5"}};
const logoSizeCache = (() => {
  try { return Object.assign(Object.create(null), _LOGO_SEED, JSON.parse(localStorage.getItem('lsc') || '{}')); } catch { return Object.assign(Object.create(null), _LOGO_SEED); }
})();
let _lscSaveTimer = 0;
function scheduleLscSave() {
  clearTimeout(_lscSaveTimer);
  _lscSaveTimer = setTimeout(() => { try { localStorage.setItem('lsc', JSON.stringify(logoSizeCache)); } catch {} }, 500);
}

function playLogoCacheKey(teamName) {
  return "play:" + String(teamName).toLowerCase();
}
function statsLogoCacheKey(teamName) {
  return "stats:" + String(teamName).toLowerCase();
}
function cachedPlayLogoInlineStyle(cacheKey) {
  const c = logoSizeCache[cacheKey];
  return c ? `width:${c.w}px;height:${c.h}px` : "width:36px;height:24px";
}
function cachedStatsLogoInlineStyle(cacheKey) {
  const c = logoSizeCache[cacheKey];
  return c ? `width:${c.w}px;height:${c.h}px` : "width:16px;height:16px";
}
function cachedPropLogoInlineStyle(cacheKey) {
  const c = logoSizeCache[cacheKey];
  return c ? `width:${c.w}px;height:${c.h}px` : "";
}
function playLogoImgHTML(teamName) {
  if (!teamName) return "";
  const key = playLogoCacheKey(teamName);
  const st = cachedPlayLogoInlineStyle(key);
  return `<span class="logo-slot"><img class="team-logo" src="${logoPath(teamName)}" alt="" data-logo-cache="${key}" style="${st}" width="36" height="24" decoding="sync" onload="normalizeLogo(this)" onerror="this.parentElement.style.display='none'"></span>`;
}

function resolveLogoSlot(img) {
  if (img.closest(".stats-card-body")) return { maxW: 16, maxH: 16 };
  if (img.closest(".play-cell") || img.closest(".bet-search-drop-item")) return { maxW: 48, maxH: 24 };
  return { maxW: 22, maxH: 22 };
}

const LOGO_DISPLAY_FACTOR = 0.75;
const WIDE_PLAY_LOGO_FACTOR = 0.75;
const WIDE_PLAY_ASPECT_MIN = 1.35;

function computeLogoDisplaySize(w, h, maxW, maxH, opts) {
  const sw = maxW / w;
  const sh = maxH / h;
  const s0 = Math.min(sw, sh);
  const widthLimited = sw <= sh + 1e-9;
  const heightLimited = sh < sw - 1e-9;
  let s = s0 * LOGO_DISPLAY_FACTOR;
  if (opts && opts.shrinkWidePlayLogos) {
    const wideAspect = w / h >= WIDE_PLAY_ASPECT_MIN;
    if (widthLimited || (heightLimited && wideAspect)) s *= WIDE_PLAY_LOGO_FACTOR;
  }
  const bw = w * s;
  const bh = h * s;
  return {
    w: stripTrailing(bw.toFixed(2)),
    h: stripTrailing(bh.toFixed(2))
  };
}

const LOGO_ALPHA_TRIM_THRESHOLD = 10;
const LOGO_TRIM_MIN_CONTENT_RATIO = 0.72;

function getLogoAlphaBoundingBox(imageData, w, h) {
  const d = imageData.data;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w * 4;
    for (let x = 0; x < w; x++) {
      if (d[row + x * 4 + 3] > LOGO_ALPHA_TRIM_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return null;
  return { minX, minY, effW: maxX - minX + 1, effH: maxY - minY + 1 };
}

function tryReplaceWithAlphaTrimmed(img) {
  const w = img.naturalWidth, h = img.naturalHeight;
  if (w < 2 || h < 2 || w * h > 2_500_000) return null;
  let canvas, ctx;
  try {
    canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);
    const box = getLogoAlphaBoundingBox(imageData, w, h);
    if (!box) return null;
    const contentRatio = (box.effW * box.effH) / (w * h);
    if (contentRatio >= LOGO_TRIM_MIN_CONTENT_RATIO) return null;
    const c2 = document.createElement("canvas");
    c2.width = box.effW;
    c2.height = box.effH;
    c2.getContext("2d").drawImage(img, box.minX, box.minY, box.effW, box.effH, 0, 0, box.effW, box.effH);
    return c2.toDataURL("image/png");
  } catch {
    return null;
  }
}

function normalizeLogo(img) {
  img.style.transform = "";
  const w0 = img.naturalWidth, h0 = img.naturalHeight;
  if (!w0 || !h0) return;

  if (!img.dataset.logoAlphaProcessed) {
    img.dataset.logoAlphaProcessed = "1";
    const trimmed = tryReplaceWithAlphaTrimmed(img);
    if (trimmed) {
      img.src = trimmed;
      return;
    }
  }

  const w = img.naturalWidth, h = img.naturalHeight;
  if (!w || !h) return;
  const { maxW, maxH } = resolveLogoSlot(img);
  const playLike = img.closest(".play-cell") || img.closest(".bet-search-drop-item");
  const { w: dw, h: dh } = computeLogoDisplaySize(w, h, maxW, maxH, {
    shrinkWidePlayLogos: !!playLike
  });
  img.style.width = dw + "px";
  img.style.height = dh + "px";
  if (img.dataset.logoCache) {
    logoSizeCache[img.dataset.logoCache] = { w: dw, h: dh };
    scheduleLscSave();
  }
}
