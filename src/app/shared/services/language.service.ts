import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly LANG_KEY = 'app_language';
  private readonly DEFAULT_LANG = 'en';
  private readonly rtlLanguages = ['ar', 'he', 'fa', 'ur'];

  constructor(public translate: TranslateService) {
    this.initLanguage();
  }

  /**
   * Gets the saved language from localStorage,
   * or returns the default language if none is saved.
   */
  getSavedLanguage(): string {
    return localStorage.getItem(this.LANG_KEY) || this.DEFAULT_LANG;
  }

  /**
   * Sets the application language, updates TranslateService,
   * saves it to localStorage, and updates HTML attributes.
   */
  setLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem(this.LANG_KEY, lang);
    this.updateHtmlAttributes(lang);
  }

  /**
   * Initializes the application language on startup.
   */
  initLanguage(): void {
    const lang = this.getSavedLanguage();
    this.setLanguage(lang);
  }

  /**
   * Updates HTML `lang` and `dir` attributes
   * for accessibility and RTL/LTR direction.
   */
  private updateHtmlAttributes(lang: string): void {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = this.isRtl(lang) ? 'rtl' : 'ltr';
  }

  /**
   * Checks if the given language is an RTL language.
   */
  isRtl(lang: string): boolean {
    return this.rtlLanguages.includes(lang);
  }
}
