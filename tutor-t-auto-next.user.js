// ==UserScript==
// @name         Tutor-T 자동 다음 영상 재생
// @namespace    local.tutor-t
// @version      1.2.0
// @description  Tutor-T의 AI 튜터 질문과 보충 영상을 자동 진행하고, 강의가 끝나면 다음 영상을 재생합니다.
// @match        https://tutor-t.thinkforbl.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  const CONFIG = {
    delayMs: 1200,
    interactionDelayMs: 500,
    debug: false,
    interactionSelectors: ['.cv-ix-q-standby-skip', '.cv-ix-popup-intro-btn'],
    nextSelectors: ['[aria-label*="다음"]', '[title*="다음"]', 'a[href*="lesson"]', 'a[href*="lecture"]', 'a[href*="course"]', 'button'],
  };
  const log = (...args) => CONFIG.debug && console.debug('[Tutor-T 자동재생]', ...args);
  let handledVideo = null;
  let navigationScheduled = false;
  let interactionScheduled = false;
  let lastInteractionClickAt = 0;
  function visible(element) { if (!element) return false; const style = getComputedStyle(element); return style.display !== 'none' && style.visibility !== 'hidden' && element.getBoundingClientRect().width > 0; }
  function labelOf(element) { return [element.innerText, element.getAttribute('aria-label'), element.getAttribute('title')].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(); }
  function findNextControl() {
    const candidates = CONFIG.nextSelectors.flatMap((selector) => [...document.querySelectorAll(selector)]);
    const unique = [...new Set(candidates)].filter(visible);
    const strong = unique.find((element) => /다음|next|다음 강의|다음 영상/i.test(labelOf(element)));
    return strong || [...document.querySelectorAll('a, button, [role="button"]')].find((element) => visible(element) && /다음|next/i.test(labelOf(element)));
  }
  function goNext() {
    if (navigationScheduled) return;
    navigationScheduled = true;
    setTimeout(() => { const next = findNextControl(); if (!next) { navigationScheduled = false; log('다음 강의 컨트롤을 찾지 못했습니다.'); return; } log('다음 강의 이동:', labelOf(next)); next.click(); }, CONFIG.delayMs);
  }
  function clickLearningInteraction() {
    const control = CONFIG.interactionSelectors
      .map((selector) => document.querySelector(selector))
      .find((element) => element && visible(element) && !element.matches(':disabled'));
    if (!control || interactionScheduled) return;
    const cooldownMs = Math.max(0, 2000 - (Date.now() - lastInteractionClickAt));
    interactionScheduled = true;
    setTimeout(() => {
      interactionScheduled = false;
      if (!control.isConnected || !visible(control) || control.matches(':disabled')) return;
      lastInteractionClickAt = Date.now();
      log('학습 상호작용 자동 클릭:', labelOf(control));
      control.click();
      setTimeout(scan, 50);
    }, CONFIG.interactionDelayMs + cooldownMs);
  }
  function tryPlay(video) { video.muted = false; const result = video.play(); if (result?.catch) result.catch(() => log('브라우저 자동재생 정책으로 재생이 보류되었습니다.')); }
  function attach(video) {
    if (video === handledVideo) return;
    handledVideo = video; navigationScheduled = false; video.addEventListener('ended', goNext, { once: false });
    if (video.readyState >= 2 && video.paused) tryPlay(video); else video.addEventListener('canplay', () => video.paused && tryPlay(video), { once: true });
    log('영상 감시 시작');
  }
  function scan() { const video = document.querySelector('video'); if (video) attach(video); clickLearningInteraction(); }
  scan(); new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true }); window.addEventListener('load', scan);
})();
