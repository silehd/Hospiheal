from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F, Sum
from django.utils import timezone
from datetime import timedelta
from .models import (
    Patient, Doctor, Staff, Appointment, MedicalRecord,
    Prescription, Billing, Inventory, LabTest
)
from .serializers import (
    PatientSerializer, DoctorSerializer, StaffSerializer,
    AppointmentSerializer, MedicalRecordSerializer, PrescriptionSerializer,
    BillingSerializer, InventorySerializer, LabTestSerializer
)
from .pagination import CustomPagination
from apps.accounts.permissions import (
    IsAdmin, IsDoctor, IsDoctorOrAdmin, IsDoctorOrLabTechnicianOrAdmin, IsReceptionistOrAdmin,
    IsDoctorOrReceptionistOrAdmin, IsLabTechnicianOrAdmin,
    IsPharmacistOrAdmin, IsAccountantOrAdmin
)

# ----------------------------------------------------------------------
# Patient Views
# ----------------------------------------------------------------------
class PatientListCreateView(generics.ListCreateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'blood_type', 'is_active']
    search_fields = ['first_name', 'last_name', 'patient_id', 'email', 'phone_number']
    ordering_fields = ['created_at', 'first_name', 'last_name']

    def get_permissions(self):
        if self.request.method in ['GET', 'POST']:
            return [IsDoctorOrReceptionistOrAdmin()]
        return [IsDoctorOrAdmin()]

class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdmin()]
        return [IsDoctorOrAdmin()]

# ----------------------------------------------------------------------
# Doctor Views
# ----------------------------------------------------------------------
class DoctorListCreateView(generics.ListCreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialization', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'doctor_id', 'specialization']
    ordering_fields = ['consultation_fee', 'experience_years']

    def get_permissions(self):
        if self.request.method == 'GET':
            # Allow receptionists to view doctor list
            return [IsDoctorOrReceptionistOrAdmin()]
        # POST remains admin-only
        return [IsAdmin()]

class DoctorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdmin()]
        return [IsDoctorOrAdmin()]

# ----------------------------------------------------------------------
# Staff Views
# ----------------------------------------------------------------------
class StaffListCreateView(generics.ListCreateAPIView):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    pagination_class = CustomPagination
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'is_on_duty']
    search_fields = ['user__first_name', 'user__last_name', 'staff_id']

class StaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [IsAdmin]

# ----------------------------------------------------------------------
# Appointment Views
# ----------------------------------------------------------------------
class AppointmentListCreateView(generics.ListCreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'doctor', 'appointment_date']
    search_fields = ['patient__first_name', 'patient__last_name', 'appointment_id']
    ordering_fields = ['appointment_date', 'appointment_time']

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsDoctorOrReceptionistOrAdmin()]          # receptionists can view
        elif self.request.method == 'POST':
            return [IsDoctorOrReceptionistOrAdmin()]  # doctors, receptionists, admins can create
        return [IsDoctorOrAdmin()]  

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdmin()]
        return [IsDoctorOrAdmin()]

class TodayAppointmentsView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        today = timezone.now().date()
        return Appointment.objects.filter(appointment_date=today).order_by('appointment_time')

# ----------------------------------------------------------------------
# Medical Record Views
# ----------------------------------------------------------------------
class MedicalRecordListCreateView(generics.ListCreateAPIView):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['patient', 'doctor']
    search_fields = ['record_id', 'diagnosis']

    def get_permissions(self):
        return [IsDoctorOrAdmin()]

class MedicalRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsDoctorOrAdmin]

class PatientMedicalRecordsView(generics.ListAPIView):
    serializer_class = MedicalRecordSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        if patient_id is None:
            return MedicalRecord.objects.none()
        return MedicalRecord.objects.filter(patient_id=patient_id).order_by('-visit_date')

    def get_permissions(self):
        return [IsDoctorOrAdmin()]

# ----------------------------------------------------------------------
# Prescription Views
# ----------------------------------------------------------------------
class PrescriptionListCreateView(generics.ListCreateAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'patient', 'medical_record']
    search_fields = ['prescription_id', 'medicine_name']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsDoctorOrAdmin()]
        return [IsPharmacistOrAdmin()]

class PrescriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdmin()]
        return [IsDoctorOrAdmin()]

class DispensePrescriptionView(APIView):
    permission_classes = [IsPharmacistOrAdmin]

    def post(self, request, pk):
        try:
            prescription = Prescription.objects.get(pk=pk)
            if prescription.status == 'pending':
                prescription.status = 'dispensed'
                prescription.dispensed_by = request.user
                prescription.dispensed_at = timezone.now()
                prescription.save()
                return Response({"message": "Prescription dispensed successfully"}, status=status.HTTP_200_OK)
            return Response({"error": "Prescription cannot be dispensed"}, status=status.HTTP_400_BAD_REQUEST)
        except Prescription.DoesNotExist:
            return Response({"error": "Prescription not found"}, status=status.HTTP_404_NOT_FOUND)

# ----------------------------------------------------------------------
# Billing Views
# ----------------------------------------------------------------------
class BillingListCreateView(generics.ListCreateAPIView):
    queryset = Billing.objects.all()
    serializer_class = BillingSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['payment_status', 'patient']
    search_fields = ['invoice_id', 'patient__first_name', 'patient__last_name']
    ordering_fields = ['created_at', 'due_date']

    def get_permissions(self):
        return [IsAccountantOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class BillingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Billing.objects.all()
    serializer_class = BillingSerializer
    permission_classes = [IsAccountantOrAdmin]

# ----------------------------------------------------------------------
# Inventory Views
# ----------------------------------------------------------------------
class InventoryListCreateView(generics.ListCreateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'item_id', 'manufacturer']
    ordering_fields = ['name', 'quantity', 'expiry_date']
    permission_classes = [IsAdmin]

class InventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAdmin]

class LowStockItemsView(generics.ListAPIView):
    serializer_class = InventorySerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Inventory.objects.filter(quantity__lte=F('reorder_level'))

# ----------------------------------------------------------------------
# Lab Test Views
# ----------------------------------------------------------------------
class LabTestListCreateView(generics.ListCreateAPIView):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'patient', 'doctor']
    search_fields = ['test_id', 'test_name']

    def get_permissions(self):
        if self.request.method == 'GET':
            # Allow doctors, lab technicians, and admins to view lab tests
            return [IsDoctorOrLabTechnicianOrAdmin()]
        elif self.request.method == 'POST':
            # Doctors and admins can order new tests
            return [IsDoctorOrAdmin()]
        # Other methods (PUT, PATCH, DELETE) only for lab techs/admins
        return [IsLabTechnicianOrAdmin()]

class LabTestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdmin()]
        return [IsLabTechnicianOrAdmin()]

class UpdateLabTestResultView(APIView):
    permission_classes = [IsLabTechnicianOrAdmin]

    def patch(self, request, pk):
        try:
            lab_test = LabTest.objects.get(pk=pk)
            result = request.data.get('result')
            result_status = request.data.get('result_status')
            if result:
                lab_test.result = result
                lab_test.result_status = result_status
                lab_test.status = 'completed'
                lab_test.performed_by = request.user
                lab_test.result_date = timezone.now()
                lab_test.save()
                return Response({"message": "Lab test result updated"}, status=status.HTTP_200_OK)
            return Response({"error": "Result is required"}, status=status.HTTP_400_BAD_REQUEST)
        except LabTest.DoesNotExist:
            return Response({"error": "Lab test not found"}, status=status.HTTP_404_NOT_FOUND)

# ----------------------------------------------------------------------
# Dashboard Stats View
# ----------------------------------------------------------------------
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        revenue_today = Billing.objects.filter(
            created_at__date=today,
            payment_status='paid'
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        stats = {
            'total_patients': Patient.objects.count(),
            'total_doctors': Doctor.objects.count(),
            'total_appointments_today': Appointment.objects.filter(appointment_date=today).count(),
            'pending_appointments': Appointment.objects.filter(status='scheduled', appointment_date=today).count(),
            'total_bills_today': Billing.objects.filter(created_at__date=today).count(),
            'revenue_today': revenue_today,
            'pending_prescriptions': Prescription.objects.filter(status='pending').count(),
            'pending_lab_tests': LabTest.objects.filter(status='pending').count(),
            'low_stock_items': Inventory.objects.filter(quantity__lte=F('reorder_level')).count(),
            'overdue_bills': Billing.objects.filter(
                due_date__lt=today,
                payment_status__in=['pending', 'partial']
            ).count(),
        }
        return Response(stats)