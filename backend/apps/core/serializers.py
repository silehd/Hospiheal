from rest_framework import serializers
from django.utils import timezone
from drf_spectacular.utils import extend_schema_field
from .models import (
    Patient, Doctor, Staff, Appointment, MedicalRecord,
    Prescription, Billing, Inventory, LabTest
)


class PatientSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ('id', 'patient_id', 'created_at', 'updated_at')

    def validate_email(self, value):
        if Patient.objects.filter(email=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Patient with this email already exists")
        return value

    def validate_phone_number(self, value):
        if Patient.objects.filter(phone_number=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Patient with this phone number already exists")
        return value


class DoctorSerializer(serializers.ModelSerializer):
    @extend_schema_field(serializers.CharField())
    def get_full_name(self, obj):
        return obj.user.get_full_name() if obj.user else ""

    @extend_schema_field(serializers.EmailField())
    def get_email(self, obj):
        return obj.user.email if obj.user else ""

    @extend_schema_field(serializers.CharField())
    def get_phone_number(self, obj):
        return obj.user.phone_number if obj.user else ""

    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = '__all__'
        read_only_fields = ('id', 'doctor_id', 'created_at')

    def validate_consultation_fee(self, value):
        if value < 0:
            raise serializers.ValidationError("Consultation fee cannot be negative")
        return value


class StaffSerializer(serializers.ModelSerializer):
    @extend_schema_field(serializers.CharField())
    def get_full_name(self, obj):
        return obj.user.get_full_name() if obj.user else ""

    @extend_schema_field(serializers.EmailField())
    def get_email(self, obj):
        return obj.user.email if obj.user else ""

    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = '__all__'
        read_only_fields = ('id', 'staff_id')


class AppointmentSerializer(serializers.ModelSerializer):
    @extend_schema_field(serializers.CharField())
    def get_patient_name(self, obj):
        return obj.patient.full_name if obj.patient else ""

    @extend_schema_field(serializers.CharField())
    def get_doctor_name(self, obj):
        if obj.doctor and obj.doctor.user:
            return obj.doctor.user.get_full_name()
        return ""

    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('id', 'appointment_id', 'created_at', 'updated_at')

    def validate(self, data):
        if data.get('appointment_date') and data.get('appointment_date') < timezone.now().date():
            raise serializers.ValidationError({"appointment_date": "Appointment date cannot be in the past"})

        if Appointment.objects.filter(
            doctor=data.get('doctor'),
            appointment_date=data.get('appointment_date'),
            appointment_time=data.get('appointment_time')
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("This time slot is already booked for the selected doctor")

        return data


class MedicalRecordSerializer(serializers.ModelSerializer):
    bmi = serializers.FloatField(read_only=True)

    @extend_schema_field(serializers.CharField())
    def get_patient_name(self, obj):
        return obj.patient.full_name if obj.patient else ""

    @extend_schema_field(serializers.CharField())
    def get_doctor_name(self, obj):
        if obj.doctor and obj.doctor.user:
            return obj.doctor.user.get_full_name()
        return ""

    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = ('id', 'record_id', 'created_at', 'updated_at', 'bmi')

    def validate_heart_rate(self, value):
        if value and (value < 30 or value > 250):
            raise serializers.ValidationError("Heart rate must be between 30 and 250")
        return value

    def validate_temperature(self, value):
        if value and (value < 30 or value > 45):
            raise serializers.ValidationError("Temperature must be between 30°C and 45°C")
        return value


class PrescriptionSerializer(serializers.ModelSerializer):
    @extend_schema_field(serializers.CharField())
    def get_patient_name(self, obj):
        return obj.patient.full_name if obj.patient else ""

    @extend_schema_field(serializers.CharField())
    def get_doctor_name(self, obj):
        if obj.doctor and obj.doctor.user:
            return obj.doctor.user.get_full_name()
        return ""

    @extend_schema_field(serializers.CharField())
    def get_dispensed_by_name(self, obj):
        return obj.dispensed_by.get_full_name() if obj.dispensed_by else ""

    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    dispensed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = '__all__'
        read_only_fields = ('id', 'prescription_id', 'created_at')

    def validate(self, data):
        if data.get('status') == 'dispensed' and not data.get('dispensed_by'):
            raise serializers.ValidationError({"dispensed_by": "Dispensed by is required when status is dispensed"})
        return data


class BillingSerializer(serializers.ModelSerializer):
    remaining_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    @extend_schema_field(serializers.CharField())
    def get_patient_name(self, obj):
        return obj.patient.full_name if obj.patient else ""

    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Billing
        fields = '__all__'
        read_only_fields = ('id', 'invoice_id', 'total_amount', 'created_at', 'updated_at', 'remaining_amount', 'is_overdue')

    def validate(self, data):
        if data.get('paid_amount', 0) > (data.get('amount', 0) + data.get('tax', 0) - data.get('discount', 0)):
            raise serializers.ValidationError({"paid_amount": "Paid amount cannot exceed total amount"})

        if data.get('due_date') and data.get('due_date') < timezone.now().date():
            raise serializers.ValidationError({"due_date": "Due date cannot be in the past"})

        return data


class InventorySerializer(serializers.ModelSerializer):
    needs_reorder = serializers.BooleanField(read_only=True)

    class Meta:
        model = Inventory
        fields = '__all__'
        read_only_fields = ('id', 'item_id', 'created_at', 'updated_at', 'needs_reorder')

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative")
        return value

    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Unit price cannot be negative")
        return value


class LabTestSerializer(serializers.ModelSerializer):
    @extend_schema_field(serializers.CharField())
    def get_patient_name(self, obj):
        return obj.patient.full_name if obj.patient else ""

    @extend_schema_field(serializers.CharField())
    def get_doctor_name(self, obj):
        if obj.doctor and obj.doctor.user:
            return obj.doctor.user.get_full_name()
        return ""

    @extend_schema_field(serializers.CharField())
    def get_performed_by_name(self, obj):
        return obj.performed_by.get_full_name() if obj.performed_by else ""

    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = LabTest
        fields = '__all__'
        read_only_fields = ('id', 'test_id', 'created_at', 'updated_at')

    def validate(self, data):
        if data.get('status') == 'completed' and not data.get('result'):
            raise serializers.ValidationError({"result": "Result is required when test is completed"})
        return data