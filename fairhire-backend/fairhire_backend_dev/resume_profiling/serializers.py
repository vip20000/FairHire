# serializers.py
from rest_framework import serializers
from .models import Candidate

class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = ['id', 'name', 'email', 'phone', 'skills', 'proctoring_flag', 'score', 'violation_reasons', 'qadetails']
