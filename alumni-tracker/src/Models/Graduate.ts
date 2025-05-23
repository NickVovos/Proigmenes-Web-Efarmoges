export interface Graduate {
  id: number;
  firstName: string;
  lastName: string;
  academicEntryYear: number;
  graduationDate: string; // ISO string from DateTime
  degreeGrade: number;
  email: string;
  personalWebsite: string;
  userId: number;
  phones: Phone[];
  socialMedias: SocialMedia[];
  employments: Employment[];
}

export interface Employment {
  id: number;
  organization: string;
  organizationSite: string;
  from: string; // ISO string
  to: string;   // ISO string
  jobType: string;
  jobDescription: string;
  relatedField: string;
  address: Address;
  graduateId: number;
}

export interface Address {
  street: string;
  number: string;
  city: string;
  postalCode: string;
  country: string;
  longitude: string;
  latitude: string;
}

export interface User {
  id: number;
  username: string;
  passwordHash: string;
  graduates: Graduate[];
}

export interface Phone {
  id: number;
  number: string;
  type: string;
  graduateId: number;
}

export interface SocialMedia {
  id: number;
  type: string;
  url: string;
  graduateId: number;
}