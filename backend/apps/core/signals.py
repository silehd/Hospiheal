from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Appointment, MedicalRecord

@receiver(post_save, sender=Appointment)
def create_medical_record_on_appointment_completion(sender, instance, created, **kwargs):
    """Auto-create medical record when appointment is marked as completed"""
    if not created and instance.status == 'completed' and not hasattr(instance, 'medical_record'):
        MedicalRecord.objects.create(
            patient=instance.patient,
            doctor=instance.doctor,
            appointment=instance,
            visit_date=timezone.now(),
            diagnosis="To be updated",
            treatment_plan="To be updated"
        )