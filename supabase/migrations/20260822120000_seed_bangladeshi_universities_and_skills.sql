-- =========================================================
-- SHONGJOG
-- Seed Bangladeshi Universities, Departments, and Skills
-- =========================================================

-- Insert Universities
insert into public.universities (id, name, short_name, location, website)
values
  ('11111111-1111-4111-8111-111111111101', 'International University of Business Agriculture and Technology', 'IUBAT', 'Dhaka', 'https://iubat.edu'),
  ('11111111-1111-4111-8111-111111111102', 'Bangladesh University of Engineering and Technology', 'BUET', 'Dhaka', 'https://buet.ac.bd'),
  ('11111111-1111-4111-8111-111111111103', 'University of Dhaka', 'DU', 'Dhaka', 'https://du.ac.bd'),
  ('11111111-1111-4111-8111-111111111104', 'North South University', 'NSU', 'Dhaka', 'https://northsouth.edu'),
  ('11111111-1111-4111-8111-111111111105', 'BRAC University', 'BRACU', 'Dhaka', 'https://bracu.ac.bd'),
  ('11111111-1111-4111-8111-111111111106', 'Shahjalal University of Science and Technology', 'SUST', 'Sylhet', 'https://sust.edu'),
  ('11111111-1111-4111-8111-111111111107', 'Rajshahi University of Engineering & Technology', 'RUET', 'Rajshahi', 'https://ruet.ac.bd'),
  ('11111111-1111-4111-8111-111111111108', 'Chittagong University of Engineering & Technology', 'CUET', 'Chattogram', 'https://cuet.ac.bd'),
  ('11111111-1111-4111-8111-111111111109', 'Khulna University of Engineering & Technology', 'KUET', 'Khulna', 'https://kuet.ac.bd'),
  ('11111111-1111-4111-8111-111111111110', 'American International University-Bangladesh', 'AIUB', 'Dhaka', 'https://aiub.edu'),
  ('11111111-1111-4111-8111-111111111111', 'United International University', 'UIU', 'Dhaka', 'https://uiu.ac.bd'),
  ('11111111-1111-4111-8111-111111111112', 'Daffodil International University', 'DIU', 'Dhaka', 'https://daffodilvarsity.edu.bd'),
  ('11111111-1111-4111-8111-111111111113', 'Ahsanullah University of Science and Technology', 'AUST', 'Dhaka', 'https://aust.edu'),
  ('11111111-1111-4111-8111-111111111114', 'Jahangirnagar University', 'JU', 'Dhaka', 'https://juniv.edu'),
  ('11111111-1111-4111-8111-111111111115', 'University of Rajshahi', 'RU', 'Rajshahi', 'https://ru.ac.bd'),
  ('11111111-1111-4111-8111-111111111116', 'University of Chittagong', 'CU', 'Chattogram', 'https://cu.ac.bd'),
  ('11111111-1111-4111-8111-111111111117', 'East West University', 'EWU', 'Dhaka', 'https://ewubd.edu'),
  ('11111111-1111-4111-8111-111111111118', 'University of Liberal Arts Bangladesh', 'ULAB', 'Dhaka', 'https://ulab.edu.bd'),
  ('11111111-1111-4111-8111-111111111119', 'Military Institute of Science and Technology', 'MIST', 'Dhaka', 'https://mist.ac.bd'),
  ('11111111-1111-4111-8111-111111111120', 'Bangladesh University of Professionals', 'BUP', 'Dhaka', 'https://bup.edu.bd')
on conflict (name) do update set
  short_name = excluded.short_name,
  location = excluded.location,
  website = excluded.website;

-- Insert Departments for IUBAT
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111101', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111101', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111101', 'Civil Engineering', 'CE'),
  ('11111111-1111-4111-8111-111111111101', 'Mechanical Engineering', 'ME'),
  ('11111111-1111-4111-8111-111111111101', 'Bachelor of Business Administration', 'BBA'),
  ('11111111-1111-4111-8111-111111111101', 'Bachelor of Science in Nursing', 'BSN'),
  ('11111111-1111-4111-8111-111111111101', 'Bachelor of Science in Agriculture', 'BSAg'),
  ('11111111-1111-4111-8111-111111111101', 'Tourism and Hospitality Management', 'THM'),
  ('11111111-1111-4111-8111-111111111101', 'Economics', 'ECON'),
  ('11111111-1111-4111-8111-111111111101', 'English Language & Literature', 'ENG')
on conflict (university_id, name) do nothing;

-- Insert Departments for BUET
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111102', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111102', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111102', 'Civil Engineering', 'CE'),
  ('11111111-1111-4111-8111-111111111102', 'Mechanical Engineering', 'ME'),
  ('11111111-1111-4111-8111-111111111102', 'Industrial and Production Engineering', 'IPE'),
  ('11111111-1111-4111-8111-111111111102', 'Chemical Engineering', 'ChE'),
  ('11111111-1111-4111-8111-111111111102', 'Architecture', 'ARCH'),
  ('11111111-1111-4111-8111-111111111102', 'Biomedical Engineering', 'BME')
on conflict (university_id, name) do nothing;

-- Insert Departments for DU
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111103', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111103', 'Institute of Information Technology', 'IIT'),
  ('11111111-1111-4111-8111-111111111103', 'Institute of Business Administration', 'IBA'),
  ('11111111-1111-4111-8111-111111111103', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111103', 'Economics', 'ECON'),
  ('11111111-1111-4111-8111-111111111103', 'Finance', 'FIN'),
  ('11111111-1111-4111-8111-111111111103', 'Marketing', 'MKT'),
  ('11111111-1111-4111-8111-111111111103', 'Law', 'LAW'),
  ('11111111-1111-4111-8111-111111111103', 'Pharmacy', 'PHARM')
on conflict (university_id, name) do nothing;

-- Insert Departments for NSU
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111104', 'Electrical & Computer Engineering', 'ECE'),
  ('11111111-1111-4111-8111-111111111104', 'School of Business & Economics', 'SBE'),
  ('11111111-1111-4111-8111-111111111104', 'Civil & Environmental Engineering', 'CEE'),
  ('11111111-1111-4111-8111-111111111104', 'Pharmaceutical Sciences', 'PHARM'),
  ('11111111-1111-4111-8111-111111111104', 'Biochemistry and Microbiology', 'BCM'),
  ('11111111-1111-4111-8111-111111111104', 'Architecture', 'ARCH'),
  ('11111111-1111-4111-8111-111111111104', 'English and Modern Languages', 'DEML')
on conflict (university_id, name) do nothing;

-- Insert Departments for BRACU
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111105', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111105', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111105', 'BRAC Business School', 'BBS'),
  ('11111111-1111-4111-8111-111111111105', 'Architecture', 'ARCH'),
  ('11111111-1111-4111-8111-111111111105', 'Economics and Social Sciences', 'ESS'),
  ('11111111-1111-4111-8111-111111111105', 'Pharmacy', 'PHARM'),
  ('11111111-1111-4111-8111-111111111105', 'English and Humanities', 'ENH'),
  ('11111111-1111-4111-8111-111111111105', 'School of Law', 'SOL')
on conflict (university_id, name) do nothing;

-- Insert Departments for SUST
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111106', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111106', 'Software Engineering', 'SWE'),
  ('11111111-1111-4111-8111-111111111106', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111106', 'Civil and Environmental Engineering', 'CEE'),
  ('11111111-1111-4111-8111-111111111106', 'Industrial and Production Engineering', 'IPE'),
  ('11111111-1111-4111-8111-111111111106', 'Business Administration', 'BBA'),
  ('11111111-1111-4111-8111-111111111106', 'Economics', 'ECON'),
  ('11111111-1111-4111-8111-111111111106', 'Architecture', 'ARC')
on conflict (university_id, name) do nothing;

-- Insert Departments for RUET
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111107', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111107', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111107', 'Civil Engineering', 'CE'),
  ('11111111-1111-4111-8111-111111111107', 'Mechanical Engineering', 'ME'),
  ('11111111-1111-4111-8111-111111111107', 'Mechatronics Engineering', 'MTE'),
  ('11111111-1111-4111-8111-111111111107', 'Industrial and Production Engineering', 'IPE')
on conflict (university_id, name) do nothing;

-- Insert Departments for CUET
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111108', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111108', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111108', 'Civil Engineering', 'CE'),
  ('11111111-1111-4111-8111-111111111108', 'Mechanical Engineering', 'ME'),
  ('11111111-1111-4111-8111-111111111108', 'Petroleum and Mining Engineering', 'PME'),
  ('11111111-1111-4111-8111-111111111108', 'Architecture', 'ARCH')
on conflict (university_id, name) do nothing;

-- Insert Departments for KUET
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111109', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111109', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111109', 'Civil Engineering', 'CE'),
  ('11111111-1111-4111-8111-111111111109', 'Mechanical Engineering', 'ME'),
  ('11111111-1111-4111-8111-111111111109', 'Biomedical Engineering', 'BME'),
  ('11111111-1111-4111-8111-111111111109', 'Industrial Engineering and Management', 'IEM')
on conflict (university_id, name) do nothing;

-- Insert Departments for AIUB
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111110', 'Computer Science & Software Engineering', 'CSSE'),
  ('11111111-1111-4111-8111-111111111110', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111110', 'Faculty of Business Administration', 'FBA'),
  ('11111111-1111-4111-8111-111111111110', 'Architecture', 'ARCH'),
  ('11111111-1111-4111-8111-111111111110', 'Media & Mass Communication', 'MMC')
on conflict (university_id, name) do nothing;

-- Insert Departments for UIU
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111111', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111111', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111111', 'Civil Engineering', 'CE'),
  ('11111111-1111-4111-8111-111111111111', 'School of Business and Economics', 'SOBE'),
  ('11111111-1111-4111-8111-111111111111', 'Data Science', 'BSc DS'),
  ('11111111-1111-4111-8111-111111111111', 'Media Studies & Journalism', 'MSJ')
on conflict (university_id, name) do nothing;

-- Insert Departments for DIU
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111112', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111112', 'Software Engineering', 'SWE'),
  ('11111111-1111-4111-8111-111111111112', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111112', 'Civil Engineering', 'CE'),
  ('11111111-1111-4111-8111-111111111112', 'Business Administration', 'BBA'),
  ('11111111-1111-4111-8111-111111111112', 'Multimedia & Creative Technology', 'MCT'),
  ('11111111-1111-4111-8111-111111111112', 'Pharmacy', 'PHARM')
on conflict (university_id, name) do nothing;

-- Insert Departments for AUST
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111113', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111113', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111113', 'Civil Engineering', 'CE'),
  ('11111111-1111-4111-8111-111111111113', 'Mechanical and Production Engineering', 'MPE'),
  ('11111111-1111-4111-8111-111111111113', 'Textile Engineering', 'TE'),
  ('11111111-1111-4111-8111-111111111113', 'Architecture', 'ARCH'),
  ('11111111-1111-4111-8111-111111111113', 'School of Business', 'SOB')
on conflict (university_id, name) do nothing;

-- Insert Departments for JU
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111114', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111114', 'Institute of Information Technology', 'IIT'),
  ('11111111-1111-4111-8111-111111111114', 'Economics', 'ECON'),
  ('11111111-1111-4111-8111-111111111114', 'Finance and Banking', 'F&B'),
  ('11111111-1111-4111-8111-111111111114', 'Pharmacy', 'PHARM')
on conflict (university_id, name) do nothing;

-- Insert Departments for RU
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111115', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111115', 'Information and Communication Engineering', 'ICE'),
  ('11111111-1111-4111-8111-111111111115', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111115', 'Finance', 'FIN'),
  ('11111111-1111-4111-8111-111111111115', 'Economics', 'ECON')
on conflict (university_id, name) do nothing;

-- Insert Departments for CU
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111116', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111116', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111116', 'Marketing', 'MKT'),
  ('11111111-1111-4111-8111-111111111116', 'Finance', 'FIN'),
  ('11111111-1111-4111-8111-111111111116', 'Economics', 'ECON')
on conflict (university_id, name) do nothing;

-- Insert Departments for EWU
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111117', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111117', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111117', 'Business Administration', 'BBA'),
  ('11111111-1111-4111-8111-111111111117', 'Economics', 'ECON'),
  ('11111111-1111-4111-8111-111111111117', 'Pharmacy', 'PHARM')
on conflict (university_id, name) do nothing;

-- Insert Departments for ULAB
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111118', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111118', 'Electrical and Electronic Engineering', 'EEE'),
  ('11111111-1111-4111-8111-111111111118', 'School of Business', 'BBA'),
  ('11111111-1111-4111-8111-111111111118', 'Media Studies and Journalism', 'MSJ'),
  ('11111111-1111-4111-8111-111111111118', 'English and Humanities', 'DEH')
on conflict (university_id, name) do nothing;

-- Insert Departments for MIST
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111119', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111119', 'Electrical, Electronic and Communication Engineering', 'EECE'),
  ('11111111-1111-4111-8111-111111111119', 'Civil Engineering', 'CE'),
  ('11111111-1111-4111-8111-111111111119', 'Mechanical Engineering', 'ME'),
  ('11111111-1111-4111-8111-111111111119', 'Aeronautical Engineering', 'AE'),
  ('11111111-1111-4111-8111-111111111119', 'Naval Architecture and Marine Engineering', 'NAME')
on conflict (university_id, name) do nothing;

-- Insert Departments for BUP
insert into public.departments (university_id, name, short_name)
values
  ('11111111-1111-4111-8111-111111111120', 'Information and Communication Technology', 'ICT'),
  ('11111111-1111-4111-8111-111111111120', 'Computer Science and Engineering', 'CSE'),
  ('11111111-1111-4111-8111-111111111120', 'Faculty of Business Studies', 'FBS'),
  ('11111111-1111-4111-8111-111111111120', 'International Relations', 'IR'),
  ('11111111-1111-4111-8111-111111111120', 'Economics', 'ECON')
on conflict (university_id, name) do nothing;

-- Insert Starter Skills Catalog
insert into public.skills (name, slug)
values
  ('JavaScript', 'javascript'),
  ('TypeScript', 'typescript'),
  ('React', 'react'),
  ('Next.js', 'nextjs'),
  ('Node.js', 'nodejs'),
  ('Python', 'python'),
  ('Django', 'django'),
  ('FastAPI', 'fastapi'),
  ('Java', 'java'),
  ('Spring Boot', 'spring-boot'),
  ('C++', 'cpp'),
  ('C#', 'csharp'),
  ('.NET', 'dotnet'),
  ('Go', 'go'),
  ('Rust', 'rust'),
  ('PHP', 'php'),
  ('Laravel', 'laravel'),
  ('HTML5', 'html5'),
  ('CSS3 / Tailwind CSS', 'tailwind-css'),
  ('PostgreSQL', 'postgresql'),
  ('MySQL', 'mysql'),
  ('MongoDB', 'mongodb'),
  ('Redis', 'redis'),
  ('GraphQL', 'graphql'),
  ('REST APIs', 'rest-apis'),
  ('Docker', 'docker'),
  ('Kubernetes', 'kubernetes'),
  ('AWS', 'aws'),
  ('Google Cloud Platform (GCP)', 'gcp'),
  ('Azure', 'azure'),
  ('Linux / Bash', 'linux-bash'),
  ('Git & GitHub', 'git-github'),
  ('CI/CD Pipelines', 'ci-cd'),
  ('Data Structures & Algorithms', 'dsa'),
  ('Machine Learning', 'machine-learning'),
  ('Deep Learning', 'deep-learning'),
  ('Natural Language Processing (NLP)', 'nlp'),
  ('Computer Vision', 'computer-vision'),
  ('PyTorch', 'pytorch'),
  ('TensorFlow', 'tensorflow'),
  ('Data Analysis / Pandas', 'data-analysis-pandas'),
  ('UI/UX Design', 'ui-ux-design'),
  ('Figma', 'figma'),
  ('Product Management', 'product-management'),
  ('Agile & Scrum', 'agile-scrum'),
  ('Mobile App Development (Flutter)', 'flutter'),
  ('Mobile App Development (React Native)', 'react-native'),
  ('Android (Kotlin)', 'kotlin-android'),
  ('iOS (Swift)', 'swift-ios'),
  ('Cybersecurity & Ethical Hacking', 'cybersecurity'),
  ('Penetration Testing', 'penetration-testing'),
  ('Embedded Systems & IoT', 'embedded-systems-iot'),
  ('Robotics', 'robotics'),
  ('Technical Writing', 'technical-writing'),
  ('Public Speaking & Communication', 'public-speaking')
on conflict (name) do nothing;
