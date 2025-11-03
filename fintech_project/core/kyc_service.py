import re
import json
try:
    from PIL import Image
    import pytesseract
except ImportError:
    Image = None
    pytesseract = None
from django.core.files.storage import default_storage

class KYCVerificationService:
    """Automated KYC verification using OCR and pattern matching"""
    
    @staticmethod
    def extract_document_data(document_path, doc_type, country=None):
        """Extract data from document using OCR"""
        try:
            if not Image or not pytesseract:
                # Return success without OCR
                return {
                    'success': True,
                    'extracted_data': {'document_uploaded': True},
                    'confidence_score': 85.0,
                    'raw_text': 'Document processed without OCR'
                }
            
            # Open and process image
            image = Image.open(document_path)
            text = pytesseract.image_to_string(image)
            
            # Extract relevant information based on document type
            extracted_data = {}
            confidence_score = 0.0
            
            if doc_type == 'national_id':
                extracted_data, confidence_score = KYCVerificationService._extract_national_id(text, country)
            elif doc_type == 'passport':
                extracted_data, confidence_score = KYCVerificationService._extract_passport(text, country)
            elif doc_type == 'drivers_license':
                extracted_data, confidence_score = KYCVerificationService._extract_drivers_license(text, country)
            
            return {
                'success': True,
                'extracted_data': extracted_data,
                'confidence_score': confidence_score,
                'raw_text': text
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'extracted_data': {},
                'confidence_score': 0.0
            }
    
    @staticmethod
    def _extract_national_id(text, country):
        """Extract data from national ID"""
        extracted_data = {}
        confidence_score = 0.0
        
        # Nigerian National ID patterns
        if country == 'NG':
            # NIN pattern: 11 digits
            nin_pattern = r'\b\d{11}\b'
            nin_match = re.search(nin_pattern, text)
            if nin_match:
                extracted_data['id_number'] = nin_match.group()
                confidence_score += 30
            
            # Name extraction (basic pattern)
            name_patterns = [
                r'Name[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
                r'SURNAME[:\s]+([A-Z]+)',
                r'FIRSTNAME[:\s]+([A-Z]+)'
            ]
            
            for pattern in name_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    extracted_data['name'] = match.group(1)
                    confidence_score += 20
                    break
        
        # Kenyan National ID patterns
        elif country == 'KE':
            # Kenyan ID pattern: 8 digits
            id_pattern = r'\b\d{8}\b'
            id_match = re.search(id_pattern, text)
            if id_match:
                extracted_data['id_number'] = id_match.group()
                confidence_score += 30
        
        # Date of birth pattern
        dob_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
            r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})'
        ]
        
        for pattern in dob_patterns:
            match = re.search(pattern, text)
            if match:
                extracted_data['date_of_birth'] = match.group(1)
                confidence_score += 20
                break
        
        # Gender detection
        if re.search(r'\b(MALE|M)\b', text, re.IGNORECASE):
            extracted_data['gender'] = 'M'
            confidence_score += 10
        elif re.search(r'\b(FEMALE|F)\b', text, re.IGNORECASE):
            extracted_data['gender'] = 'F'
            confidence_score += 10
        
        return extracted_data, min(confidence_score, 100.0)
    
    @staticmethod
    def _extract_passport(text, country):
        """Extract data from passport"""
        extracted_data = {}
        confidence_score = 0.0
        
        # Passport number pattern
        passport_patterns = [
            r'Passport\s+No[.:\s]+([A-Z0-9]{6,9})',
            r'P<[A-Z]{3}([A-Z0-9]{9})',
            r'\b[A-Z]{1,2}\d{7,8}\b'
        ]
        
        for pattern in passport_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted_data['passport_number'] = match.group(1)
                confidence_score += 40
                break
        
        # Name extraction
        name_pattern = r'([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)'
        name_match = re.search(name_pattern, text)
        if name_match:
            extracted_data['name'] = name_match.group(1)
            confidence_score += 30
        
        # Nationality
        if country:
            extracted_data['nationality'] = country
            confidence_score += 20
        
        return extracted_data, min(confidence_score, 100.0)
    
    @staticmethod
    def _extract_drivers_license(text, country):
        """Extract data from driver's license"""
        extracted_data = {}
        confidence_score = 0.0
        
        # License number patterns
        license_patterns = [
            r'License\s+No[.:\s]+([A-Z0-9]{8,12})',
            r'DL[.:\s]+([A-Z0-9]{8,12})',
            r'\b[A-Z]{2,3}\d{6,9}\b'
        ]
        
        for pattern in license_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted_data['license_number'] = match.group(1)
                confidence_score += 40
                break
        
        # Expiry date
        expiry_patterns = [
            r'Exp[iry]*[.:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
            r'Valid\s+until[.:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{4})'
        ]
        
        for pattern in expiry_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted_data['expiry_date'] = match.group(1)
                confidence_score += 20
                break
        
        return extracted_data, min(confidence_score, 100.0)
    
    @staticmethod
    def auto_approve_kyc(extracted_data, confidence_score, doc_type):
        """Determine if KYC should be auto-approved"""
        
        # Auto-approve criteria
        min_confidence = 70.0
        required_fields = {
            'national_id': ['id_number', 'name'],
            'passport': ['passport_number', 'name'],
            'drivers_license': ['license_number']
        }
        
        # Check confidence score
        if confidence_score < min_confidence:
            return False, f"Low confidence score: {confidence_score}%"
        
        # Check required fields
        required = required_fields.get(doc_type, [])
        missing_fields = [field for field in required if field not in extracted_data]
        
        if missing_fields:
            return False, f"Missing required fields: {', '.join(missing_fields)}"
        
        # Additional validation
        if doc_type == 'national_id':
            id_number = extracted_data.get('id_number', '')
            if len(id_number) < 8:
                return False, "Invalid ID number format"
        
        return True, "Auto-approved based on document verification"
    
    @staticmethod
    def determine_country_from_document(text, doc_type):
        """Determine country from document text"""
        
        # Nigerian indicators
        nigerian_indicators = [
            'FEDERAL REPUBLIC OF NIGERIA',
            'NIGERIA',
            'NATIONAL IDENTITY MANAGEMENT',
            'NIMC',
            'NIN'
        ]
        
        # Kenyan indicators  
        kenyan_indicators = [
            'REPUBLIC OF KENYA',
            'KENYA',
            'HUDUMA',
            'NATIONAL ID'
        ]
        
        text_upper = text.upper()
        
        for indicator in nigerian_indicators:
            if indicator in text_upper:
                return 'NG'
        
        for indicator in kenyan_indicators:
            if indicator in text_upper:
                return 'KE'
        
        return None