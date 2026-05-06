from pytz import timezone
from rest_framework import generics, serializers, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer, ChangePasswordSerializer
from .permissions import IsAdmin
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
from .models import PasswordResetToken
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = authenticate(email=request.data.get('email'), password=request.data.get('password'))
            if user:
                response.data['user'] = UserSerializer(user).data
        return response

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # ← class, not instance
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdmin]  # ← class
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # ← class
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": "Wrong password"}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # ← class
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "If the email exists, a reset link has been sent."}, status=status.HTTP_200_OK)

        PasswordResetToken.objects.filter(user=user).delete()
        token = PasswordResetToken.generate_token()
        expires_at = timezone.now() + timedelta(hours=1)
        PasswordResetToken.objects.create(user=user, token=token, expires_at=expires_at)

        reset_link = f"{request.build_absolute_uri('/')[:-1]}/reset-password?token={token}"
        if settings.DEBUG:
            print(f"Reset link for {email}: {reset_link}")
        else:
            send_mail(
                subject='Password Reset Request',
                message=f'Click the link to reset your password: {reset_link}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        return Response({"message": "If the email exists, a reset link has been sent."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            reset_token = PasswordResetToken.objects.get(token=token)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({"token": "Invalid or expired token."})

        if not reset_token.is_valid():
            reset_token.delete()
            raise serializers.ValidationError({"token": "Token has expired."})

        user = reset_token.user
        user.set_password(new_password)
        user.save()
        reset_token.delete()
        return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)
    
class AdminResetPasswordView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        new_password = request.data.get('new_password')
        if not new_password or len(new_password) < 6:
            return Response({"error": "Password must be at least 6 characters"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)