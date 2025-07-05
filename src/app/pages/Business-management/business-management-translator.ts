import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../shared/services/language.service';

@Injectable({ providedIn: 'root' })
export class BusinessManagementTranslator {
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  /**
   * Dynamically loads Business Management module translations
   * based on the current saved language, and merges them
   * into the global translation context.
   */
  async loadTranslations(): Promise<void> {
    const lang = this.languageService.getSavedLanguage() || 'en';
    try {
      const translations = await import(`./i18n/${lang}.json`);
      this.translate.setTranslation(lang, translations.default ?? translations, true);
    } catch (err) {
      console.error(`[BusinessManagementTranslator] Failed to load ${lang} translations`, err);
    }
  }

  /**
   * Synchronously get translation for a key (for use in TS code)
   */
  instant(key: string, interpolateParams?: Object): string {
    return this.translate.instant(key, interpolateParams);
  }
}
