# Opale

Redmine 6.x theme.

[![AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Linters](https://github.com/gagnieray/opale/actions/workflows/lint.yml/badge.svg)](https://github.com/gagnieray/opale/actions/workflows/lint.yml)
[![SCSS](https://img.shields.io/badge/SCSS%20code%20style-Standard-brightgreen.svg)](https://github.com/stylelint-scss/stylelint-config-standard-scss)
[![CSS](https://img.shields.io/badge/CSS%20code%20style-SMACSS-brightgreen.svg)](https://github.com/cahamilton/stylelint-config-property-sort-order-smacss)

---

![Screenshot](./screenshots/issues.png)

## 주요 기능

- 왼쪽 사이드바,
- 트래커(Tracker) 링크 색상 구분,
- Jira 스타일의 우선순위 아이콘,
- SCSS로 커스터마이징 가능.

## Install

이 theme를 설치하려면:

1. 아래 명령어를 실행하여 저장소를 클론합니다.

   ```bash
   git clone https://github.com/kjkim-dngv/opale.git
   ```

2. `Redmine > Administration > Settings > Display`로 이동하여 theme 목록에서 `Opale`을 선택하고 설정을 저장합니다.

## Customize

Opale을 필요에 맞게 커스터마이징하려면, 먼저 [Node.js](https://nodejs.org/)가 설치되어 있고 터미널에서 `npm`을 사용할 수 있어야 합니다.

그 다음, Opale이 들어있는 디렉토리에서 아래를 실행합니다:

```bash
npm install
```

> [!WARNING]
> production에서는 위 명령으로 생성되는 `node_module` 폴더를 절대 포함하지 마세요. 포함되어 있으면 assets precompilation 과정에서 timeout이 발생할 수 있습니다.

이제 필요한 의존성들이 준비되었을 것입니다. 한 번 더 아래 명령을 실행합니다:

```bash
npm run watch
```

이제 grunt가 `src/` 폴더에 있는 파일 변경을 감시합니다.

필요한 부분을 변경하면 Sass preprocessor가 자동으로 실행됩니다.

아쉽게도 Sass에서는 optional file include가 불가능하므로, 새 파일(예: `src/sass/_custom-variables.scss`)을 만들고, `src/sass/application.scss`의 맨 처음에 다음 at-use rule로 import 하는 것을 권장합니다: `@use "custom-variables";`.

이렇게 하면 `src/sass/_variables.scss`에 `!default` 플래그로 정의된 변수들을 `src/sass/_custom-variables.scss`에서 override 할 수 있습니다:

```scss
@use "variables" with (
  $sidebar-position: right,
  $brand-primary: #614ba6
);
```

경로 `src/sass/_custom-variables.scss`는 `.gitignore`에 추가되어 있으므로, Opale 소스에서 바뀐 부분이 `src/sass/application.scss` 맨 앞에 `@use "custom-variables";` 한 줄을 추가한 것뿐이라면, 변경 사항을 유지하면서 Opale을 업그레이드하는 작업이 꽤 수월해질 것입니다.

## Troubleshooting

**처음 설치할 때 서버 구성에 따라 CSS가 로드되지 않아 theme가 깨져 보일 수 있습니다.**

이는 Redmine이 theme의 assets를 제대로 컴파일하지 못해 발생합니다.

대부분 서버를 재시작하면 해결됩니다.

그래도 해결되지 않으면, 재시작 전에 서버에서 아래 명령을 실행하세요:

`bundle exec rake assets:precompile RAILS_ENV=production`

## Contributing

[Bug reports](https://github.com/gagnieray/opale/issues)와 [Pull requests](https://github.com/gagnieray/opale/pulls)를 환영합니다.
자세한 내용은 [contributing 안내](./CONTRIBUTING.md)를 참고하세요.

## Authors

[Authors 안내](./AUTHORS.md)에서 자세히 확인할 수 있습니다.

## Copying

Opale은 [Affero General Public License version 3](https://www.gnu.org/licenses/agpl-3.0) (AGPL v3)로 라이선스되며, 해당 라이선스 전문은 [LICENSE](./LICENSE)에서 확인할 수 있습니다. (또는 별도 표기가 없는 한, AGPL의 이후 버전도 적용됩니다.)

포함된 구성 요소의 라이선스:

- Normalize.css : [MIT License](https://github.com/necolas/normalize.css/blob/master/LICENSE.md),
- Bootstrap Mixins : [MIT License](https://github.com/twbs/bootstrap/blob/main/LICENSE),
- Tabler Icons: [MIT License](https://github.com/tabler/tabler-icons/blob/main/LICENSE).

위 프로젝트들에서 가져온 **수정되지 않은** 모든 파일은 원저작권 및 라이선스 고지 문구를 그대로 유지합니다: 자세한 내용은 `src/sass/vendor/` 내의 해당 소스 파일을 확인하세요.
