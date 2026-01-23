"""
Production-Ready Resume Parser - No AI Required
Extracts structured data from resumes with high accuracy using advanced regex patterns.
Designed to match AI-level extraction quality without ML dependencies.
"""

import re
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from collections import defaultdict


class DataExtractor:
    """Extract structured data from resumes using advanced regex patterns"""

    # Enhanced patterns
    EMAIL_PATTERN = r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b'

    # Fixed phone patterns - more specific
    PHONE_PATTERNS = [
        r'\+\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b',  # International
        r'\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b',  # US format
        r'\(\d{3}\)\s*\d{3}[\s.-]?\d{4}\b',  # (123) 456-7890
        r'\b\d{10}\b',  # 10 digits
    ]

    LINKEDIN_PATTERN = r'(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+'
    URL_PATTERN = r'https?://[^\s<>"{}|\\\\^`\[\]]+'

    # Comprehensive software keywords
    SOFTWARE_KEYWORDS = {
        # BIM/Architecture
        'revit', 'autocad', 'navisworks', 'bim 360', 'dynamo', 'rhino', 'grasshopper',
        'sketchup', 'lumion', 'enscape', '3ds max', 'blender', 'archicad', 'tekla', 
        'solibri', 'autodesk recap', 'acc',

        # Design
        'photoshop', 'illustrator', 'indesign', 'figma', 'sketch', 'adobe xd',

        # Project Management
        'microsoft project', 'primavera', 'ms project', 'jira', 'trello', 'asana',

        # Office
        'ms office', 'excel', 'word', 'powerpoint', 'outlook', 'microsoft excel',

        # Programming
        'python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
        'typescript', 'vba', 'sql', 'html', 'css',

        # Web Development
        'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'express',
        'next.js', 'react native', 'flutter',

        # Databases
        'mongodb', 'mysql', 'postgresql', 'oracle', 'sql server', 'redis', 'sqlite',

        # DevOps/Cloud
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
        'gitlab', 'terraform', 'ansible',

        # Data Science/ML
        'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'jupyter',
        'tableau', 'power bi', 'excel', 'r programming',
    }

    # Education patterns
    DEGREE_PATTERNS = {
        'bachelor': [
            r'\b(B\.?\s*E\.?|Bachelor\s+of\s+Engineering)(?:\s+in)?\s*([A-Za-z\s&,-]+?)(?=\n|\||,|\d{4}|$)',
            r'\b(B\.?\s*Tech|Bachelor\s+of\s+Technology)(?:\s+in)?\s*([A-Za-z\s&,-]+?)(?=\n|\||,|\d{4}|$)',
            r'\b(B\.?\s*Sc|Bachelor\s+of\s+Science)(?:\s+in)?\s*([A-Za-z\s&,-]+?)(?=\n|\||,|\d{4}|$)',
            r'\b(B\.?\s*A\.?|Bachelor\s+of\s+Arts)(?:\s+in)?\s*([A-Za-z\s&,-]+?)(?=\n|\||,|\d{4}|$)',
            r'\b(B\.?\s*Arch|Bachelor\s+of\s+Architecture)(?:\s+in)?\s*([A-Za-z\s&,-]*)(?=\n|\||,|\d{4}|$)',
            r'\b(BBA|Bachelor\s+of\s+Business\s+Administration)(?:\s+in)?\s*([A-Za-z\s&,-]*)(?=\n|\||,|\d{4}|$)',
            r'\b(BCA|Bachelor\s+of\s+Computer\s+Applications)(?:\s+in)?\s*([A-Za-z\s&,-]*)(?=\n|\||,|\d{4}|$)',
        ],
        'master': [
            r'\b(M\.?\s*E\.?|Master\s+of\s+Engineering)(?:\s+in)?\s*([A-Za-z\s&,-]+?)(?=\n|\||,|\d{4}|$)',
            r'\b(M\.?\s*Tech|Master\s+of\s+Technology)(?:\s+in)?\s*([A-Za-z\s&,-]+?)(?=\n|\||,|\d{4}|$)',
            r'\b(M\.?\s*Sc|Master\s+of\s+Science)(?:\s+in)?\s*([A-Za-z\s&,-]+?)(?=\n|\||,|\d{4}|$)',
            r'\b(M\.?\s*A\.?|Master\s+of\s+Arts)(?:\s+in)?\s*([A-Za-z\s&,-]+?)(?=\n|\||,|\d{4}|$)',
            r'\b(M\.?\s*Arch|Master\s+of\s+Architecture)(?:\s+in)?\s*([A-Za-z\s&,-]*)(?=\n|\||,|\d{4}|$)',
            r'\b(MBA|Master\s+of\s+Business\s+Administration)(?:\s+in)?\s*([A-Za-z\s&,-]*)(?=\n|\||,|\d{4}|$)',
            r'\b(MCA|Master\s+of\s+Computer\s+Applications)(?:\s+in)?\s*([A-Za-z\s&,-]*)(?=\n|\||,|\d{4}|$)',
        ],
        'doctorate': [
            r'\b(Ph\.?\s*D\.?|PhD|Doctorate)(?:\s+in)?\s*([A-Za-z\s&,-]+?)(?=\n|\||,|\d{4}|$)',
        ],
    }

    # Month names for date parsing
    MONTHS = {
        'jan': '01', 'january': '01',
        'feb': '02', 'february': '02',
        'mar': '03', 'march': '03',
        'apr': '04', 'april': '04',
        'may': '05',
        'jun': '06', 'june': '06',
        'jul': '07', 'july': '07',
        'aug': '08', 'august': '08',
        'sep': '09', 'sept': '09', 'september': '09',
        'oct': '10', 'october': '10',
        'nov': '11', 'november': '11',
        'dec': '12', 'december': '12',
    }

    # Section headers
    SECTION_PATTERNS = {
        'summary': r'(?:professional\s+)?(?:summary|profile|objective|about(?:\s+me)?|career\s+(?:objective|summary))\s*:?',
        'experience': r'(?:professional\s+)?(?:experience|employment|work\s+(?:history|experience)|career\s+history)\s*:?',
        'education': r'(?:education(?:al)?(?:\s+(?:qualification|background))?|academic(?:\s+(?:qualification|background))?)\s*:?',
        'skills': r'(?:technical\s+)?(?:skills|competencies|expertise|proficiency|capabilities)\s*:?',
        'projects': r'(?:key\s+)?(?:projects?|project\s+experience)\s*:?',
        'certifications': r'(?:certifications?|certificates?|licenses?|training)(?:\s+(?:&|and)\s+training)?\s*:?',
        'achievements': r'(?:achievements?|accomplishments?|awards?|honors?)\s*:?',
    }

    # Job title keywords for better extraction
    JOB_TITLE_KEYWORDS = {
        'engineer', 'developer', 'architect', 'designer', 'manager', 'director',
        'lead', 'senior', 'junior', 'principal', 'staff', 'associate',
        'analyst', 'consultant', 'specialist', 'coordinator', 'administrator',
        'head', 'chief', 'vp', 'vice president', 'president', 'ceo', 'cto', 'cfo'
    }

    def __init__(self):
        """Initialize with compiled patterns"""
        self._compile_patterns()

    def _compile_patterns(self):
        """Compile regex patterns for better performance"""
        self.compiled_email = re.compile(self.EMAIL_PATTERN, re.IGNORECASE)
        self.compiled_linkedin = re.compile(self.LINKEDIN_PATTERN, re.IGNORECASE)
        self.compiled_phones = [re.compile(pattern) for pattern in self.PHONE_PATTERNS]

        # Compile section patterns
        self.compiled_sections = {
            name: re.compile(pattern, re.IGNORECASE | re.MULTILINE)
            for name, pattern in self.SECTION_PATTERNS.items()
        }

    def _preprocess_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""

        # Replace multiple spaces with single space but keep newlines
        text = re.sub(r'[ \t]+', ' ', text)
        # Replace multiple newlines with double newline
        text = re.sub(r'\n{3,}', '\n\n', text)
        # Remove bullet points and special characters at line start
        text = re.sub(r'^[•●○■□▪▫–—→›]\s*', '', text, flags=re.MULTILINE)

        return text.strip()

    def _extract_sections(self, text: str) -> Dict[str, str]:
        """Extract all sections from resume"""
        sections = {}

        # Find all section headers
        section_positions = []
        for name, pattern in self.compiled_sections.items():
            match = pattern.search(text)
            if match:
                section_positions.append((match.start(), match.end(), name))

        # Sort by position
        section_positions.sort()

        # Extract content between sections
        for i, (start, end, name) in enumerate(section_positions):
            # Find next section or end of text
            if i + 1 < len(section_positions):
                next_start = section_positions[i + 1][0]
                content = text[end:next_start].strip()
            else:
                content = text[end:].strip()

            sections[name] = content

        return sections

    def _extract_phones(self, text: str) -> List[str]:
        """Extract phone numbers with better filtering"""
        phones = []

        for pattern in self.compiled_phones:
            matches = pattern.findall(text)
            phones.extend(matches)

        # Filter out false positives
        cleaned_phones = []
        for phone in phones:
            # Remove spaces and formatting
            clean = re.sub(r'[\s.()-]', '', phone)

            # Skip if it's too short or too long
            if len(clean) < 8 or len(clean) > 15:
                continue

            # Skip if it's part of a LinkedIn URL or looks like an ID
            phone_context = text[max(0, text.find(phone)-20):min(len(text), text.find(phone)+len(phone)+20)]
            if 'linkedin' in phone_context.lower() or 'github' in phone_context.lower():
                continue

            cleaned_phones.append(phone)

        # Deduplicate
        return list(dict.fromkeys(cleaned_phones))[:3]

    def _extract_emails(self, text: str) -> List[str]:
        """Extract email addresses"""
        emails = self.compiled_email.findall(text)
        return list(dict.fromkeys(emails))[:3]

    def _extract_name(self, text: str) -> str:
        """Extract name from resume - first non-header content"""
        lines = text.strip().split('\n')[:20]

        # Skip common headers
        skip_words = {
            'resume', 'cv', 'curriculum', 'vitae', 'profile', 'contact',
            'email', 'phone', 'address', 'linkedin', 'github', 'portfolio'
        }

        for line in lines:
            line = line.strip()

            # Skip empty or very short lines
            if not line or len(line) < 3:
                continue

            # Skip lines with emails or phones
            if '@' in line or re.search(r'\+?\d[\d\s.-]{7,}', line):
                continue

            # Skip header words
            if any(skip in line.lower() for skip in skip_words):
                continue

            # Check if line looks like a name
            words = line.split()
            if 2 <= len(words) <= 5:
                # All words should start with capital or be all caps
                if all(w[0].isupper() for w in words if w):
                    # Should only contain letters, spaces, dots, hyphens
                    if re.match(r'^[A-Za-z][A-Za-z\s.\'-]+$', line):
                        return line.title() if line.isupper() else line

        return ""

    def _extract_work_experience(self, text: str, sections: Dict[str, str]) -> List[Dict]:
        """Extract work experience with job titles and companies"""
        experience_text = sections.get('experience', text)

        experiences = []

        # Pattern 1: Job Title at Company (Date - Date)
        pattern1 = r'([A-Z][A-Za-z\s&]+?)(?:\s+at\s+|\s+[-–|]\s+|\n)([A-Z][A-Za-z\s&,.]+?)(?:,\s*)?([A-Za-z\s]+)?\n?(?:[\s\n]*)((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|Present|Current)'

        matches1 = re.finditer(pattern1, experience_text, re.IGNORECASE | re.MULTILINE)

        for match in matches1:
            job_title = match.group(1).strip()
            company = match.group(2).strip()
            location = match.group(3).strip() if match.group(3) else ""
            start_date = match.group(4).strip()
            end_date = match.group(5).strip()

            # Clean company name
            company = re.sub(r'\s*[-–|]\s*$', '', company)

            # Validate job title contains job-related keywords
            if any(keyword in job_title.lower() for keyword in self.JOB_TITLE_KEYWORDS):
                experiences.append({
                    'job_title': job_title,
                    'company': company,
                    'location': location,
                    'start_date': start_date,
                    'end_date': end_date,
                    'duration': self._calculate_duration(start_date, end_date)
                })

        # Pattern 2: Simpler format - Job Title \n Company \n Date - Date
        lines = experience_text.split('\n')
        i = 0
        while i < len(lines) - 2:
            line = lines[i].strip()

            # Check if this looks like a job title
            if any(keyword in line.lower() for keyword in self.JOB_TITLE_KEYWORDS):
                job_title = line
                company_line = lines[i + 1].strip() if i + 1 < len(lines) else ""
                date_line = lines[i + 2].strip() if i + 2 < len(lines) else ""

                # Check if next line is company and then dates
                date_match = re.search(
                    r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present|Current)',
                    date_line, re.IGNORECASE
                )

                if date_match and company_line:
                    # Check if this experience is not already added
                    if not any(exp['job_title'] == job_title for exp in experiences):
                        experiences.append({
                            'job_title': job_title,
                            'company': company_line,
                            'location': "",
                            'start_date': date_match.group(1),
                            'end_date': date_match.group(2),
                            'duration': self._calculate_duration(date_match.group(1), date_match.group(2))
                        })
                    i += 3
                    continue
            i += 1

        return experiences[:10]

    def _calculate_duration(self, start_date: str, end_date: str) -> str:
        """Calculate duration between dates"""
        try:
            # Extract year and month from start date
            start_year = int(re.search(r'\d{4}', start_date).group())
            start_month_match = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*', start_date, re.IGNORECASE)
            start_month = 1
            if start_month_match:
                start_month = int(self.MONTHS.get(start_month_match.group(1).lower()[:3], 1))

            # Extract year and month from end date
            if end_date.lower() in ['present', 'current']:
                end_year = datetime.now().year
                end_month = datetime.now().month
            else:
                end_year = int(re.search(r'\d{4}', end_date).group())
                end_month_match = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*', end_date, re.IGNORECASE)
                end_month = 12
                if end_month_match:
                    end_month = int(self.MONTHS.get(end_month_match.group(1).lower()[:3], 12))

            # Calculate total months
            total_months = (end_year - start_year) * 12 + (end_month - start_month)

            if total_months < 1:
                return "Less than 1 month"
            elif total_months < 12:
                return f"{total_months} month{'s' if total_months > 1 else ''}"
            else:
                years = total_months // 12
                months = total_months % 12
                if months == 0:
                    return f"{years} year{'s' if years > 1 else ''}"
                else:
                    return f"{years} year{'s' if years > 1 else ''} {months} month{'s' if months > 1 else ''}"
        except:
            return ""

    def _extract_education(self, text: str, sections: Dict[str, str]) -> List[Dict]:
        """Extract education with degree, major, institution, and year"""
        education_text = sections.get('education', text)

        educations = []

        for degree_type, patterns in self.DEGREE_PATTERNS.items():
            for pattern in patterns:
                matches = re.finditer(pattern, education_text, re.IGNORECASE)

                for match in matches:
                    degree = match.group(1).strip()
                    major = match.group(2).strip() if len(match.groups()) > 1 else ""

                    # Clean major
                    major = re.sub(r'^[,\s-]+', '', major)
                    major = re.sub(r'[,\s-]+$', '', major)

                    # Find institution near this degree
                    match_pos = match.end()
                    context = education_text[match_pos:match_pos+300]

                    # Look for institution - usually next line or after major
                    institution_pattern = r'([A-Z][A-Za-z\s&,.-]+(?:University|College|Institute|School|Academy)(?:[A-Za-z\s&,.-]*)?)'
                    inst_match = re.search(institution_pattern, context)
                    institution = inst_match.group(1).strip() if inst_match else ""

                    # Find year
                    year_match = re.search(r'\b(19|20)\d{2}\b', context[:150])
                    year = year_match.group(0) if year_match else ""

                    # Find CGPA/GPA
                    cgpa_match = re.search(r'(?:CGPA|GPA)[:\s]*(\d+\.\d+)\s*(?:/|out of)?\s*(\d+)?', context[:150], re.IGNORECASE)
                    cgpa = ""
                    if cgpa_match:
                        cgpa = cgpa_match.group(1)
                        if cgpa_match.group(2):
                            cgpa += f"/{cgpa_match.group(2)}"

                    educations.append({
                        'degree': degree,
                        'major': major if major else "",
                        'institution': institution,
                        'year': year,
                        'cgpa': cgpa
                    })

        # Deduplicate by degree
        seen = set()
        unique_educations = []
        for edu in educations:
            key = (edu['degree'], edu['major'])
            if key not in seen:
                seen.add(key)
                unique_educations.append(edu)

        return unique_educations[:5]

    def _extract_skills(self, text: str, sections: Dict[str, str]) -> List[Dict]:
        """Extract skills with categories"""
        skills_text = sections.get('skills', text)

        found_skills = []
        text_lower = skills_text.lower()

        # Search for each skill keyword
        for skill in self.SOFTWARE_KEYWORDS:
            if skill in text_lower:
                # Find context around skill
                skill_pos = text_lower.find(skill)
                context = skills_text[max(0, skill_pos-50):min(len(skills_text), skill_pos+len(skill)+100)]

                # Try to find years of experience
                years_pattern = rf'{re.escape(skill)}[\s:,()-]+(\d+)\+?\s*(?:years?|yrs?)'
                years_match = re.search(years_pattern, context, re.IGNORECASE)
                years = years_match.group(1) if years_match else ""

                # Try to find proficiency level
                proficiency = ""
                prof_pattern = r'(expert|advanced|proficient|intermediate|beginner|basic)'
                prof_match = re.search(prof_pattern, context, re.IGNORECASE)
                if prof_match:
                    proficiency = prof_match.group(1).title()

                # Get proper capitalization from original text
                skill_pattern = re.compile(re.escape(skill), re.IGNORECASE)
                skill_match = skill_pattern.search(skills_text)
                proper_name = skill_match.group(0) if skill_match else skill.title()

                found_skills.append({
                    'name': proper_name,
                    'years': years,
                    'proficiency': proficiency
                })

        return found_skills

    def _extract_certifications(self, text: str, sections: Dict[str, str]) -> List[str]:
        """Extract certifications"""
        cert_text = sections.get('certifications', text)

        certifications = []

        # Pattern 1: Certification name followed by year
        pattern1 = r'([A-Z][A-Za-z\s&]+?)(?:,|\s+)\s*(\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})'
        matches = re.finditer(pattern1, cert_text)

        for match in matches:
            cert_name = match.group(1).strip()
            year = match.group(2).strip()

            # Filter out garbage
            if len(cert_name) > 5 and not any(skip in cert_name.lower() for skip in ['experience', 'education', 'phone', 'email']):
                certifications.append(f"{cert_name} ({year})")

        # Pattern 2: Known certifications
        known_certs = [
            r'(PMP)',
            r'(AWS\s+(?:Certified\s+)?[A-Za-z\s]+)',
            r'(Azure\s+(?:Certified\s+)?[A-Za-z\s]+)',
            r'(Google\s+Cloud\s+[A-Za-z\s]+)',
            r'(Cisco\s+Certified\s+[A-Za-z\s]+)',
            r'(Microsoft\s+Certified\s+[A-Za-z\s]+)',
            r'(LEED\s+[A-Za-z]+)',
            r'(Autodesk\s+[A-Za-z\s]+)',
            r'(Revit\s+Certified)',
        ]

        for pattern in known_certs:
            matches = re.finditer(pattern, cert_text, re.IGNORECASE)
            for match in matches:
                cert = match.group(1).strip()
                if cert not in [c.split('(')[0].strip() for c in certifications]:
                    certifications.append(cert)

        return certifications[:10]

    def _extract_total_experience(self, experiences: List[Dict]) -> str:
        """Calculate total experience from work history"""
        if not experiences:
            return ""

        total_months = 0
        for exp in experiences:
            duration = exp.get('duration', '')
            # Parse duration string
            years_match = re.search(r'(\d+)\s*year', duration)
            months_match = re.search(r'(\d+)\s*month', duration)

            if years_match:
                total_months += int(years_match.group(1)) * 12
            if months_match:
                total_months += int(months_match.group(1))

        if total_months < 12:
            return f"{total_months} months"
        else:
            years = total_months // 12
            months = total_months % 12
            if months == 0:
                return f"{years}+ years"
            else:
                return f"{years}+ years"

    def extract_from_resume(self, resume_text: str) -> Dict:
        """Extract comprehensive data from resume - MAIN ENTRY POINT"""
        if not resume_text:
            return self._get_empty_resume_data()

        # Preprocess
        text = self._preprocess_text(resume_text)

        # Extract sections
        sections = self._extract_sections(text)

        # Extract all fields
        name = self._extract_name(text)
        phones = self._extract_phones(text)
        emails = self._extract_emails(text)
        linkedin = self.compiled_linkedin.search(text)
        linkedin_url = linkedin.group(0) if linkedin else ""

        # DOB
        dob_match = re.search(r'(?:DOB|Date of Birth|Born)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text, re.IGNORECASE)
        dob = dob_match.group(1) if dob_match else ""

        # Location - multiple patterns
        location = ""
        location_patterns = [
            r'(?:Location|Address|Based in)[:\s]*([A-Za-z][A-Za-z\s,]+?)(?=\n|\||Email|Phone|$)',
            r'(?:Currently based in|Living in)[:\s]*([A-Za-z][A-Za-z\s,]+?)(?=\n|\||Email|Phone|$)',
        ]
        for pattern in location_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                location = match.group(1).strip()
                break

        # Work experience
        work_history = self._extract_work_experience(text, sections)

        # Education
        education = self._extract_education(text, sections)

        # Skills
        skills = self._extract_skills(text, sections)

        # Certifications
        certifications = self._extract_certifications(text, sections)

        # GCC Experience
        gcc_keywords = ['uae', 'dubai', 'abu dhabi', 'saudi', 'riyadh', 'ksa', 'qatar', 'bahrain', 'kuwait', 'oman', 'gcc']
        gcc_experience = any(kw in text.lower() for kw in gcc_keywords)

        # Relocation
        relocation = any(kw in text.lower() for kw in ['relocat', 'willing to move', 'open to relocation'])

        # Total experience
        total_exp = self._extract_total_experience(work_history)

        # Portfolio/GitHub
        github_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
        portfolio_match = re.search(r'(?:portfolio|behance|dribbble)[:\s]*(https?://[^\s]+)', text, re.IGNORECASE)

        return {
            'personal_info': {
                'full_name': name,
                'date_of_birth': dob,
                'current_location': location,
                'willing_to_relocate': 'Yes' if relocation else 'No',
            },
            'contact_details': {
                'phone_numbers': phones,
                'email_addresses': emails,
                'linkedin_url': linkedin_url,
                'github_url': github_match.group(0) if github_match else "",
                'portfolio_url': portfolio_match.group(1) if portfolio_match else "",
            },
            'experience_summary': {
                'total_experience': total_exp,
                'gcc_experience': 'Yes' if gcc_experience else 'No',
            },
            'work_history': work_history,
            'education': education,
            'skills': skills,
            'certifications': certifications,
        }

    def _get_empty_resume_data(self) -> Dict:
        """Return empty resume structure"""
        return {
            'personal_info': {
                'full_name': '',
                'date_of_birth': '',
                'current_location': '',
                'willing_to_relocate': '',
            },
            'contact_details': {
                'phone_numbers': [],
                'email_addresses': [],
                'linkedin_url': '',
                'github_url': '',
                'portfolio_url': '',
            },
            'experience_summary': {
                'total_experience': '',
                'gcc_experience': '',
            },
            'work_history': [],
            'education': [],
            'skills': [],
            'certifications': [],
        }

    # === FILE EXTRACTION METHODS (PDF, DOCX, Images) ===
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        try:
            import PyPDF2
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text
        except Exception as e:
            print(f"Error extracting PDF text: {str(e)}")
            return ""

    def extract_text_from_docx(self, docx_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            import docx
            doc = docx.Document(docx_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            print(f"Error extracting DOCX text: {str(e)}")
            return ""

    def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image using EasyOCR"""
        try:
            import easyocr
            reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            results = reader.readtext(image_path)
            extracted_lines = []
            for detection in results:
                text = detection[1]
                confidence = detection[2]
                if confidence > 0.3:
                    extracted_lines.append(text)
            return '\n'.join(extracted_lines)
        except Exception as e:
            print(f"Error extracting text from image: {str(e)}")
            return ""


# Backward compatibility
CandidateExtractor = DataExtractor
