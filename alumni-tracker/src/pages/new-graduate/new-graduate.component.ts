// new-graduate.component.ts
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Employment, SocialMedia } from '../../Models/Graduate';


@Component({
  selector: 'app-new-graduate',
  standalone: true,
  templateUrl: './new-graduate.component.html',
  styleUrls: ['./new-graduate.component.css'],
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ]
})

export class NewGraduateComponent {
  
  graduateForm: FormGroup;




ngOnChanges(changes: SimpleChanges): void {
  if (changes['graduate'] && this.graduate) {
    this.populateForm(this.graduate);
  }
}


  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.graduateForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      academicEntryYear: ['', Validators.required],
      graduationDate: ['', Validators.required],
      degreeGrade: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      personalWebsite: [''],

      origin: this.fb.group({
        street: [''],
        number: [''],
        city: [''],
        postalCode: [''],
        country: ['']
      }),

      currentAddress: this.fb.group({
        street: [''],
        number: [''],
        city: [''],
        postalCode: [''],
        country: ['']
      }),

      phones: this.fb.array([]),
      socialMedias: this.fb.array([]),
      employments: this.fb.array([])
    });
  }

  get phones() { return this.graduateForm.get('phones') as FormArray; }
  get socialMedias() { return this.graduateForm.get('socialMedias') as FormArray; }
  get employments() { return this.graduateForm.get('employments') as FormArray; }

  addPhone() {
    this.phones.push(this.fb.group({
      number: [''],
      type: ['']
    }));
  }

  addSocialMedia() {
    this.socialMedias.push(this.fb.group({
      type: [''],
      url: ['']
    }));
  }

  addEmployment() {
    this.employments.push(this.fb.group({
      organization: [''],
      organizationSite: [''],
      from: [''],
      to: [''],
      jobType: [''],
      jobDescription: [''],
      relatedField: [''],
      address: this.fb.group({
        street: [''],
        number: [''],
        city: [''],
        postalCode: [''],
        country: [''],
        latitude: [''],
        longitude: ['']
      })
    }));
  }

    submit() {
      const data = this.graduateForm.value;

      // Remove any IDs from nested arrays to avoid IDENTITY_INSERT errors
      data.phones?.forEach((p: any) => delete p.id);
      data.socialMedias?.forEach((s: any) => delete s.id);
      data.employments?.forEach((e: any) => {
        delete e.id;
        if (e.geoLocation) delete e.geoLocation.id;
        if (e.address) delete e.address.id;
      });

      const token = localStorage.getItem('token')!;
      const url = this.graduate?.id
        ? `https://localhost:5001/api/graduates/${this.graduate.id}`
        : 'https://localhost:5001/api/graduates';

      const request = this.graduate?.id
        ? this.http.put(url, data, { headers: { Authorization: 'Bearer ' + token } })
        : this.http.post(url, data, { headers: { Authorization: 'Bearer ' + token } });

      request.subscribe(() => {
        this.graduateForm.reset();
        this.submitted.emit();
      });
    }

  populateForm(data: any) {

      this.socialMedias.clear();
  data.socialMedias?.forEach((s: SocialMedia) => {
    this.socialMedias.push(this.fb.group({
      type: [s.type],
      url: [s.url]
    }));
  });

  this.graduateForm.patchValue({
    ...data,
    origin: data.origin || {},
    currentAddress: data.currentAddress || {}
  });

  // Clear then repopulate arrays
  this.phones.clear();
  data.phones?.forEach((p: any) => this.phones.push(this.fb.group(p)));

  this.socialMedias.clear();
  data.socialMedias?.forEach((s: any) => this.socialMedias.push(this.fb.group(s)));

  this.employments.clear();
  data.employments?.forEach((e: Employment) => {
    this.employments.push(this.fb.group({
      organization: [e.organization],
      organizationSite: [e.organizationSite],
      from: [e.from],
      to: [e.to],
      jobType: [e.jobType],
      jobDescription: [e.jobDescription],
      relatedField: [e.relatedField],
      address: this.fb.group({
        street: [e.address?.street ?? ''],
        number: [e.address?.number ?? ''],
        city: [e.address?.city ?? ''],
        postalCode: [e.address?.postalCode ?? ''],
        country: [e.address?.country ?? ''],
        latitude: [e.address?.latitude ?? ''],
        longitude: [e.address?.longitude ?? '']
      })
    }));
  });
}

  @Output() submitted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
    @Input() graduate: any;
}
