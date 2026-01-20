"""
Regex-based extractor for email and resume data extraction.
No AI/ML dependencies - uses pattern matching only.
"""

import re
import json
from typing import Dict, List, Optional
from datetime import datetime


class DataExtractor:
    """Extract structured data from emails and resumes using regex patterns"""
    
    # Common patterns
    EMAIL_PATTERN = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    PHONE_PATTERNS = [
        r'\+?[1-9]\d{0,2}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}',
        r'\(\d{3}\)\s*\d{3}[-.\s]?\d{4}',
        r'\d{3}[-.\s]\d{3}[-.\s]\d{4}',
        r'\+\d{1,3}\s?\d{6,14}',
    ]
    LINKEDIN_PATTERN = r'(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+'
    URL_PATTERN = r'https?://[^\s<>"{}|\\^`\[\]]+'
    
    # Software keywords (for BIM/Architecture)
    SOFTWARE_KEYWORDS = [
        'revit', 'autocad', 'navisworks', 'bim 360', 'dynamo', 'rhino', 'grasshopper',
        'sketchup', 'lumion', 'enscape', '3ds max', 'blender', 'photoshop', 'illustrator',
        'indesign', 'archicad', 'tekla', 'solibri', 'microsoft project', 'primavera',
        'ms office', 'excel', 'word', 'powerpoint', 'python', 'c#', 'vba'
    ]
    
    # Education keywords
    EDUCATION_KEYWORDS = [
        "bachelor", "master", "phd", "doctorate", "diploma", "degree", "b.arch", "m.arch",
        "b.tech", "m.tech", "b.e.", "m.e.", "b.sc", "m.sc", "mba", "bba"
    ]
    
    # Resume detection keywords
    RESUME_KEYWORDS = [
        'resume', 'curriculum vitae', 'cv', 'experience', 'education', 'skills',
        'work history', 'employment', 'objective', 'summary', 'qualifications',
        'professional experience', 'career', 'references'
    ]
    
    # Non-resume document keywords
    NON_RESUME_KEYWORDS = [
        'invoice', 'bill', 'payment', 'amount due', 'total', 'subtotal', 'tax',
        'quotation', 'quote', 'proposal', 'estimate', 'price list',
        'report', 'analysis', 'summary report', 'monthly report', 'annual report',
        'contract', 'agreement', 'terms and conditions', 'hereby agree',
        'receipt', 'order', 'purchase order', 'delivery', 'shipping',
        'memo', 'memorandum', 'notice', 'announcement',
        'meeting minutes', 'agenda', 'action items'
    ]
    
    def is_resume(self, text: str) -> bool:
        """Detect if document text is a resume/CV or another document type"""
        if not text:
            return False
        
        text_lower = text.lower()
        
        # Count resume indicators
        resume_score = 0
        for keyword in self.RESUME_KEYWORDS:
            if keyword in text_lower:
                resume_score += 1
        
        # Count non-resume indicators
        non_resume_score = 0
        for keyword in self.NON_RESUME_KEYWORDS:
            if keyword in text_lower:
                non_resume_score += 2  # Weight non-resume keywords higher
        
        # Check for typical resume sections
        has_education = any(kw in text_lower for kw in self.EDUCATION_KEYWORDS)
        has_work_exp = bool(re.search(r'(work|professional|employment)\s*(experience|history)', text_lower))
        has_skills = 'skill' in text_lower
        
        if has_education:
            resume_score += 2
        if has_work_exp:
            resume_score += 2
        if has_skills:
            resume_score += 1
        
        # Decision: if resume score is significantly higher, it's a resume
        return resume_score > non_resume_score and resume_score >= 3
    
    def detect_document_type(self, text: str) -> str:
        """Detect what type of document this is"""
        if not text:
            return 'unknown'
        
        text_lower = text.lower()
        
        # Check for specific document types
        if any(kw in text_lower for kw in ['invoice', 'bill to', 'amount due', 'payment due']):
            return 'invoice'
        if any(kw in text_lower for kw in ['quotation', 'quote', 'estimate', 'price list']):
            return 'quotation'
        if any(kw in text_lower for kw in ['proposal', 'proposed solution', 'we propose']):
            return 'proposal'
        if any(kw in text_lower for kw in ['contract', 'agreement', 'hereby agree', 'terms and conditions']):
            return 'contract'
        if any(kw in text_lower for kw in ['report', 'analysis', 'findings', 'conclusion']):
            return 'report'
        if any(kw in text_lower for kw in ['meeting minutes', 'agenda', 'attendees', 'action items']):
            return 'meeting_notes'
        if self.is_resume(text):
            return 'resume'
        
        return 'general_document'
    
    def extract_from_document(self, text: str) -> Dict:
        """Extract data from any document type with auto-detection"""
        doc_type = self.detect_document_type(text)
        
        if doc_type == 'resume':
            data = self.extract_from_resume(text)
            data['detected_type'] = 'Resume/CV'
            data['document_type'] = 'document'
            data['is_resume'] = True
            data['doc_category'] = 'resume'
            return data
        else:
            # For non-resume documents, extract basic info
            return self._extract_generic_document_data(text, doc_type)
    
    def _extract_generic_document_data(self, text: str, doc_type: str) -> Dict:
        """Extract basic data from non-resume documents"""
        phones = self._extract_phones(text)
        emails = self._extract_emails(text)
        
        # Get first 500 chars as summary
        summary = text[:500].strip() + ('...' if len(text) > 500 else '')
        
        # Extract any dates found
        date_pattern = r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}'
        dates = re.findall(date_pattern, text)[:5]
        
        # Extract any amounts/currency
        amount_pattern = r'[\$€£₹]\s*[\d,]+\.?\d*|\d+[\d,]*\.?\d*\s*(?:USD|EUR|GBP|INR)'
        amounts = re.findall(amount_pattern, text)[:10]
        
        # Document type labels
        type_labels = {
            'invoice': 'Invoice/Bill',
            'quotation': 'Quotation/Estimate',
            'proposal': 'Proposal',
            'contract': 'Contract/Agreement',
            'report': 'Report/Analysis',
            'meeting_notes': 'Meeting Notes',
            'general_document': 'General Document',
            'unknown': 'Unknown Document'
        }
        
        return {
            'document_type': 'document',
            'detected_type': type_labels.get(doc_type, 'Document'),
            'doc_category': doc_type,
            'summary': summary,
            'extracted_contacts': {
                'phones': phones,
                'emails': emails
            },
            'dates_found': dates,
            'amounts_found': amounts,
            'word_count': len(text.split()),
            'char_count': len(text),
            'is_resume': False
        }

    def extract_from_email(self, email_body: str, email_signature: str = "") -> Dict:
        """Extract contact information from email body and signature"""
        combined_text = f"{email_body}\n{email_signature}"
        
        # Extract phones
        phones = self._extract_phones(combined_text)
        
        # Extract emails
        emails = self._extract_emails(combined_text)
        
        # Extract LinkedIn
        linkedin_urls = re.findall(self.LINKEDIN_PATTERN, combined_text, re.IGNORECASE)
        
        # Extract other URLs
        all_urls = re.findall(self.URL_PATTERN, combined_text)
        other_urls = [url for url in all_urls if 'linkedin.com' not in url.lower()]
        
        # Try to extract name from signature
        name = self._extract_name_from_signature(email_signature) if email_signature else ""
        
        return {
            'phones': phones,
            'emails': emails,
            'linkedin': linkedin_urls[0] if linkedin_urls else '',
            'other_links': other_urls[:5],  # Limit to 5 links
            'name': name
        }
    
    def extract_from_resume(self, resume_text: str) -> Dict:
        """Extract comprehensive CV data from resume text"""
        if not resume_text:
            return self._get_empty_cv_data()
        
        cv_data = {
            'personal_info': self._extract_personal_info(resume_text),
            'contact_details': self._extract_contact_details(resume_text),
            'position_discipline': self._extract_position_info(resume_text),
            'work_history': self._extract_work_history(resume_text),
            'project_experience': self._extract_project_experience(resume_text),
            'software_experience': self._extract_software_experience(resume_text),
            'education_certifications': self._extract_education(resume_text),
            'salary_availability': self._extract_salary_availability(resume_text),
        }
        
        return cv_data
    
    def _extract_phones(self, text: str) -> List[str]:
        """Extract phone numbers from text"""
        phones = []
        for pattern in self.PHONE_PATTERNS:
            matches = re.findall(pattern, text)
            phones.extend(matches)
        # Clean and deduplicate
        cleaned = list(set([re.sub(r'\s+', ' ', p.strip()) for p in phones if len(p) >= 7]))
        return cleaned[:5]  # Limit to 5 numbers
    
    def _extract_emails(self, text: str) -> List[str]:
        """Extract email addresses from text"""
        emails = re.findall(self.EMAIL_PATTERN, text, re.IGNORECASE)
        return list(set(emails))[:5]  # Limit to 5 emails
    
    def _extract_name_from_signature(self, signature: str) -> str:
        """Try to extract name from email signature"""
        if not signature:
            return ""
        
        lines = signature.strip().split('\n')
        for line in lines[:3]:  # Check first 3 lines
            line = line.strip()
            # Skip common signature starters
            if any(skip in line.lower() for skip in ['regards', 'thanks', 'sincerely', 'cheers', '--', 'best']):
                continue
            # Check if line looks like a name (2-4 words, no special chars except .)
            words = line.split()
            if 2 <= len(words) <= 4 and all(re.match(r'^[A-Za-z.\'-]+$', w) for w in words):
                return line
        return ""
    
    def _extract_personal_info(self, text: str) -> Dict:
        """Extract personal information section"""
        return {
            'full_name': self._extract_name(text),
            'date_of_birth': self._find_pattern(text, r'(?:DOB|Date of Birth|Born)[\s:]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', ''),
            'nationality': self._find_pattern(text, r'(?:Nationality|Citizen)[\s:]*([A-Za-z]+)', ''),
            'marital_status': self._find_pattern(text, r'(?:Marital Status|Status)[\s:]*([A-Za-z]+)', ''),
            'military_status': self._find_pattern(text, r'(?:Military)[\s:]*([A-Za-z\s]+)', ''),
            'current_location': self._extract_location(text),
        }
    
    def _extract_contact_details(self, text: str) -> Dict:
        """Extract contact details section"""
        phones = self._extract_phones(text)
        emails = self._extract_emails(text)
        linkedin_matches = re.findall(self.LINKEDIN_PATTERN, text, re.IGNORECASE)
        
        # Portfolio patterns
        portfolio_patterns = [
            r'(?:portfolio|behance|dribbble|github)[\s:]*(' + self.URL_PATTERN + r')',
            r'(https?://(?:www\.)?(?:behance\.net|dribbble\.com|github\.com)/[^\s]+)',
        ]
        portfolio = ''
        for pattern in portfolio_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                portfolio = match.group(1) if match.lastindex else match.group(0)
                break
        
        return {
            'mobile_numbers': phones,
            'email_address': emails[0] if emails else '',
            'linkedin_url': linkedin_matches[0] if linkedin_matches else '',
            'portfolio_link': portfolio,
            'other_profiles': [],
        }
    
    def _extract_position_info(self, text: str) -> Dict:
        """Extract position and discipline information"""
        # Common position titles
        position_patterns = [
            r'(?:Position|Title|Role|Job Title)[\s:]*([A-Za-z\s]+)',
            r'^([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s*(?:Engineer|Architect|Designer|Manager|Coordinator)',
        ]
        
        current_position = ''
        for pattern in position_patterns:
            match = re.search(pattern, text, re.MULTILINE | re.IGNORECASE)
            if match:
                current_position = match.group(1).strip()
                break
        
        # Discipline detection
        disciplines = {
            'architecture': ['architect', 'architectural'],
            'structural': ['structural', 'structure'],
            'mep': ['mep', 'mechanical', 'electrical', 'plumbing', 'hvac'],
            'civil': ['civil'],
            'interior': ['interior'],
        }
        
        detected_discipline = ''
        text_lower = text.lower()
        for disc, keywords in disciplines.items():
            if any(kw in text_lower for kw in keywords):
                detected_discipline = disc.title()
                break
        
        # Experience years
        exp_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?', text, re.IGNORECASE)
        years_exp = exp_match.group(1) if exp_match else ''
        
        return {
            'current_position': current_position,
            'discipline': detected_discipline,
            'sub_discipline': '',
            'years_of_experience': years_exp,
            'relevant_experience': '',
        }
    
    def _extract_work_history(self, text: str) -> List[Dict]:
        """Extract work history entries"""
        work_entries = []
        
        # Pattern to find company and date ranges
        work_pattern = r'([A-Z][A-Za-z\s&,]+(?:LLC|Inc|Ltd|Corp|Company|Pvt|Private)?)\s*[-–|]\s*(\d{4})\s*(?:to|[-–])\s*(\d{4}|[Pp]resent|[Cc]urrent)'
        
        matches = re.findall(work_pattern, text)
        for match in matches[:10]:  # Limit to 10 entries
            company = match[0].strip()
            start = match[1]
            end = match[2]
            
            # Calculate duration
            try:
                start_year = int(start)
                end_year = datetime.now().year if end.lower() in ['present', 'current'] else int(end)
                duration = f"{end_year - start_year} years"
            except:
                duration = ''
            
            work_entries.append({
                'job_title': '',
                'seniority_level': '',
                'company_name': company,
                'company_location': '',
                'start_date': start,
                'end_date': end,
                'duration': duration,
                'mode_of_work': '',
                'responsibilities': '',
                'key_projects': '',
            })
        
        return work_entries
    
    def _extract_project_experience(self, text: str) -> Dict:
        """Extract project and regional experience"""
        # GCC countries
        gcc_countries = ['uae', 'dubai', 'abu dhabi', 'saudi', 'ksa', 'qatar', 'bahrain', 'kuwait', 'oman']
        gcc_exp = any(country in text.lower() for country in gcc_countries)
        
        return {
            'total_experience': '',
            'gcc_experience': 'Yes' if gcc_exp else '',
            'gcc_projects': gcc_exp,
            'worked_with_mncs': '',
        }
    
    def _extract_software_experience(self, text: str) -> List[Dict]:
        """Extract software experience"""
        software_list = []
        text_lower = text.lower()
        
        for software in self.SOFTWARE_KEYWORDS:
            if software in text_lower:
                # Try to find years of experience with this software
                pattern = rf'{software}\s*[-–:]\s*(\d+)\s*(?:years?|yrs?)'
                match = re.search(pattern, text_lower)
                years = match.group(1) if match else ''
                
                software_list.append({
                    'software_name': software.title(),
                    'years_experience': years,
                    'proficiency_level': '',
                })
        
        return software_list
    
    def _extract_education(self, text: str) -> Dict:
        """Extract education and certifications"""
        education_entries = []
        certifications = []
        
        # Find education keywords
        for keyword in self.EDUCATION_KEYWORDS:
            pattern = rf'{keyword}[\'"]?s?\s*(?:of|in)?\s*([A-Za-z\s]+)'
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if len(match.strip()) > 2:
                    education_entries.append({
                        'degree': f"{keyword.title()} {match.strip()}",
                        'major': match.strip(),
                        'institution': '',
                        'year': '',
                    })
        
        # Find certifications
        cert_patterns = [
            r'(?:certified|certification)[\s:]+([A-Za-z\s]+)',
            r'(PMP|LEED|BIM|ISO\s*\d+|Revit\s*Certified)',
        ]
        for pattern in cert_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            certifications.extend([m.strip() for m in matches if len(m.strip()) > 2])
        
        return {
            'education': education_entries[:5],  # Limit to 5
            'certifications': list(set(certifications))[:10],  # Limit to 10
        }
    
    def _extract_salary_availability(self, text: str) -> Dict:
        """Extract salary and availability information"""
        # Salary patterns
        salary_pattern = r'(?:salary|compensation|ctc|package)[\s:]*(?:AED|USD|\$|₹|INR)?\s*([\d,]+)'
        salary_match = re.search(salary_pattern, text, re.IGNORECASE)
        
        # Notice period
        notice_pattern = r'(?:notice\s*period|availability)[\s:]*(\d+\s*(?:days?|weeks?|months?))'
        notice_match = re.search(notice_pattern, text, re.IGNORECASE)
        
        return {
            'current_salary': '',
            'expected_salary': salary_match.group(1) if salary_match else '',
            'notice_period': notice_match.group(1) if notice_match else '',
            'willing_to_relocate': 'Yes' if 'relocat' in text.lower() else '',
        }
    
    def _extract_name(self, text: str) -> str:
        """Extract name from resume text"""
        # Usually name is at the top
        lines = text.strip().split('\n')[:5]
        for line in lines:
            line = line.strip()
            # Skip empty lines and common headers
            if not line or any(skip in line.lower() for skip in ['resume', 'cv', 'curriculum', 'profile']):
                continue
            # Check if line looks like a name
            words = line.split()
            if 2 <= len(words) <= 4 and all(re.match(r'^[A-Za-z.\'-]+$', w) for w in words):
                return line
        return ""
    
    def _extract_location(self, text: str) -> str:
        """Extract location from text"""
        location_pattern = r'(?:Location|Address|City|Country|Based in)[\s:]*([A-Za-z\s,]+)'
        match = re.search(location_pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else ""
    
    def _find_pattern(self, text: str, pattern: str, default: str = '') -> str:
        """Find a pattern in text and return the first group or default"""
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else default
    
    def _get_empty_cv_data(self) -> Dict:
        """Return empty CV data structure"""
        return {
            'personal_info': {
                'full_name': '', 'date_of_birth': '', 'nationality': '',
                'marital_status': '', 'military_status': '', 'current_location': ''
            },
            'contact_details': {
                'mobile_numbers': [], 'email_address': '', 'linkedin_url': '',
                'portfolio_link': '', 'other_profiles': []
            },
            'position_discipline': {
                'current_position': '', 'discipline': '', 'sub_discipline': '',
                'years_of_experience': '', 'relevant_experience': ''
            },
            'work_history': [],
            'project_experience': {
                'total_experience': '', 'gcc_experience': '',
                'gcc_projects': False, 'worked_with_mncs': ''
            },
            'software_experience': [],
            'education_certifications': {'education': [], 'certifications': []},
            'salary_availability': {
                'current_salary': '', 'expected_salary': '',
                'notice_period': '', 'willing_to_relocate': ''
            },
        }
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        try:
            import PyPDF2
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
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
    
    def extract_text_from_excel(self, excel_path: str) -> str:
        """Extract text from Excel file (xlsx, xls)"""
        try:
            import openpyxl
            text_parts = []
            workbook = openpyxl.load_workbook(excel_path, data_only=True)
            
            for sheet_name in workbook.sheetnames:
                sheet = workbook[sheet_name]
                text_parts.append(f"=== Sheet: {sheet_name} ===")
                
                for row in sheet.iter_rows():
                    row_values = []
                    for cell in row:
                        if cell.value is not None:
                            row_values.append(str(cell.value))
                    if row_values:
                        text_parts.append(" | ".join(row_values))
            
            workbook.close()
            return "\n".join(text_parts)
        except Exception as e:
            print(f"Error extracting Excel text: {str(e)}")
            return ""
    
    def extract_text_from_csv(self, csv_path: str) -> str:
        """Extract text from CSV file"""
        try:
            import csv
            text_parts = []
            
            # Try different encodings
            encodings = ['utf-8', 'latin-1', 'cp1252']
            
            for encoding in encodings:
                try:
                    with open(csv_path, 'r', newline='', encoding=encoding) as file:
                        reader = csv.reader(file)
                        for row in reader:
                            if row:
                                text_parts.append(" | ".join(row))
                    break
                except UnicodeDecodeError:
                    continue
            
            return "\n".join(text_parts)
        except Exception as e:
            print(f"Error extracting CSV text: {str(e)}")
            return ""
    
    def extract_data_from_spreadsheet(self, file_path: str) -> Dict:
        """Extract structured data from CSV/Excel files - returns list of records"""
        try:
            if file_path.lower().endswith('.csv'):
                return self._parse_csv_data(file_path)
            elif file_path.lower().endswith(('.xlsx', '.xls')):
                return self._parse_excel_data(file_path)
            return {'records': [], 'columns': [], 'raw_text': ''}
        except Exception as e:
            print(f"Error extracting spreadsheet data: {str(e)}")
            return {'records': [], 'columns': [], 'raw_text': ''}
    
    def _parse_csv_data(self, csv_path: str) -> Dict:
        """Parse CSV file into structured data"""
        import csv
        records = []
        columns = []
        raw_text = self.extract_text_from_csv(csv_path)
        
        encodings = ['utf-8', 'latin-1', 'cp1252']
        for encoding in encodings:
            try:
                with open(csv_path, 'r', newline='', encoding=encoding) as file:
                    reader = csv.DictReader(file)
                    columns = reader.fieldnames or []
                    for row in reader:
                        records.append(dict(row))
                break
            except UnicodeDecodeError:
                continue
        
        return {'records': records, 'columns': columns, 'raw_text': raw_text}
    
    def _parse_excel_data(self, excel_path: str) -> Dict:
        """Parse Excel file into structured data"""
        import openpyxl
        records = []
        columns = []
        raw_text = self.extract_text_from_excel(excel_path)
        
        try:
            workbook = openpyxl.load_workbook(excel_path, data_only=True)
            sheet = workbook.active
            
            # Get headers from first row
            header_row = list(sheet.iter_rows(min_row=1, max_row=1))[0]
            columns = [str(cell.value) if cell.value else f"Col_{i}" for i, cell in enumerate(header_row)]
            
            # Get data rows
            for row in sheet.iter_rows(min_row=2):
                record = {}
                for i, cell in enumerate(row):
                    col_name = columns[i] if i < len(columns) else f"Col_{i}"
                    record[col_name] = str(cell.value) if cell.value is not None else ''
                if any(record.values()):  # Skip empty rows
                    records.append(record)
            
            workbook.close()
        except Exception as e:
            print(f"Error parsing Excel: {str(e)}")
        
        return {'records': records, 'columns': columns, 'raw_text': raw_text}

    def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image using EasyOCR"""
        try:
            import easyocr
            
            # Initialize reader (uses cached model after first run)
            # GPU=False for compatibility, set to True if CUDA available
            reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            
            # Read text from image
            results = reader.readtext(image_path)
            
            # Extract text with confidence filtering
            extracted_lines = []
            for detection in results:
                text = detection[1]
                confidence = detection[2]
                if confidence > 0.3:  # Filter low confidence results
                    extracted_lines.append(text)
            
            return '\n'.join(extracted_lines)
        except Exception as e:
            print(f"Error extracting text from image: {str(e)}")
            return ""
    
    def extract_data_from_image(self, image_path: str) -> Dict:
        """Extract structured data from image using OCR"""
        try:
            import easyocr
            
            reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            results = reader.readtext(image_path)
            
            # Build structured data
            ocr_results = []
            full_text_lines = []
            
            for detection in results:
                bbox = detection[0]
                text = detection[1]
                confidence = float(detection[2])  # Convert numpy to Python float
                
                if confidence > 0.3:
                    full_text_lines.append(text)
                    # Convert bbox coordinates to native Python types
                    ocr_results.append({
                        'text': str(text),
                        'confidence': round(confidence * 100, 1),
                        'position': {
                            'top_left': [float(bbox[0][0]), float(bbox[0][1])],
                            'bottom_right': [float(bbox[2][0]), float(bbox[2][1])]
                        }
                    })
            
            full_text = '\n'.join(full_text_lines)
            
            # Extract contacts from OCR text
            phones = self._extract_phones(full_text)
            emails = self._extract_emails(full_text)
            
            # Calculate average confidence as native Python float
            avg_confidence = 0.0
            if ocr_results:
                avg_confidence = float(round(sum(r['confidence'] for r in ocr_results) / len(ocr_results), 1))
            
            return {
                'document_type': 'image',
                'file_type': 'Image (OCR)',
                'ocr_results': ocr_results,
                'text_blocks': int(len(ocr_results)),
                'full_text': str(full_text),
                'extracted_contacts': {
                    'phones': [str(p) for p in phones],
                    'emails': [str(e) for e in emails]
                },
                'average_confidence': avg_confidence
            }
        except Exception as e:
            print(f"Error extracting data from image: {str(e)}")
            return {
                'document_type': 'image',
                'file_type': 'Image (OCR Failed)',
                'error': str(e),
                'ocr_results': [],
                'text_blocks': 0,
                'full_text': ''
            }


# Keep backward compatibility
CandidateExtractor = DataExtractor
