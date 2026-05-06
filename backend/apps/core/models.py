from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.accounts.models import User

class Patient(models.Model):
    BLOOD_TYPE_CHOICES = (
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-')
    )
    
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other')
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile', null=True, blank=True)
    patient_id = models.CharField(max_length=20, unique=True, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPE_CHOICES, blank=True)
    email = models.EmailField()
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$')
    phone_number = models.CharField(validators=[phone_regex], max_length=17)
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact_phone = models.CharField(validators=[phone_regex], max_length=17)
    address = models.TextField()
    allergies = models.TextField(blank=True)
    chronic_diseases = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['first_name', 'last_name']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.patient_id:
            last_patient = Patient.objects.order_by('-id').first()
            if last_patient and last_patient.patient_id:
                last_num = int(last_patient.patient_id.split('-')[1])
                self.patient_id = f"PAT-{last_num + 1:06d}"
            else:
                self.patient_id = "PAT-000001"
        super().save(*args, **kwargs)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self):
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
    
    def __str__(self):
        return f"{self.patient_id} - {self.full_name}"

class Doctor(models.Model):
    SPECIALIZATION_CHOICES = (
        ('Cardiology', 'Cardiology'),
        ('Dermatology', 'Dermatology'),
        ('Neurology', 'Neurology'),
        ('Pediatrics', 'Pediatrics'),
        ('Orthopedics', 'Orthopedics'),
        ('Gynecology', 'Gynecology'),
        ('Ophthalmology', 'Ophthalmology'),
        ('ENT', 'Ear, Nose & Throat'),
        ('Psychiatry', 'Psychiatry'),
        ('Radiology', 'Radiology'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    doctor_id = models.CharField(max_length=20, unique=True, editable=False)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    qualification = models.CharField(max_length=200)
    experience_years = models.IntegerField(validators=[MinValueValidator(0)])
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    available_days = models.CharField(max_length=100, help_text="Comma-separated days (Mon, Tue, Wed, etc.)")
    available_time_start = models.TimeField()
    available_time_end = models.TimeField()
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['specialization', 'user__first_name']
    
    def save(self, *args, **kwargs):
        if not self.doctor_id:
            last_doctor = Doctor.objects.order_by('-id').first()
            if last_doctor and last_doctor.doctor_id:
                last_num = int(last_doctor.doctor_id.split('-')[1])
                self.doctor_id = f"DOC-{last_num + 1:06d}"
            else:
                self.doctor_id = "DOC-000001"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization}"

class Staff(models.Model):
    DEPARTMENT_CHOICES = (
        ('Administration', 'Administration'),
        ('Nursing', 'Nursing'),
        ('Reception', 'Reception'),
        ('Laboratory', 'Laboratory'),
        ('Pharmacy', 'Pharmacy'),
        ('Billing', 'Billing'),
        ('Maintenance', 'Maintenance'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    staff_id = models.CharField(max_length=20, unique=True, editable=False)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    position = models.CharField(max_length=100)
    joining_date = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    is_on_duty = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Staff"
        ordering = ['department', 'user__first_name']
    
    def save(self, *args, **kwargs):
        if not self.staff_id:
            last_staff = Staff.objects.order_by('-id').first()
            if last_staff and last_staff.staff_id:
                last_num = int(last_staff.staff_id.split('-')[1])
                self.staff_id = f"STF-{last_num + 1:06d}"
            else:
                self.staff_id = "STF-000001"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.staff_id} - {self.user.get_full_name()}"

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )
    
    appointment_id = models.CharField(max_length=20, unique=True, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    reason = models.TextField()
    symptoms = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_appointments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-appointment_date', '-appointment_time']
        unique_together = ['doctor', 'appointment_date', 'appointment_time']
        indexes = [
            models.Index(fields=['appointment_date', 'status']),
            models.Index(fields=['patient', 'appointment_date']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.appointment_id:
            last_appointment = Appointment.objects.order_by('-id').first()
            if last_appointment and last_appointment.appointment_id:
                last_num = int(last_appointment.appointment_id.split('-')[1])
                self.appointment_id = f"APT-{last_num + 1:06d}"
            else:
                self.appointment_id = "APT-000001"
        super().save(*args, **kwargs)
    
    def clean(self):
        if self.appointment_date < timezone.now().date():
            raise ValidationError("Appointment date cannot be in the past")
    
    def __str__(self):
        return f"{self.appointment_id} - {self.patient.full_name} with Dr. {self.doctor.user.get_full_name()}"

class MedicalRecord(models.Model):
    record_id = models.CharField(max_length=20, unique=True, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='medical_records')
    appointment = models.OneToOneField(Appointment, on_delete=models.SET_NULL, null=True, related_name='medical_record')
    visit_date = models.DateTimeField(default=timezone.now)
    diagnosis = models.TextField()
    treatment_plan = models.TextField()
    notes = models.TextField(blank=True)
    blood_pressure = models.CharField(max_length=20, blank=True)
    heart_rate = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(300)], null=True, blank=True)
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-visit_date']
        indexes = [
            models.Index(fields=['patient', 'visit_date']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.record_id:
            last_record = MedicalRecord.objects.order_by('-id').first()
            if last_record and last_record.record_id:
                last_num = int(last_record.record_id.split('-')[1])
                self.record_id = f"MR-{last_num + 1:06d}"
            else:
                self.record_id = "MR-000001"
        super().save(*args, **kwargs)
    
    @property
    def bmi(self):
        if self.weight and self.height and self.height > 0:
            return round(self.weight / ((self.height/100) ** 2), 1)
        return None
    
    def __str__(self):
        return f"{self.record_id} - {self.patient.full_name} on {self.visit_date.date()}"

class Prescription(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('dispensed', 'Dispensed'),
        ('partially_dispensed', 'Partially Dispensed'),
        ('cancelled', 'Cancelled'),
    )
    
    prescription_id = models.CharField(max_length=20, unique=True, editable=False)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='prescriptions')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='prescriptions')
    medicine_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    instructions = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    dispensed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='dispensed_prescriptions')
    dispensed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.prescription_id:
            last_prescription = Prescription.objects.order_by('-id').first()
            if last_prescription and last_prescription.prescription_id:
                last_num = int(last_prescription.prescription_id.split('-')[1])
                self.prescription_id = f"PRS-{last_num + 1:06d}"
            else:
                self.prescription_id = "PRS-000001"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.prescription_id} - {self.medicine_name} for {self.patient.full_name}"

class Billing(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('refunded', 'Refunded'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('card', 'Credit/Debit Card'),
        ('insurance', 'Insurance'),
        ('online', 'Online Payment'),
    )
    
    invoice_id = models.CharField(max_length=20, unique=True, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bills')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='bills')
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, null=True, blank=True)
    due_date = models.DateField()
    payment_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_bills')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Billings"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'payment_status']),
            models.Index(fields=['due_date']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.invoice_id:
            last_billing = Billing.objects.order_by('-id').first()
            if last_billing and last_billing.invoice_id:
                last_num = int(last_billing.invoice_id.split('-')[1])
                self.invoice_id = f"INV-{last_num + 1:06d}"
            else:
                self.invoice_id = "INV-000001"
        
        self.total_amount = self.amount + self.tax - self.discount
        
        if self.paid_amount >= self.total_amount:
            self.payment_status = 'paid'
        elif self.paid_amount > 0:
            self.payment_status = 'partial'
        
        super().save(*args, **kwargs)
    
    @property
    def remaining_amount(self):
        return self.total_amount - self.paid_amount
    
    @property
    def is_overdue(self):
        return self.due_date < timezone.now().date() and self.payment_status not in ['paid', 'refunded']
    
    def __str__(self):
        return f"{self.invoice_id} - {self.patient.full_name} - ${self.total_amount}"

class Inventory(models.Model):
    CATEGORY_CHOICES = (
        ('medicine', 'Medicine'),
        ('equipment', 'Medical Equipment'),
        ('supplies', 'Supplies'),
        ('consumables', 'Consumables'),
    )
    
    UNIT_CHOICES = (
        ('pcs', 'Pieces'),
        ('box', 'Box'),
        ('bottle', 'Bottle'),
        ('strip', 'Strip'),
        ('vial', 'Vial'),
        ('pack', 'Pack'),
    )
    
    item_id = models.CharField(max_length=20, unique=True, editable=False)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    reorder_level = models.IntegerField(default=10, validators=[MinValueValidator(0)])
    expiry_date = models.DateField(null=True, blank=True)
    manufacturer = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Inventory"
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['category', 'name']),
            models.Index(fields=['expiry_date']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.item_id:
            last_item = Inventory.objects.order_by('-id').first()
            if last_item and last_item.item_id:
                last_num = int(last_item.item_id.split('-')[1])
                self.item_id = f"INV-{last_num + 1:06d}"
            else:
                self.item_id = "INV-000001"
        super().save(*args, **kwargs)
    
    @property
    def needs_reorder(self):
        return self.quantity <= self.reorder_level
    
    def __str__(self):
        return f"{self.item_id} - {self.name} ({self.quantity} {self.unit})"

class LabTest(models.Model):
    TEST_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    RESULT_STATUS_CHOICES = (
        ('normal', 'Normal'),
        ('abnormal', 'Abnormal'),
        ('critical', 'Critical'),
    )
    
    test_id = models.CharField(max_length=20, unique=True, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='lab_tests')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='ordered_tests')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, related_name='lab_tests')
    test_name = models.CharField(max_length=200)
    test_category = models.CharField(max_length=100)
    instructions = models.TextField(blank=True)
    sample_collected_at = models.DateTimeField(null=True, blank=True)
    sample_type = models.CharField(max_length=100, blank=True)
    result = models.TextField(blank=True)
    result_status = models.CharField(max_length=20, choices=RESULT_STATUS_CHOICES, null=True, blank=True)
    reference_range = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=TEST_STATUS_CHOICES, default='pending')
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='performed_tests')
    result_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['test_name']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.test_id:
            last_test = LabTest.objects.order_by('-id').first()
            if last_test and last_test.test_id:
                last_num = int(last_test.test_id.split('-')[1])
                self.test_id = f"LAB-{last_num + 1:06d}"
            else:
                self.test_id = "LAB-000001"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.test_id} - {self.test_name} for {self.patient.full_name}"