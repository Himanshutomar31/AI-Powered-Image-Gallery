from rest_framework import serializers
from .models import Image
from .services import generate_image_caption
import base64
import binascii
from django.core.files.base import ContentFile
import uuid


class Base64ImageField(serializers.ImageField):
    """
    A custom serializer field to handle base64-encoded image input.
    """
    def to_internal_value(self, data):
        # Check if this is a base64 string
        if isinstance(data, str) and data.startswith('data:image'):
            try:
                format, imgstr = data.split(';base64,') 
                ext = format.split('/')[-1] 
                decoded_file = base64.b64decode(imgstr)
            except (TypeError, ValueError, binascii.Error) as e:
                raise serializers.ValidationError("Invalid image format or corrupt data.")
            
            file_name = f"{uuid.uuid4()}.{ext}"
            data = ContentFile(decoded_file, name=file_name)
        return super().to_internal_value(data)


class ImageSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    image = Base64ImageField(max_length=None, use_url=True)

    class Meta:
        model = Image
        fields = ['id', 'owner', 'image', 'caption', 'uploaded_at', 'status']
        read_only_fields = ('uploaded_at', 'status', 'owner')

    def create(self, validated_data):
        image_instance = Image.objects.create(**validated_data)
        image_path = image_instance.image.path
        
        try:
            image_instance.status = Image.ProcessingStatus.PROCESSING
            image_instance.save()
            
            # Call the AI service 
            caption = generate_image_caption(image_path)
            
            if caption:
                image_instance.caption = caption
                image_instance.status = Image.ProcessingStatus.COMPLETED
            else:
                image_instance.status = Image.ProcessingStatus.FAILED
            
            image_instance.save()
            
        except Exception as e:
            image_instance.status = Image.ProcessingStatus.FAILED
            image_instance.save()
            print(f"Caption generation failed: {e}")

        return image_instance