from django.contrib.auth import get_user_model
from core.models import Wallet, Transaction
from decimal import Decimal

User = get_user_model()

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'adminpass')

for username, email, password in [
    ('alice', 'alice@example.com', 'alicepass'),
    ('bob', 'bob@example.com', 'bobpass'),
]:
    u, created = User.objects.get_or_create(username=username, defaults={'email': email})
    u.set_password(password)
    u.save()

def create_wallet(user, currency, balance):
    w, created = Wallet.objects.get_or_create(owner=user, currency=currency, defaults={'balance': Decimal(str(balance))})
    if not created:
        w.balance = Decimal(str(balance))
        w.save()
    return w

alice = User.objects.get(username='alice')
bob = User.objects.get(username='bob')

create_wallet(alice, 'NGN', 10000)
create_wallet(alice, 'BTC', Decimal('0.05'))
create_wallet(bob, 'KES', 5000)
create_wallet(bob, 'BTC', Decimal('0.01'))

# sample transfer: alice -> bob 0.005 BTC
w_alice_btc = Wallet.objects.get(owner=alice, currency='BTC')
w_bob_btc = Wallet.objects.get(owner=bob, currency='BTC')
Transaction.objects.create(wallet=w_alice_btc, type='TRANSFER', amount=Decimal('0.005'), counterparty='bob', metadata={'to_wallet': w_bob_btc.id})
w_alice_btc.balance -= Decimal('0.005')
w_alice_btc.save()
w_bob_btc.balance += Decimal('0.005')
w_bob_btc.save()

print('Seed complete: admin/alice/bob created with wallets.')
