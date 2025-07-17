from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import TransportModel, PackagingType, ServiceType, DeliveryStatus, Delivery, TechState

@admin.register(Delivery)
class DeliveryAdmin(ImportExportModelAdmin):
    pass

admin.site.register(TransportModel)
admin.site.register(PackagingType)
admin.site.register(ServiceType)
admin.site.register(DeliveryStatus)
admin.site.register(TechState)

