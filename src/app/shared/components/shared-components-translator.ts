import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';

@Injectable({ providedIn: 'root' })
export class SharedComponentsTranslator {
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  async loadTranslations() {
    const lang = this.languageService.getSavedLanguage();
    // Dynamic import for the correct language file
    const translations = await import('../components/i18n/' + lang + '.json');
    this.translate.setTranslation(lang, translations.default || translations, true);
  }
}
