from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AdminResetPasswordView, CustomTokenObtainPairView, LogoutView, PasswordResetConfirmView, PasswordResetRequestView, UserListCreateView, 
    UserDetailView, ChangePasswordView, CurrentUserView
)

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('users/', UserListCreateView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('users/<int:pk>/reset-password/', AdminResetPasswordView.as_view(), name='admin-reset-password'),
]
