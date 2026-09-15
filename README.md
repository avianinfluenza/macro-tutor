# Tutor-T 자동 학습 도우미

Tutor-T 강의를 연속으로 재생할 수 있도록 반복 동작을 자동화하는 Tampermonkey 사용자 스크립트입니다.

## 주요 기능

- AI 튜터 질문이 나타나면 **건너뛰기** 자동 클릭
- 보충 영상 안내가 나타나면 **보충 영상 시청** 자동 클릭
- 일시정지된 강의 및 보충 영상 자동 재생 재시도
- 강의가 끝나면 **다음 강의**로 자동 이동
- 다음 강의 영상 자동 재생 시도

## 설치 방법

1. Chrome 또는 Edge에 [Tampermonkey](https://www.tampermonkey.net/)를 설치합니다.
2. [사용자 스크립트 설치 링크](https://raw.githubusercontent.com/avianinfluenza/macro-tutor/master/tutor-t-auto-next.user.js)를 엽니다.
3. Tampermonkey 설치 화면에서 **설치**를 누릅니다.
4. Tutor-T 강의 페이지를 새로고침합니다.
5. 첫 영상은 직접 재생합니다.

## 업데이트 방법

위의 [사용자 스크립트 설치 링크](https://raw.githubusercontent.com/avianinfluenza/macro-tutor/master/tutor-t-auto-next.user.js)를 다시 열고 Tampermonkey에서 **업데이트** 또는 **재설치**를 누른 뒤, Tutor-T 페이지를 새로고침합니다.

## 동작 방식

스크립트는 Tutor-T 강의 페이지에서 영상과 학습 안내 버튼을 감시합니다. 보충 영상이 표시된 동안에는 보충 영상을 우선 재생하고, 본 강의가 끝나면 다음 강의로 이동합니다. 일시정지된 활성 영상은 일정 시간 후 자동으로 재생을 다시 시도합니다.

## 참고 사항

- 스크립트는 `https://tutor-t.thinkforbl.com/*`에서만 실행됩니다.
- 사용자가 직접 일시정지해도 자동으로 다시 재생됩니다.
- 브라우저의 자동 재생 정책에 따라 최초 재생은 직접 눌러야 할 수 있습니다.
- Tutor-T의 화면 구조가 변경되면 일부 기능이 동작하지 않을 수 있습니다.
