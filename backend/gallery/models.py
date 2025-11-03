from django.db import models
from django.contrib.auth.models import User

class Image(models.Model):
    """
    Stores image metadata, including the file path, AI-generated caption,
    and the user who uploaded it. 
    """
    class ProcessingStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='user_images/') 
    caption = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=ProcessingStatus.choices,
        default=ProcessingStatus.PENDING
    )

    def __str__(self):
        return f"Image by {self.owner.username} at {self.uploaded_at.strftime('%Y-%m-%d')}"