from django.urls import path
from .views import (
    PatientListCreateView,
    PatientDetailView,
    DoctorListCreateView,
    DoctorDetailView,
    StaffListCreateView,
    StaffDetailView,
    AppointmentListCreateView,
    AppointmentDetailView,
    TodayAppointmentsView,
    MedicalRecordListCreateView,
    MedicalRecordDetailView,
    PatientMedicalRecordsView,
    PrescriptionListCreateView,
    PrescriptionDetailView,
    DispensePrescriptionView,
    BillingListCreateView,
    BillingDetailView,
    InventoryListCreateView,
    InventoryDetailView,
    LowStockItemsView,
    LabTestListCreateView,
    LabTestDetailView,
    UpdateLabTestResultView,
    DashboardStatsView,
)

urlpatterns = [
    # Patient URLs
    path('patients/', PatientListCreateView.as_view(), name='patient-list'),
    path('patients/<int:pk>/', PatientDetailView.as_view(), name='patient-detail'),
    path('patients/<int:patient_id>/medical-records/', PatientMedicalRecordsView.as_view(), name='patient-medical-records'),
    
    # Doctor URLs
    path('doctors/', DoctorListCreateView.as_view(), name='doctor-list'),
    path('doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    
    # Staff URLs
    path('staff/', StaffListCreateView.as_view(), name='staff-list'),
    path('staff/<int:pk>/', StaffDetailView.as_view(), name='staff-detail'),
    
    # Appointment URLs
    path('appointments/', AppointmentListCreateView.as_view(), name='appointment-list'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('appointments/today/', TodayAppointmentsView.as_view(), name='appointments-today'),
    
    # Medical Record URLs
    path('medical-records/', MedicalRecordListCreateView.as_view(), name='medical-record-list'),
    path('medical-records/<int:pk>/', MedicalRecordDetailView.as_view(), name='medical-record-detail'),
    
    # Prescription URLs
    path('prescriptions/', PrescriptionListCreateView.as_view(), name='prescription-list'),
    path('prescriptions/<int:pk>/', PrescriptionDetailView.as_view(), name='prescription-detail'),
    path('prescriptions/<int:pk>/dispense/', DispensePrescriptionView.as_view(), name='dispense-prescription'),
    
    # Billing URLs
    path('bills/', BillingListCreateView.as_view(), name='billing-list'),
    path('bills/<int:pk>/', BillingDetailView.as_view(), name='billing-detail'),
    
    # Inventory URLs
    path('inventory/', InventoryListCreateView.as_view(), name='inventory-list'),
    path('inventory/<int:pk>/', InventoryDetailView.as_view(), name='inventory-detail'),
    path('inventory/low-stock/', LowStockItemsView.as_view(), name='low-stock-items'),
    
    # Lab Test URLs
    path('lab-tests/', LabTestListCreateView.as_view(), name='labtest-list'),
    path('lab-tests/<int:pk>/', LabTestDetailView.as_view(), name='labtest-detail'),
    path('lab-tests/<int:pk>/update-result/', UpdateLabTestResultView.as_view(), name='update-labtest-result'),
    
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]