from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'doctor'

class IsDoctorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['doctor', 'admin']

class IsReceptionistOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['receptionist', 'admin']

class IsLabTechnicianOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['lab_technician', 'admin']

class IsPharmacistOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['pharmacist', 'admin']

class IsAccountantOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['accountant', 'admin']

class IsDoctorOrReceptionistOrAdmin(permissions.BasePermission):
    """
    Allows access to users with role doctor, receptionist, or admin.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['doctor', 'receptionist', 'admin']
    
class IsDoctorOrLabTechnicianOrAdmin(permissions.BasePermission):
    """
    Allows access to users with role doctor, lab technician, or admin.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['doctor', 'lab_technician', 'admin']