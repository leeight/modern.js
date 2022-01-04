// import { Import } from '@modern-js/utils';

import { ZH_LOCALE } from './zh';
import { EN_LOCALE } from './en';
import { I18n } from '@modern-js/plugin-i18n';

// const i18nPlugin: typeof import('@modern-js/plugin-i18n') = Import.lazy(
//   '@modern-js/plugin-i18n',
//   require,
// );

const i18n = new I18n();

const localeKeys = i18n.init('zh', { zh: ZH_LOCALE, en: EN_LOCALE });

export { i18n, localeKeys };
