from django.urls import path
from .views import ImageGalleryView, ImageDetailView

urlpatterns = [
    path('gallery/', ImageGalleryView.as_view(), name='image-gallery'),
    path('gallery/<int:pk>/', ImageDetailView.as_view(), name='image-detail'),
]