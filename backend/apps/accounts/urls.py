from django.urls import path
from .views import (
    CustomTokenObtainPairView,
    LogoutView,
    UserListCreateView,
    UserDetailView,
    ChangePasswordView,
    CurrentUserView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    # Authentication
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', CustomTokenObtainPairView.as_view(), name='token_refresh'),  # if you have a refresh view, otherwise use the built-in one
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # User management
    path('users/', UserListCreateView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    # Password management
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    
    # Password reset
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]