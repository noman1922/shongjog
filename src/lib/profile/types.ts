export type UserRole = "student" | "alumni" | "admin";

export type ProfileSkill = {
  id: string;
  name: string;
};

export type ProfileProject = {
  description: string | null;
  id: string;
  imageUrl: string | null;
  projectUrl: string | null;
  title: string;
};

export type ProfileExperience = {
  company: string;
  description: string | null;
  endDate: string | null;
  id: string;
  isCurrent: boolean;
  position: string;
  startDate: string | null;
};

export type ProfileDetails =
  | {
      availabilityText: string | null;
      departmentId: string | null;
      departmentName: string | null;
      graduationYear: number | null;
      internshipAvailable: boolean;
      role: "student";
      universityId: string | null;
      universityName: string | null;
    }
  | {
      companyName: string | null;
      departmentId: string | null;
      departmentName: string | null;
      experienceYears: number | null;
      graduationYear: number | null;
      jobTitle: string | null;
      professionalField: string | null;
      role: "alumni";
      universityId: string | null;
      universityName: string | null;
    };

export type PublicProfile = {
  avatarUrl: string | null;
  bio: string | null;
  details: ProfileDetails;
  fullName: string | null;
  id: string;
  isOwner: boolean;
  projects: ProfileProject[];
  experiences: ProfileExperience[];
  skills: ProfileSkill[];
  username: string | null;
};
