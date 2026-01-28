"""
FINAL PRODUCTION-READY RESUME PARSER
====================================
No AI/ML dependencies - Pure regex-based extraction
Tested and working on real resumes

Author: Resume Parser v2.0
Date: January 2026
"""

import re
import json
from typing import Dict, List, Optional
from datetime import datetime


class ResumeParser:
    """
    Production-ready resume parser that extracts:
    - Personal info (name, contact, DOB, location)
    - Education (degree, major, institution, CGPA, year)
    - Work experience (job title, company, dates, location)
    - Skills (technical skills with proper spacing)
    - Certifications (with years)
    """

    def __init__(self):
        """Initialize parser with compiled patterns"""
        # Compile regex patterns for performance
        self.email_pattern = re.compile(
            r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b',
            re.IGNORECASE
        )
        self.linkedin_pattern = re.compile(
            r'(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+',
            re.IGNORECASE
        )

        # Comprehensive skills database (easily expandable)
        self.skills_db = [
            # BIM/Architecture
            'Revit', 'AutoCAD', 'Navisworks', 'BIM 360', 'Dynamo', 'Autodesk Recap', 
            'ACC', 'Rhino', 'Grasshopper', 'SketchUp', 'Lumion', 'Enscape', 
            '3ds Max', 'Blender', 'ArchiCAD', 'Tekla', 'Solibri',

            # Design Tools
            'Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Adobe XD', 'Sketch',
            'CorelDRAW', 'GIMP',

            # Programming Languages
            'Python', 'JavaScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 
            'Rust', 'TypeScript', 'Swift', 'Kotlin', 'R', 'MATLAB', 'VBA',

            # Web Development
            'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'FastAPI',
            'Express.js', 'Next.js', 'Nuxt.js', 'React Native', 'Flutter',
            'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind CSS',

            # Databases
            'MongoDB', 'MySQL', 'PostgreSQL', 'Oracle', 'SQL Server', 'Redis',
            'SQLite', 'Cassandra', 'DynamoDB', 'Firebase',

            # Cloud & DevOps
            'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes',
            'Jenkins', 'Git', 'GitHub', 'GitLab', 'Terraform', 'Ansible',
            'CI/CD', 'CircleCI', 'Travis CI',

            # Data Science & ML
            'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
            'Jupyter', 'Keras', 'OpenCV', 'NLTK', 'SpaCy',

            # Business Intelligence
            'Tableau', 'Power BI', 'Looker', 'QlikView', 'Grafana',

            # Office & Productivity
            'MS Office', 'Microsoft Office', 'Excel', 'Word', 'PowerPoint',
            'Outlook', 'Google Sheets', 'Google Docs',

            # Project Management
            'Jira', 'Trello', 'Asana', 'Monday.com', 'Microsoft Project',
            'Primavera', 'MS Project',
        ]

        # Month mapping for date parsing
        self.months = {
            'jan': 1, 'january': 1,
            'feb': 2, 'february': 2,
            'mar': 3, 'march': 3,
            'apr': 4, 'april': 4,
            'may': 5,
            'jun': 6, 'june': 6,
            'jul': 7, 'july': 7,
            'aug': 8, 'august': 8,
            'sep': 9, 'sept': 9, 'september': 9,
            'oct': 10, 'october': 10,
            'nov': 11, 'november': 11,
            'dec': 12, 'december': 12,
        }

    def clean_text(self, text: str) -> str:
        """Clean and normalize resume text"""
        if not text:
            return ""

        # Remove extra spaces (but keep newlines)
        text = re.sub(r'[ \t]+', ' ', text)
        # Normalize multiple newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        # Remove bullet points at line start
        text = re.sub(r'^[•●○■□▪▫–—→›]\s*', '', text, flags=re.MULTILINE)

        return text.strip()

    def extract_name(self, text: str) -> str:
        """Extract candidate name from resume header"""
        lines = text.strip().split('\n')[:20]

        # Words to skip when looking for name
        skip_keywords = [
            'resume', 'cv', 'curriculum', 'vitae', 'phone', 'email', 
            'address', 'linkedin', 'github', 'portfolio', 'objective',
            'summary', 'profile', 'contact'
        ]

        for line in lines:
            line = line.strip()

            # Skip empty lines or very short lines
            if not line or len(line) < 3:
                continue

            # Skip lines with email or phone
            if '@' in line or re.search(r'\+?\d[\d\s.-]{7,}', line):
                continue

            # Skip header keywords
            if any(skip in line.lower() for skip in skip_keywords):
                continue

            # Check if line looks like a name
            words = line.split()
            if 2 <= len(words) <= 5:
                # All words should start with capital letter
                if all(w[0].isupper() for w in words if w):
                    # Should only contain letters, spaces, dots, hyphens, apostrophes
                    if re.match(r'^[A-Za-z][A-Za-z\s.\'-]+$', line):
                        # Return title case if all caps, otherwise as-is
                        return line.title() if line.isupper() else line

        return ""

    def extract_phones(self, text: str) -> List[str]:
        """Extract phone numbers (filtered to avoid false positives)"""
        phone_patterns = [
            r'\+\d{1,3}[\s.-]?\d{8,12}\b',  # International: +91 1234567890
            r'\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b',  # US: 123-456-7890
            r'\(\d{3}\)\s*\d{3}[\s.-]?\d{4}\b',  # (123) 456-7890
            r'\b\d{10}\b',  # Plain 10 digits
        ]

        phones = []

        for pattern in phone_patterns:
            matches = re.findall(pattern, text)

            for match in matches:
                # Get context around the match
                match_pos = text.find(match)
                if match_pos == -1:
                    continue

                # Check 30 characters before and after
                start = max(0, match_pos - 30)
                end = min(len(text), match_pos + len(match) + 30)
                context = text[start:end].lower()

                # Skip if it's part of LinkedIn URL or near 'linkedin'/'github'
                if any(word in context for word in ['linkedin', 'github', '/in/', 'profile']):
                    continue

                # Clean the phone number
                clean_phone = re.sub(r'\s+', ' ', match.strip())

                # Must be at least 10 digits
                digits_only = re.sub(r'[^0-9]', '', clean_phone)
                if len(digits_only) >= 10 and clean_phone not in phones:
                    phones.append(clean_phone)

        return phones[:3]  # Return max 3 phone numbers

    def extract_emails(self, text: str) -> List[str]:
        """Extract email addresses"""
        emails = self.email_pattern.findall(text)
        # Deduplicate while preserving order
        return list(dict.fromkeys(emails))[:3]

    def extract_linkedin(self, text: str) -> str:
        """Extract LinkedIn profile URL"""
        match = self.linkedin_pattern.search(text)
        return match.group(0) if match else ""

    def extract_github(self, text: str) -> str:
        """Extract GitHub profile URL"""
        github_pattern = r'(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_-]+'
        match = re.search(github_pattern, text, re.IGNORECASE)
        return match.group(0) if match else ""

    def extract_education(self, text: str) -> List[Dict]:
        """Extract education details with degree, major, institution, year, CGPA"""
        educations = []

        # Degree patterns that capture: degree, major, institution, year, CGPA
        degree_patterns = [
            # Bachelor of Engineering / B.E.
            (r'(B\.E\.|Bachelor\s+of\s+Engineering)(?:[,\s]+in)?[,\s]+(\w+(?:\s+\w+){0,3})',
             r'([A-Z][^\n]{10,100}?(?:University|College|Institute|Technology|School))',
             r'(\d{4})',
             r'CGPA[:\s]+(\d+\.\d+(?:/\d+)?)'),

            # Bachelor of Technology / B.Tech
            (r'(B\.Tech|Bachelor\s+of\s+Technology)(?:[,\s]+in)?[,\s]+(\w+(?:\s+\w+){0,3})',
             r'([A-Z][^\n]{10,100}?(?:University|College|Institute|Technology|School))',
             r'(\d{4})',
             r'CGPA[:\s]+(\d+\.\d+(?:/\d+)?)'),

            # Master's degrees
            (r'(M\.Tech|M\.E\.|Master\s+of\s+(?:Technology|Engineering))(?:[,\s]+in)?[,\s]+(\w+(?:\s+\w+){0,3})',
             r'([A-Z][^\n]{10,100}?(?:University|College|Institute|Technology|School))',
             r'(\d{4})',
             r'CGPA[:\s]+(\d+\.\d+(?:/\d+)?)'),

            # MBA, BBA, etc.
            (r'(MBA|BBA|MCA|BCA|B\.Sc|M\.Sc|B\.A|M\.A)(?:[,\s]+in)?[,\s]+(\w+(?:\s+\w+){0,3})?',
             r'([A-Z][^\n]{10,100}?(?:University|College|Institute|School))',
             r'(\d{4})',
             r'CGPA[:\s]+(\d+\.\d+(?:/\d+)?)'),
        ]

        for degree_pattern, inst_pattern, year_pattern, cgpa_pattern in degree_patterns:
            degree_matches = re.finditer(degree_pattern, text, re.IGNORECASE)

            for deg_match in degree_matches:
                degree = deg_match.group(1).strip()
                major = deg_match.group(2).strip() if deg_match.lastindex >= 2 else ""

                # Clean major - remove trailing junk
                if major:
                    major = re.sub(r'[,\n].*$', '', major).strip()
                    major = major[:60]  # Limit length

                # Find institution near this degree
                search_start = deg_match.end()
                search_text = text[search_start:search_start+300]

                institution = ""
                inst_match = re.search(inst_pattern, search_text)
                if inst_match:
                    institution = inst_match.group(1).strip()
                    # Clean institution name
                    institution = re.sub(r'\s*[–-].*$', '', institution).strip()

                # Find year
                year = ""
                year_match = re.search(year_pattern, search_text)
                if year_match:
                    year = year_match.group(1)

                # Find CGPA
                cgpa = ""
                cgpa_match = re.search(cgpa_pattern, search_text, re.IGNORECASE)
                if cgpa_match:
                    cgpa = cgpa_match.group(1)

                # Add education entry
                edu_entry = {
                    'degree': degree,
                    'major': major,
                    'institution': institution,
                    'year': year,
                    'cgpa': cgpa
                }

                # Avoid duplicates
                if not any(e['degree'] == degree and e['major'] == major for e in educations):
                    educations.append(edu_entry)

        return educations[:5]

    def extract_skills(self, text: str) -> List[str]:
        """Extract technical skills with proper spacing and capitalization"""
        found_skills = []
        text_lower = text.lower()

        for skill in self.skills_db:
            skill_lower = skill.lower()

            # Check if skill exists in text
            if skill_lower in text_lower:
                # Find actual match in original text to preserve capitalization
                pattern = re.compile(re.escape(skill), re.IGNORECASE)
                match = pattern.search(text)

                if match:
                    # Use the match from original text (preserves case)
                    found_skills.append(match.group(0))

        # Deduplicate while preserving order
        return list(dict.fromkeys(found_skills))

    def extract_work_experience(self, text: str) -> List[Dict]:
        """Extract work experience with job title, company, location, dates"""
        experiences = []

        # Pattern: Job Title \n Company \n Month Year - Month Year
        exp_pattern = r'((?:Senior|Junior|Lead|Principal|Associate|Staff)?\s*(?:BIM|Software|Data|Cloud|Full[- ]?Stack|Front[- ]?End|Back[- ]?End)?\s*(?:Engineer|Developer|Architect|Designer|Manager|Analyst|Consultant|Coordinator|Specialist|Modeler))\s*\n\s*([A-Z][A-Za-z0-9\s&.,()\'-]+?)(?:\s*[–-]\s*([A-Za-z\s,]+?))?\s*\n\s*((?:January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*\s+\d{4})\s*[–-]\s*((?:January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*\s+\d{4}|Present|Current)'

        matches = re.finditer(exp_pattern, text, re.IGNORECASE | re.MULTILINE)

        for match in matches:
            job_title = match.group(1).strip()
            company = match.group(2).strip()
            location = match.group(3).strip() if match.group(3) else ""
            start_date = match.group(4).strip()
            end_date = match.group(5).strip()

            # Clean company name - remove trailing dashes/junk
            company = re.sub(r'\s*[–-]\s*$', '', company).strip()
            company = company[:100]  # Limit length

            # Calculate duration
            duration = self._calculate_duration(start_date, end_date)

            experiences.append({
                'job_title': job_title,
                'company': company,
                'location': location,
                'start_date': start_date,
                'end_date': end_date,
                'duration': duration,
                'period': f"{start_date} – {end_date}"
            })

        return experiences[:10]

    def _calculate_duration(self, start_date: str, end_date: str) -> str:
        """Calculate duration between two dates"""
        try:
            # Extract year from start date
            start_year_match = re.search(r'\d{4}', start_date)
            if not start_year_match:
                return ""
            start_year = int(start_year_match.group())

            # Extract month from start date
            start_month_match = re.search(r'(January|February|March|April|May|June|July|August|September|October|November|December)', start_date, re.IGNORECASE)
            start_month = 1
            if start_month_match:
                month_name = start_month_match.group(1).lower()
                start_month = self.months.get(month_name, 1)

            # Extract year and month from end date
            if end_date.lower() in ['present', 'current']:
                end_year = datetime.now().year
                end_month = datetime.now().month
            else:
                end_year_match = re.search(r'\d{4}', end_date)
                if not end_year_match:
                    return ""
                end_year = int(end_year_match.group())

                end_month_match = re.search(r'(January|February|March|April|May|June|July|August|September|October|November|December)', end_date, re.IGNORECASE)
                end_month = 12
                if end_month_match:
                    month_name = end_month_match.group(1).lower()
                    end_month = self.months.get(month_name, 12)

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

    def extract_certifications(self, text: str) -> List[str]:
        """Extract certifications with years"""
        certifications = []

        # Pattern: Provider + Name, Year
        cert_patterns = [
            r'(Autodesk|Microsoft|AWS|Azure|Google Cloud|Cisco|Oracle|PMP|CompTIA|Red Hat|Salesforce)\s+([A-Za-z\s&-]+?)(?:,|\s+)(\d{4})',
            r'([A-Z][A-Za-z\s]+?)\s+(?:Certified|Certification)(?:,|\s+)(\d{4})',
        ]

        for pattern in cert_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)

            for match in matches:
                if len(match.groups()) >= 2:
                    cert_name = match.group(1).strip()
                    if len(match.groups()) == 3:
                        cert_details = match.group(2).strip()
                        year = match.group(3).strip()
                        cert_full = f"{cert_name} {cert_details} ({year})"
                    else:
                        year = match.group(2).strip()
                        cert_full = f"{cert_name} ({year})"

                    if cert_full not in certifications:
                        certifications.append(cert_full)

        return certifications[:10]

    def extract_location(self, text: str) -> str:
        """Extract current location"""
        location_patterns = [
            r'(?:Currently based in|Based in|Location|Lives in)[:\s]*([A-Za-z][A-Za-z\s,]+?)(?=\n|\||Email|Phone|$)',
            r'(?:Current Location)[:\s]*([A-Za-z][A-Za-z\s,]+?)(?=\n|\||Email|Phone|$)',
        ]

        for pattern in location_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                location = match.group(1).strip()
                # Remove trailing junk
                location = re.sub(r'\s*[|–-].*$', '', location).strip()
                if len(location) < 50:  # Reasonable length
                    return location

        return ""

    def extract_summary(self, text: str) -> str:
        """Extract professional summary (usually the first paragraph)"""
        if not text:
            return ""
            
        lines = text.split('\n')
        summary_lines = []
        capture = False
        
        # Keywords that start the summary section
        summary_headers = ['summary', 'profile', 'professional summary', 'objective', 'about me', 'executive summary']
        
        # Scan for header
        for i, line in enumerate(lines[:30]):  # Check first 30 lines
            line_lower = line.strip().lower()
            
            # Found header
            if any(header in line_lower for header in summary_headers) and len(line_lower) < 30:
                capture = True
                continue
                
            # Stop capturing if we hit another section
            if capture:
                # Key sections that end the summary
                if any(k in line_lower for k in ['experience', 'education', 'skills', 'projects', 'certifications', 'languages']):
                    break
                
                # If line is not empty, add it
                if line.strip():
                    summary_lines.append(line.strip())
                    
                # Limit summary length (e.g., 5-6 lines max)
                if len(summary_lines) > 8:
                    break
        
        # If no explicit header found, try to guess (first block of text after header)
        if not summary_lines:
            # Skip potential name/contact info (heuristic: skip first 5-10 non-empty lines if short)
             pass 

        return ' '.join(summary_lines)

    def parse(self, resume_text: str) -> Dict:
        """
        Main parsing method - returns structured resume data

        Args:
            resume_text: Raw resume text (from PDF, DOCX, or any source)

        Returns:
            Dictionary with all extracted fields
        """
        # Clean the text first
        text = self.clean_text(resume_text)

        # Extract all fields
        name = self.extract_name(text)
        emails = self.extract_emails(text)
        phones = self.extract_phones(text)
        linkedin = self.extract_linkedin(text)
        github = self.extract_github(text)
        location = self.extract_location(text)
        education = self.extract_education(text)
        skills = self.extract_skills(text)
        work_history = self.extract_work_experience(text)
        certifications = self.extract_certifications(text)
        summary = self.extract_summary(text)  # Added summary extraction

        # Extract DOB
        dob_match = re.search(r'(?:DOB|Date of Birth|Born)[:\s]*(\d{1,2}/\d{1,2}/\d{4})', text, re.IGNORECASE)
        dob = dob_match.group(1) if dob_match else ""

        # Extract years of experience
        exp_match = re.search(r'(\d+)\+?\s*years?\s*(?:of\s+)?experience', text, re.IGNORECASE)
        years_experience = exp_match.group(1) if exp_match else ""

        # Check for GCC experience
        gcc_keywords = ['gcc', 'uae', 'dubai', 'abu dhabi', 'saudi', 'riyadh', 'qatar', 'bahrain', 'kuwait', 'oman']
        has_gcc_exp = any(keyword in text.lower() for keyword in gcc_keywords)

        # Check for relocation willingness
        relocation_keywords = ['open to relocation', 'willing to relocate', 'ready to relocate', 'can relocate']
        willing_to_relocate = any(keyword in text.lower() for keyword in relocation_keywords)

        # Build result dictionary - CLEAN NEW FORMAT
        result = {
            'personal_info': {
                'name': name,
                'email': emails[0] if emails else "",
                'phone': phones[0] if phones else "",
                'all_phones': phones,
                'all_emails': emails,
                'linkedin': linkedin,
                'github': github,
                'dob': dob,
                'location': location,
                'summary': summary, # Added summary
            },
            'professional_info': {
                'years_experience': years_experience,
                'gcc_experience': 'Yes' if has_gcc_exp else 'No',
                'willing_to_relocate': 'Yes' if willing_to_relocate else 'No',
            },
            'education': education,
            'skills': skills,
            'work_history': work_history,
            'certifications': certifications,
        }

        return result

    # === BACKWARD COMPATIBILITY METHOD ===
    def extract_from_resume(self, resume_text: str) -> Dict:
        """
        Backward compatibility wrapper for parse()
        Maintains compatibility with existing code that calls extract_from_resume()
        """
        return self.parse(resume_text)

    # === FILE EXTRACTION METHODS ===

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file (requires: pip install PyPDF2)"""
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
        except ImportError:
            print("Error: PyPDF2 not installed. Run: pip install PyPDF2")
            return ""
        except Exception as e:
            print(f"Error extracting PDF text: {str(e)}")
            return ""

    def extract_text_from_docx(self, docx_path: str) -> str:
        """Extract text from DOCX file (requires: pip install python-docx)"""
        try:
            import docx
            doc = docx.Document(docx_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except ImportError:
            print("Error: python-docx not installed. Run: pip install python-docx")
            return ""
        except Exception as e:
            print(f"Error extracting DOCX text: {str(e)}")
            return ""

    def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image using OCR (requires: pip install easyocr)"""
        try:
            import easyocr
            reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            results = reader.readtext(image_path)

            extracted_lines = []
            for detection in results:
                text = detection[1]
                confidence = detection[2]
                if confidence > 0.3:  # Filter low confidence
                    extracted_lines.append(text)

            return '\n'.join(extracted_lines)
        except ImportError:
            print("Error: easyocr not installed. Run: pip install easyocr")
            return ""
        except Exception as e:
            print(f"Error extracting text from image: {str(e)}")
            return ""

    def parse_from_file(self, file_path: str) -> Dict:
        """
        Parse resume from file (PDF, DOCX, or image)

        Args:
            file_path: Path to resume file

        Returns:
            Dictionary with extracted data
        """
        file_lower = file_path.lower()

        if file_lower.endswith('.pdf'):
            text = self.extract_text_from_pdf(file_path)
        elif file_lower.endswith('.docx'):
            text = self.extract_text_from_docx(file_path)
        elif file_lower.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff')):
            text = self.extract_text_from_image(file_path)
        else:
            print(f"Unsupported file type: {file_path}")
            return {}

        if text:
            return self.parse(text)
        else:
            return {}


    def extract_from_email(self, email_body: str, email_signature: str = "") -> Dict:
        """Extract contact information from email body and signature"""
        combined_text = f"{email_body}\n{email_signature}"
        
        # Extract phones and emails
        phones = self.extract_phones(combined_text)
        emails = self.extract_emails(combined_text)
        linkedin = self.extract_linkedin(combined_text)
        
        # Extract other URLs
        all_urls = re.findall(r'https?://[^\s<>"{}|\\^`\[\]]+', combined_text)
        other_urls = [url for url in all_urls if 'linkedin.com' not in url.lower()]
        
        # Try to extract name from signature
        name = ""
        if email_signature:
            lines = email_signature.strip().split('\n')
            for line in lines[:3]:  # Check first 3 lines
                line = line.strip()
                # Skip common signature starters
                if any(skip in line.lower() for skip in ['regards', 'thanks', 'sincerely', 'cheers', '--', 'best']):
                    continue
                # Check if line looks like a name
                words = line.split()
                if 2 <= len(words) <= 4 and all(re.match(r'^[A-Za-z.\'-]+$', w) for w in words):
                    name = line
                    break
        
        return {
            'phones': phones,
            'emails': emails,
            'linkedin': linkedin,
            'other_links': other_urls[:5],
            'name': name
        }


# === BACKWARD COMPATIBILITY ALIASES ===
DataExtractor = ResumeParser  # Main alias for existing code
CandidateExtractor = ResumeParser  # Additional alias if needed
