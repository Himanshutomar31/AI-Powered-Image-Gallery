from rest_framework import generics, permissions, pagination
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Image
from .serializers import ImageSerializer

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

class StandardResultsPagination(pagination.PageNumberPagination):
    """
    Custom pagination class for the gallery view. [cite: 11]
    """
    page_size = 10
    page_size_query_param = 'pageSize'
    max_page_size = 100

class ImageGalleryView(generics.ListCreateAPIView):
    """
    API endpoint for uploading images and viewing the user's gallery.
    - POST: Upload a new image. 
    - GET: List all images for the logged-in user. 
    """
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsPagination
    
    # Add filtering and searching 
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['caption'] 
    ordering_fields = ['uploaded_at'] 

    def get_queryset(self):
        """
        This view should only return images owned by the authenticated user. 
        """
        return Image.objects.filter(owner=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        """
        Associate the uploaded image with the logged-in user. 
        """
        serializer.save(owner=self.request.user)

class ImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for viewing, updating (e.g., editing caption), 
    and deleting a single image. [cite: 10]
    """
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner] 
    
    def get_queryset(self):
        """
        Ensures users can only access their own images.
        """
        return Image.objects.filter(owner=self.request.user)