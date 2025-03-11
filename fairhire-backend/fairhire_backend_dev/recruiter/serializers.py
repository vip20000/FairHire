from rest_framework import serializers
from .models import JobDetails

class JobDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDetails
        fields = "__all__"
