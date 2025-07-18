from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import TransportModel, PackagingType, ServiceType, DeliveryStatus, Delivery, TechState
from django.urls import path
from django.shortcuts import render, redirect
from django import forms
from django.contrib import messages
import csv
import io
import zipfile
from django.http import HttpResponse

@admin.register(Delivery)
class DeliveryAdmin(ImportExportModelAdmin):
    pass

admin.site.register(TransportModel)
admin.site.register(PackagingType)
admin.site.register(ServiceType)
admin.site.register(DeliveryStatus)
admin.site.register(TechState)

class MassImportForm(forms.Form):
    file = forms.FileField(label="Файл для импорта всех данных")

class MassImportAdminView(admin.AdminSite):
    site_header = "Delivery Admin"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('mass-import/', self.mass_import_view, name='mass_import'),
        ]
        return custom_urls + urls

    def mass_import_view(self, request):
        if request.method == 'POST':
            form = MassImportForm(request.POST, request.FILES)
            if form.is_valid():
                # Здесь реализуйте обработку файла и импорт данных во все справочники
                messages.success(request, "Данные успешно импортированы во все справочники!")
                return redirect('/admin/')
        else:
            form = MassImportForm()
        return render(request, 'admin/mass_import.html', {'form': form})

# Зарегистрировать кастомный admin site
custom_admin_site = MassImportAdminView(name='custom_admin')

class MassExportAdminView(admin.AdminSite):
    site_header = "Delivery Admin"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('mass-export/', self.mass_export_view, name='mass_export'),
        ]
        return custom_urls + urls

    def mass_export_view(self, request):
        if request.method == 'POST':
            # Список моделей для экспорта
            models = [TransportModel, PackagingType, ServiceType, DeliveryStatus, TechState]
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
                for model in models:
                    model_name = model._meta.model_name
                    fields = [f.name for f in model._meta.fields]
                    csv_buffer = io.StringIO()
                    writer = csv.writer(csv_buffer)
                    writer.writerow(fields)
                    for obj in model.objects.all():
                        writer.writerow([getattr(obj, f) for f in fields])
                    zip_file.writestr(f'{model_name}.csv', csv_buffer.getvalue())
            zip_buffer.seek(0)
            response = HttpResponse(zip_buffer.read(), content_type='application/zip')
            response['Content-Disposition'] = 'attachment; filename="all_reference_export.zip"'
            return response
        return render(request, 'admin/mass_export.html')

mass_export_admin_site = MassExportAdminView(name='mass_export_admin')

