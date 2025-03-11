from django.db import models

class Candidate(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    skills = models.TextField()
    proctoring_flag = models.BooleanField(default=False)  # Flag for proctoring violations
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    violation_reasons = models.JSONField(default=dict, blank=True)  # New field to store violation reasons
    qadetails = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.name