import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type UniversityOption = {
  id: string;
  name: string;
  short_name: string | null;
};

export type DepartmentOption = {
  id: string;
  university_id: string;
  name: string;
  short_name: string | null;
};

export type SkillOption = {
  id: string;
  name: string;
};

export const FALLBACK_UNIVERSITIES: UniversityOption[] = [
  { id: "11111111-1111-4111-8111-111111111101", name: "International University of Business Agriculture and Technology", short_name: "IUBAT" },
  { id: "11111111-1111-4111-8111-111111111102", name: "Bangladesh University of Engineering and Technology", short_name: "BUET" },
  { id: "11111111-1111-4111-8111-111111111103", name: "University of Dhaka", short_name: "DU" },
  { id: "11111111-1111-4111-8111-111111111104", name: "North South University", short_name: "NSU" },
  { id: "11111111-1111-4111-8111-111111111105", name: "BRAC University", short_name: "BRACU" },
  { id: "11111111-1111-4111-8111-111111111106", name: "Shahjalal University of Science and Technology", short_name: "SUST" },
  { id: "11111111-1111-4111-8111-111111111107", name: "Rajshahi University of Engineering & Technology", short_name: "RUET" },
  { id: "11111111-1111-4111-8111-111111111108", name: "Chittagong University of Engineering & Technology", short_name: "CUET" },
  { id: "11111111-1111-4111-8111-111111111109", name: "Khulna University of Engineering & Technology", short_name: "KUET" },
  { id: "11111111-1111-4111-8111-111111111110", name: "American International University-Bangladesh", short_name: "AIUB" },
  { id: "11111111-1111-4111-8111-111111111111", name: "United International University", short_name: "UIU" },
  { id: "11111111-1111-4111-8111-111111111112", name: "Daffodil International University", short_name: "DIU" },
  { id: "11111111-1111-4111-8111-111111111113", name: "Ahsanullah University of Science and Technology", short_name: "AUST" },
  { id: "11111111-1111-4111-8111-111111111114", name: "Jahangirnagar University", short_name: "JU" },
  { id: "11111111-1111-4111-8111-111111111115", name: "University of Rajshahi", short_name: "RU" },
  { id: "11111111-1111-4111-8111-111111111116", name: "University of Chittagong", short_name: "CU" },
  { id: "11111111-1111-4111-8111-111111111117", name: "East West University", short_name: "EWU" },
  { id: "11111111-1111-4111-8111-111111111118", name: "University of Liberal Arts Bangladesh", short_name: "ULAB" },
  { id: "11111111-1111-4111-8111-111111111119", name: "Military Institute of Science and Technology", short_name: "MIST" },
  { id: "11111111-1111-4111-8111-111111111120", name: "Bangladesh University of Professionals", short_name: "BUP" },
];

export const FALLBACK_DEPARTMENTS: DepartmentOption[] = [
  // IUBAT
  { id: "21111111-1111-4111-8111-111111111101", university_id: "11111111-1111-4111-8111-111111111101", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111102", university_id: "11111111-1111-4111-8111-111111111101", name: "Electrical and Electronic Engineering", short_name: "EEE" },
  { id: "21111111-1111-4111-8111-111111111103", university_id: "11111111-1111-4111-8111-111111111101", name: "Civil Engineering", short_name: "CE" },
  { id: "21111111-1111-4111-8111-111111111104", university_id: "11111111-1111-4111-8111-111111111101", name: "Mechanical Engineering", short_name: "ME" },
  { id: "21111111-1111-4111-8111-111111111105", university_id: "11111111-1111-4111-8111-111111111101", name: "Bachelor of Business Administration", short_name: "BBA" },
  { id: "21111111-1111-4111-8111-111111111106", university_id: "11111111-1111-4111-8111-111111111101", name: "Bachelor of Science in Nursing", short_name: "BSN" },
  { id: "21111111-1111-4111-8111-111111111107", university_id: "11111111-1111-4111-8111-111111111101", name: "Bachelor of Science in Agriculture", short_name: "BSAg" },
  { id: "21111111-1111-4111-8111-111111111108", university_id: "11111111-1111-4111-8111-111111111101", name: "Tourism and Hospitality Management", short_name: "THM" },
  { id: "21111111-1111-4111-8111-111111111109", university_id: "11111111-1111-4111-8111-111111111101", name: "Economics", short_name: "ECON" },
  { id: "21111111-1111-4111-8111-111111111110", university_id: "11111111-1111-4111-8111-111111111101", name: "English Language & Literature", short_name: "ENG" },
  // BUET
  { id: "21111111-1111-4111-8111-111111111111", university_id: "11111111-1111-4111-8111-111111111102", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111112", university_id: "11111111-1111-4111-8111-111111111102", name: "Electrical and Electronic Engineering", short_name: "EEE" },
  { id: "21111111-1111-4111-8111-111111111113", university_id: "11111111-1111-4111-8111-111111111102", name: "Civil Engineering", short_name: "CE" },
  { id: "21111111-1111-4111-8111-111111111114", university_id: "11111111-1111-4111-8111-111111111102", name: "Mechanical Engineering", short_name: "ME" },
  { id: "21111111-1111-4111-8111-111111111115", university_id: "11111111-1111-4111-8111-111111111102", name: "Industrial and Production Engineering", short_name: "IPE" },
  { id: "21111111-1111-4111-8111-111111111116", university_id: "11111111-1111-4111-8111-111111111102", name: "Architecture", short_name: "ARCH" },
  // DU
  { id: "21111111-1111-4111-8111-111111111117", university_id: "11111111-1111-4111-8111-111111111103", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111118", university_id: "11111111-1111-4111-8111-111111111103", name: "Institute of Information Technology", short_name: "IIT" },
  { id: "21111111-1111-4111-8111-111111111119", university_id: "11111111-1111-4111-8111-111111111103", name: "Institute of Business Administration", short_name: "IBA" },
  { id: "21111111-1111-4111-8111-111111111120", university_id: "11111111-1111-4111-8111-111111111103", name: "Economics", short_name: "ECON" },
  // NSU
  { id: "21111111-1111-4111-8111-111111111121", university_id: "11111111-1111-4111-8111-111111111104", name: "Electrical & Computer Engineering", short_name: "ECE" },
  { id: "21111111-1111-4111-8111-111111111122", university_id: "11111111-1111-4111-8111-111111111104", name: "School of Business & Economics", short_name: "SBE" },
  { id: "21111111-1111-4111-8111-111111111123", university_id: "11111111-1111-4111-8111-111111111104", name: "Civil & Environmental Engineering", short_name: "CEE" },
  // BRACU
  { id: "21111111-1111-4111-8111-111111111124", university_id: "11111111-1111-4111-8111-111111111105", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111125", university_id: "11111111-1111-4111-8111-111111111105", name: "Electrical and Electronic Engineering", short_name: "EEE" },
  { id: "21111111-1111-4111-8111-111111111126", university_id: "11111111-1111-4111-8111-111111111105", name: "BRAC Business School", short_name: "BBS" },
  // SUST
  { id: "21111111-1111-4111-8111-111111111127", university_id: "11111111-1111-4111-8111-111111111106", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111128", university_id: "11111111-1111-4111-8111-111111111106", name: "Software Engineering", short_name: "SWE" },
  { id: "21111111-1111-4111-8111-111111111129", university_id: "11111111-1111-4111-8111-111111111106", name: "Electrical and Electronic Engineering", short_name: "EEE" },
  // RUET
  { id: "21111111-1111-4111-8111-111111111130", university_id: "11111111-1111-4111-8111-111111111107", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111131", university_id: "11111111-1111-4111-8111-111111111107", name: "Electrical and Electronic Engineering", short_name: "EEE" },
  { id: "21111111-1111-4111-8111-111111111132", university_id: "11111111-1111-4111-8111-111111111107", name: "Mechanical Engineering", short_name: "ME" },
  // CUET
  { id: "21111111-1111-4111-8111-111111111133", university_id: "11111111-1111-4111-8111-111111111108", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111134", university_id: "11111111-1111-4111-8111-111111111108", name: "Electrical and Electronic Engineering", short_name: "EEE" },
  // KUET
  { id: "21111111-1111-4111-8111-111111111135", university_id: "11111111-1111-4111-8111-111111111109", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111136", university_id: "11111111-1111-4111-8111-111111111109", name: "Electrical and Electronic Engineering", short_name: "EEE" },
  // AIUB
  { id: "21111111-1111-4111-8111-111111111137", university_id: "11111111-1111-4111-8111-111111111110", name: "Computer Science & Software Engineering", short_name: "CSSE" },
  { id: "21111111-1111-4111-8111-111111111138", university_id: "11111111-1111-4111-8111-111111111110", name: "Faculty of Business Administration", short_name: "FBA" },
  // UIU
  { id: "21111111-1111-4111-8111-111111111139", university_id: "11111111-1111-4111-8111-111111111111", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111140", university_id: "11111111-1111-4111-8111-111111111111", name: "Data Science", short_name: "BSc DS" },
  // DIU
  { id: "21111111-1111-4111-8111-111111111141", university_id: "11111111-1111-4111-8111-111111111112", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111142", university_id: "11111111-1111-4111-8111-111111111112", name: "Software Engineering", short_name: "SWE" },
  // AUST
  { id: "21111111-1111-4111-8111-111111111143", university_id: "11111111-1111-4111-8111-111111111113", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111144", university_id: "11111111-1111-4111-8111-111111111113", name: "Electrical and Electronic Engineering", short_name: "EEE" },
  // JU
  { id: "21111111-1111-4111-8111-111111111145", university_id: "11111111-1111-4111-8111-111111111114", name: "Computer Science and Engineering", short_name: "CSE" },
  { id: "21111111-1111-4111-8111-111111111146", university_id: "11111111-1111-4111-8111-111111111114", name: "Institute of Information Technology", short_name: "IIT" },
  // RU
  { id: "21111111-1111-4111-8111-111111111147", university_id: "11111111-1111-4111-8111-111111111115", name: "Computer Science and Engineering", short_name: "CSE" },
  // CU
  { id: "21111111-1111-4111-8111-111111111148", university_id: "11111111-1111-4111-8111-111111111116", name: "Computer Science and Engineering", short_name: "CSE" },
  // EWU
  { id: "21111111-1111-4111-8111-111111111149", university_id: "11111111-1111-4111-8111-111111111117", name: "Computer Science and Engineering", short_name: "CSE" },
  // ULAB
  { id: "21111111-1111-4111-8111-111111111150", university_id: "11111111-1111-4111-8111-111111111118", name: "Computer Science and Engineering", short_name: "CSE" },
  // MIST
  { id: "21111111-1111-4111-8111-111111111151", university_id: "11111111-1111-4111-8111-111111111119", name: "Computer Science and Engineering", short_name: "CSE" },
  // BUP
  { id: "21111111-1111-4111-8111-111111111152", university_id: "11111111-1111-4111-8111-111111111120", name: "Information and Communication Technology", short_name: "ICT" },
];

export const FALLBACK_SKILLS: SkillOption[] = [
  { id: "31111111-1111-4111-8111-111111111101", name: "JavaScript" },
  { id: "31111111-1111-4111-8111-111111111102", name: "TypeScript" },
  { id: "31111111-1111-4111-8111-111111111103", name: "React" },
  { id: "31111111-1111-4111-8111-111111111104", name: "Next.js" },
  { id: "31111111-1111-4111-8111-111111111105", name: "Node.js" },
  { id: "31111111-1111-4111-8111-111111111106", name: "Python" },
  { id: "31111111-1111-4111-8111-111111111107", name: "Django" },
  { id: "31111111-1111-4111-8111-111111111108", name: "FastAPI" },
  { id: "31111111-1111-4111-8111-111111111109", name: "Java" },
  { id: "31111111-1111-4111-8111-111111111110", name: "Spring Boot" },
  { id: "31111111-1111-4111-8111-111111111111", name: "C++" },
  { id: "31111111-1111-4111-8111-111111111112", name: "Go" },
  { id: "31111111-1111-4111-8111-111111111113", name: "PostgreSQL" },
  { id: "31111111-1111-4111-8111-111111111114", name: "MongoDB" },
  { id: "31111111-1111-4111-8111-111111111115", name: "REST APIs" },
  { id: "31111111-1111-4111-8111-111111111116", name: "Docker" },
  { id: "31111111-1111-4111-8111-111111111117", name: "Kubernetes" },
  { id: "31111111-1111-4111-8111-111111111118", name: "AWS" },
  { id: "31111111-1111-4111-8111-111111111119", name: "Machine Learning" },
  { id: "31111111-1111-4111-8111-111111111120", name: "Deep Learning" },
  { id: "31111111-1111-4111-8111-111111111121", name: "UI/UX Design" },
  { id: "31111111-1111-4111-8111-111111111122", name: "Figma" },
  { id: "31111111-1111-4111-8111-111111111123", name: "Mobile App Development (Flutter)" },
  { id: "31111111-1111-4111-8111-111111111124", name: "Product Management" },
  { id: "31111111-1111-4111-8111-111111111125", name: "Data Structures & Algorithms" },
];

export const getOnboardingOptions = cache(async () => {
  const supabase = await createClient();

  try {
    const [universities, departments, skills] = await Promise.all([
      supabase
        .from("universities")
        .select("id, name, short_name")
        .order("name", { ascending: true }),
      supabase
        .from("departments")
        .select("id, university_id, name, short_name")
        .order("name", { ascending: true }),
      supabase.from("skills").select("id, name").order("name", { ascending: true }),
    ]);

    const resolvedUniversities =
      universities.data && universities.data.length > 0
        ? (universities.data as UniversityOption[])
        : FALLBACK_UNIVERSITIES;

    const resolvedDepartments =
      departments.data && departments.data.length > 0
        ? (departments.data as DepartmentOption[])
        : FALLBACK_DEPARTMENTS;

    const resolvedSkills =
      skills.data && skills.data.length > 0
        ? (skills.data as SkillOption[])
        : FALLBACK_SKILLS;

    return {
      departments: resolvedDepartments,
      skills: resolvedSkills,
      universities: resolvedUniversities,
      error: null,
    };
  } catch {
    return {
      departments: FALLBACK_DEPARTMENTS,
      skills: FALLBACK_SKILLS,
      universities: FALLBACK_UNIVERSITIES,
      error: null,
    };
  }
});

