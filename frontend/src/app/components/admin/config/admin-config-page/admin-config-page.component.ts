import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { GamificationConfig, ConfigUpdateRequest } from '../../../../models/admin.models';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Settings, Save, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-admin-config-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './admin-config-page.component.html',
  styleUrls: ['./admin-config-page.component.css']
})
export class AdminConfigPageComponent implements OnInit {
  configs: GamificationConfig[] = [];
  configGroups: { [key: string]: GamificationConfig[] } = {};
  
  configForms: { [key: string]: FormGroup } = {};
  savingState: { [key: string]: boolean } = {};
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Icons
  SettingsIcon = Settings;
  SaveIcon = Save;
  AlertIcon = AlertCircle;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminService.getAdminConfig()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (configs) => {
          this.configs = configs;
          this.groupConfigs();
          this.initializeForms();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load configuration. Please try again.';
          console.error(err);
        }
      });
  }

  private groupConfigs(): void {
    this.configGroups = {
      'Gamification & Points': [],
      'Challenges & Thresholds': [],
      'General Settings': []
    };

    this.configs.forEach(config => {
      const key = config.configKey.toLowerCase();
      if (key.includes('point') || key.includes('badge') || key.includes('level')) {
        this.configGroups['Gamification & Points'].push(config);
      } else if (key.includes('challenge') || key.includes('target') || key.includes('threshold')) {
        this.configGroups['Challenges & Thresholds'].push(config);
      } else {
        this.configGroups['General Settings'].push(config);
      }
    });

    // Remove empty groups
    Object.keys(this.configGroups).forEach(group => {
      if (this.configGroups[group].length === 0) {
        delete this.configGroups[group];
      }
    });
  }

  private initializeForms(): void {
    this.configs.forEach(config => {
      let validators = [Validators.required];
      if (config.valueType === 'NUMBER') {
        validators.push(Validators.pattern('^[0-9]+(\.[0-9]+)?$'));
      } else if (config.valueType === 'BOOLEAN') {
        validators = []; // Checkboxes don't need 'required' in the same way
      }

      this.configForms[config.configKey] = this.fb.group({
        value: [config.configValue, validators]
      });
    });
  }

  getForm(key: string): FormGroup {
    return this.configForms[key];
  }

  saveConfig(configKey: string): void {
    const form = this.getForm(configKey);
    
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.savingState[configKey] = true;
    
    // For boolean, convert to string as backend expects string 'true' or 'false'
    let val = form.value.value;
    if (typeof val === 'boolean') {
      val = val ? 'true' : 'false';
    }

    const request: ConfigUpdateRequest = { value: String(val) };

    this.adminService.updateAdminConfig(configKey, request)
      .pipe(finalize(() => this.savingState[configKey] = false))
      .subscribe({
        next: (updatedConfig) => {
          this.successMessage = `Configuration '${configKey}' updated successfully.`;
          
          // Update local config value
          const idx = this.configs.findIndex(c => c.configKey === configKey);
          if (idx !== -1) {
            this.configs[idx] = updatedConfig;
          }
          
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          console.error('Error updating config:', err);
          this.errorMessage = `Failed to update '${configKey}'.`;
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
  }
}
