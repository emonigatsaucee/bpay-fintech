from rest_framework import serializers
from .models import Wallet, Transaction, KYCDocument


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'owner', 'currency', 'balance', 'deposit_address', 'created_at']
        read_only_fields = ['owner', 'balance', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'wallet', 'type', 'amount', 'counterparty', 'metadata', 'created_at']
        read_only_fields = ['created_at']


class KYCDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCDocument
        fields = ['id', 'user', 'document', 'doc_type', 'country', 'status', 'reviewed_by', 'reviewed_at', 'created_at']
        read_only_fields = ['user', 'status', 'reviewed_by', 'reviewed_at', 'created_at']
