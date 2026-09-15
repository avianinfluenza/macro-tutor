// ==UserScript==
// @name         Tutor-T 자동 다음 영상 재생
// @namespace    local.tutor-t
// @version      1.3.1
// @description  Tutor-T의 AI 질문과 보충 영상을 자동 진행하고, 멈춘 영상 및 다음 강의를 자동 재생합니다.
// @match        https://tutor-t.thinkforbl.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  const CONFIG = {
    delayMs: 1200,
    interactionDelayMs: 500,
    resumeDelayMs: 1200,
    watchdogMs: 2000,
    debug: false,
    supplementalVideoSelector: '.cv-ix-popup-video',
    interactionSelectors: ['.cv-ix-q-standby-skip', '.cv-ix-popup-intro-btn'],
    nextSelectors: ['[aria-label*="다음"]', '[title*="다음"]', 'a[href*="lesson"]', 'a[href*="lecture"]', 'a[href*="course"]', 'button'],
  };
  const log = (...args) => CONFIG.debug && console.debug('[Tutor-T 자동재생]', ...args);
  const handledVideos = new WeakSet();
  const resumeTimers = new WeakMap();
  let handledMainVideo = null;
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
    setTimeout(() => {
      const next = findNextControl();
      if (!next) {
        navigationScheduled = false;
        log('다음 강의 컨트롤을 찾지 못했습니다.');
        return;
      }
      log('다음 강의 이동:', labelOf(next));
      next.click();
      navigationScheduled = false;
    }, CONFIG.delayMs);
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
  function findActiveVideo() {
    const videos = [...document.querySelectorAll('video')].filter((video) => visible(video) && !video.ended);
    return videos.find((video) => video.matches(CONFIG.supplementalVideoSelector)) || videos[0] || null;
  }
  function tryPlay(video) { video.muted = false; const result = video.play(); if (result?.catch) result.catch(() => log('브라우저 자동재생 정책으로 재생이 보류되었습니다.')); }
  function scheduleResume(video) {
    if (!video || video.ended || !video.paused || resumeTimers.has(video)) return;
    const timer = setTimeout(() => {
      resumeTimers.delete(video);
      if (video !== findActiveVideo() || video.ended || !video.paused || video.readyState < 2) return;
      log('멈춘 영상 재생 재시도');
      tryPlay(video);
    }, CONFIG.resumeDelayMs);
    resumeTimers.set(video, timer);
  }
  function attach(video) {
    if (handledVideos.has(video)) return;
    handledVideos.add(video);
    if (!video.matches(CONFIG.supplementalVideoSelector)) {
      if (video !== handledMainVideo) navigationScheduled = false;
      handledMainVideo = video;
      video.addEventListener('ended', goNext, { once: false });
    }
    video.addEventListener('pause', () => scheduleResume(video));
    video.addEventListener('canplay', () => scheduleResume(video));
    log('영상 감시 시작');
  }
  function scan() {
    const videos = [...document.querySelectorAll('video')];
    videos.forEach(attach);
    clickLearningInteraction();
    scheduleResume(findActiveVideo());
  }
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', scan);
  setInterval(() => scheduleResume(findActiveVideo()), CONFIG.watchdogMs);
})();
