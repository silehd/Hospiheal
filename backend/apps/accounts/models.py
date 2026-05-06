from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator, MinLengthValidator
from django.utils import timezone
import secrets

# Define role choices at the top
ROLE_CHOICES = (
    ('admin', 'Admin'),
    ('doctor', 'Doctor'),
    ('nurse', 'Nurse'),
    ('receptionist', 'Receptionist'),
    ('lab_technician', 'Lab Technician'),
    ('pharmacist', 'Pharmacist'),
    ('accountant', 'Accountant'),
    ('staff', 'Staff'),
)

class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    address = models.TextField(blank=True)
   # profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name()} - {self.get_role_display()}"

    @property
    def is_doctor(self):
        return self.role == 'doctor'

    @property
    def is_admin_staff(self):
        return self.role == 'admin'

class PasswordResetToken(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_valid(self):
        return self.expires_at > timezone.now()

    @classmethod
    def generate_token(cls):
        return secrets.token_urlsafe(32)

    def __str__(self):
        return f"Reset token for {self.user.email}"