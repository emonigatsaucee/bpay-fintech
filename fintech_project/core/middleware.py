import time
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware(MiddlewareMixin):
    """Rate limiting middleware for API endpoints"""
    
    def process_request(self, request):
        if not request.path.startswith('/api/'):
            return None
            
        # Get client IP
        ip = self.get_client_ip(request)
        
        # Different limits for different endpoints
        if '/api/auth/' in request.path:
            limit, window = 5, 300  # 5 requests per 5 minutes for auth
        elif '/api/wallets/' in request.path and request.method == 'POST':
            limit, window = 10, 60  # 10 transactions per minute
        else:
            limit, window = 100, 60  # 100 requests per minute for other endpoints
            
        # Check rate limit
        cache_key = f"rate_limit:{ip}:{request.path}"
        current_requests = cache.get(cache_key, 0)
        
        if current_requests >= limit:
            logger.warning(f"Rate limit exceeded for IP {ip} on {request.path}")
            return JsonResponse({
                'error': 'Rate limit exceeded. Please try again later.'
            }, status=429)
            
        # Increment counter
        cache.set(cache_key, current_requests + 1, window)
        return None
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class SecurityHeadersMiddleware(MiddlewareMixin):
    """Add security headers to all responses"""
    
    def process_response(self, request, response):
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response

class AuditLogMiddleware(MiddlewareMixin):
    """Log all financial operations for audit trail"""
    
    def process_request(self, request):
        # Log financial operations
        if (request.path.startswith('/api/wallets/') or 
            request.path.startswith('/api/transactions/')) and request.method in ['POST', 'PUT', 'PATCH']:
            
            user = getattr(request, 'user', None)
            logger.info(f"Financial operation: {request.method} {request.path} by {user}")
        
        return None