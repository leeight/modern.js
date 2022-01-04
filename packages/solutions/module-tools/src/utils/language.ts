// import { Import } from '@modern-js/utils';
import { I18CLILanguageDetector } from '@modern-js/i18n-cli-language-detector';

// const i18n: typeof import('@modern-js/i18n-cli-language-detector') =
//   Import.lazy('@modern-js/i18n-cli-language-detector', require);

export function getLocaleLanguage() {
  const detector = new I18CLILanguageDetector();
  return detector.detect();
}
