from django.db import models

class JobDetails(models.Model):
    job_name = models.CharField(max_length=255)
    job_description = models.TextField()
    num_questions = models.IntegerField()
    job_code = models.CharField(max_length=50, unique=True, default="default_code")  # Unique constraint added
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.job_name