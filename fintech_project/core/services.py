import requests
from decimal import Decimal
from .models import ExchangeRate

class CryptoRateService:
    @staticmethod
    def fetch_rates():
        """Fetch real-time crypto rates from CoinGecko API"""
        try:
            # Free CoinGecko API
            url = "https://api.coingecko.com/api/v3/simple/price"
            params = {
                'ids': 'bitcoin,ethereum,tether,binancecoin,cardano,solana,polkadot,dogecoin',
                'vs_currencies': 'usd,ngn,kes'
            }
            
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            rates = []
            
            # Crypto mapping
            crypto_map = {
                'bitcoin': 'BTC',
                'ethereum': 'ETH', 
                'tether': 'USDT',
                'binancecoin': 'BNB',
                'cardano': 'ADA',
                'solana': 'SOL',
                'polkadot': 'DOT',
                'dogecoin': 'DOGE'
            }
            
            # Process all crypto rates
            for crypto_id, symbol in crypto_map.items():
                if crypto_id in data:
                    crypto_data = data[crypto_id]
                    for currency in ['usd', 'ngn', 'kes']:
                        if currency in crypto_data:
                            rates.append((symbol, currency.upper(), crypto_data[currency]))
            
            # Update database
            for from_curr, to_curr, rate in rates:
                ExchangeRate.objects.update_or_create(
                    from_currency=from_curr,
                    to_currency=to_curr,
                    defaults={'rate': Decimal(str(rate))}
                )
                
                # Also create reverse rate
                if rate > 0:
                    ExchangeRate.objects.update_or_create(
                        from_currency=to_curr,
                        to_currency=from_curr,
                        defaults={'rate': Decimal(str(1/rate))}
                    )
            
            return True
            
        except Exception as e:
            print(f"Error fetching crypto rates: {e}")
            return False
    
    @staticmethod
    def get_rate(from_currency, to_currency):
        """Get exchange rate between two currencies"""
        try:
            rate = ExchangeRate.objects.get(
                from_currency=from_currency,
                to_currency=to_currency
            )
            return rate.rate
        except ExchangeRate.DoesNotExist:
            return None