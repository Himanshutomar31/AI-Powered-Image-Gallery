from django.urls import path
from .views import RegisterView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Endpoint for user registration 
    path('register/', RegisterView.as_view(), name='auth_register'),
    
    # Endpoints for JWT token management 
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Logout is handled client-side by deleting the token.
]