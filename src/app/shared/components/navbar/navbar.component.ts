import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule, LangChangeEvent } from '@ngx-translate/core';
import { SharedComponentsTranslator } from '../shared-components-translator';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, FormsModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentLang: string;
  private langSub?: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router,
    public languageService: LanguageService,
    private sharedComponentsTranslator: SharedComponentsTranslator,
    private cdRef: ChangeDetectorRef
  ) {
    this.currentLang = this.languageService.getSavedLanguage();
  }

  async ngOnInit() {
    await this.sharedComponentsTranslator.loadTranslations();

    this.langSub = this.languageService.translate.onLangChange.subscribe(
      async (event: LangChangeEvent) => {
        // Load translations only if language truly changed
        if (event.lang !== this.currentLang) {
          this.currentLang = event.lang;
          await this.sharedComponentsTranslator.loadTranslations();
          this.cdRef.detectChanges();
        }
      }
    );
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  async onLangChange(lang: string) {
    if (lang === this.currentLang) return; // No need to reload same lang

    this.currentLang = lang;
    this.languageService.setLanguage(lang); // No need to await
    await this.sharedComponentsTranslator.loadTranslations();
    this.cdRef.detectChanges();

    // Reload current route to re-evaluate translations
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  logout() {
    this.authService.logout();
  }

  getDisplayName(): string {
    const user = this.authService.getCurrentUser();
    if (user?.userName && user.userName.trim() !== '') {
      return user.userName;
    }
    return user?.email || 'User';
  }
}
